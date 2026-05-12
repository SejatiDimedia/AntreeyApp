import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  updateDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';
const toMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
};

const addMinutes = (hhmm, durationMinutes) => {
  const start = toMinutes(hhmm);
  const duration = Number(durationMinutes || 0);
  if (start == null || duration <= 0) return null;
  const end = start + duration;
  const h = Math.floor(end / 60);
  const m = end % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const isOverlap = (newStart, newEnd, existingStart, existingEnd) =>
  newStart < existingEnd && newEnd > existingStart;

const hasAnyIntersection = (arrA = [], arrB = []) => {
  if (!Array.isArray(arrA) || !Array.isArray(arrB) || arrA.length === 0 || arrB.length === 0) return false;
  const setB = new Set(arrB);
  return arrA.some((item) => setB.has(item));
};

const hasSharedConstraint = (incoming, existing) => {
  const incomingService = incoming.serviceId || '';
  const existingService = existing.serviceId || '';
  const sameService = incomingService && existingService && incomingService === existingService;

  const incomingResources = incoming.resourceIds || [];
  const existingResources = existing.resourceIds || [];
  const sameResource = hasAnyIntersection(incomingResources, existingResources);

  const incomingStaff = incoming.staffId || 'any';
  const existingStaff = existing.staffId || 'any';
  const sameSpecificStaff = incomingStaff !== 'any' && existingStaff !== 'any' && incomingStaff === existingStaff;

  // If neither booking defines staff/resource constraints, fall back to global conflict behavior.
  const noExplicitConstraint =
    incomingResources.length === 0 &&
    existingResources.length === 0 &&
    incomingStaff === 'any' &&
    existingStaff === 'any';

  return sameService || sameResource || sameSpecificStaff || noExplicitConstraint;
};

export const BookingRepository = {
  /**
   * Create a new booking
   */
  async createBooking(businessId, bookingData) {
    try {
      const dateValue = bookingData.date;
      const timeSlotValue = bookingData.timeSlot;
      const durationValue = Number(bookingData.durationMinutes || bookingData.duration || 30);
      const endTimeSlotValue = bookingData.endTimeSlot || addMinutes(timeSlotValue, durationValue);
      const newStart = toMinutes(timeSlotValue);
      const newEnd = toMinutes(endTimeSlotValue);
      let queuePosition = 1;
      if (dateValue) {
        const existingQuery = query(
          collection(db, `businesses/${businessId}/bookings`),
          where('date', '==', dateValue)
        );
        const existingSnapshot = await getDocs(existingQuery);
        let maxQueue = 0;
        let isSlotAlreadyTaken = false;
        existingSnapshot.forEach((item) => {
          const data = item.data() || {};
          const value = Number(data.queuePosition || 0);
          if (value > maxQueue) maxQueue = value;
          const activeStatus = data.status !== 'cancelled' && data.status !== 'completed';
          const existingStart = toMinutes(data.timeSlot);
          const existingEnd = toMinutes(data.endTimeSlot || addMinutes(data.timeSlot, Number(data.durationMinutes || data.duration || 30)));
          const hasConflict = activeStatus && newStart != null && newEnd != null && existingStart != null && existingEnd != null
            ? (hasSharedConstraint(bookingData, data) && isOverlap(newStart, newEnd, existingStart, existingEnd))
            : (data.timeSlot === timeSlotValue && activeStatus);
          if (hasConflict) {
            isSlotAlreadyTaken = true;
          }
        });

        if (isSlotAlreadyTaken) {
          const duplicateError = new Error('This time slot is already booked by another customer.');
          duplicateError.code = 'booking/conflict';
          throw duplicateError;
        }

        queuePosition = maxQueue + 1;
      }

      const docRef = await addDoc(collection(db, `businesses/${businessId}/bookings`), {
        ...bookingData,
        durationMinutes: durationValue,
        endTimeSlot: endTimeSlotValue,
        queuePosition,
        businessId,
        createdAt: new Date().toISOString(),
        status: 'pending' // pending, confirmed, completed, cancelled
      });
      return { id: docRef.id, ...bookingData, queuePosition };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },
  async createWalkInBooking(businessId, bookingData) {
    return this.createBooking(businessId, {
      ...bookingData,
      type: 'walkin',
      status: bookingData.status || 'confirmed'
    });
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(businessId, bookingId, status) {
    try {
      const bookingRef = doc(db, `businesses/${businessId}/bookings`, bookingId);
      await updateDoc(bookingRef, { status });
      return { success: true };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  /**
   * Subscribe to today's bookings for the Admin Dashboard (Real-time)
   */
  subscribeToTodaysBookings(businessId, dateStr, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      where('date', '==', dateStr),
      orderBy('timeSlot', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(bookings);
    }, (error) => {
      console.error('Error listening to bookings:', error);
    });
  }
  ,
  subscribeToCustomerBookings(businessId, customerId, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      where('customerId', '==', customerId)
    );

    return onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => {
          const aDate = `${a.date || ''} ${a.timeSlot || ''}`;
          const bDate = `${b.date || ''} ${b.timeSlot || ''}`;
          return bDate.localeCompare(aDate);
        });
      callback(rows);
    }, (error) => {
      console.error('Error listening customer bookings:', error);
      callback([]);
    });
  },

  subscribeToAllBookings(businessId, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      callback(rows);
    }, (error) => {
      console.error('Error listening all bookings:', error);
      callback([]);
    });
  },

  subscribeToNowServing(businessId, dateStr, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      where('date', '==', dateStr),
      where('status', '==', 'confirmed'),
      orderBy('queuePosition', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      const first = snapshot.docs[0];
      callback({ id: first.id, ...first.data() });
    }, (error) => {
      console.error('Error listening now serving:', error);
      callback(null);
    });
  },

  subscribeToBookedTimeSlots(businessId, dateStr, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      where('date', '==', dateStr)
    );

    return onSnapshot(q, (snapshot) => {
      const taken = new Set();
      snapshot.docs.forEach((item) => {
        const data = item.data() || {};
        const isActive = data.status !== 'cancelled' && data.status !== 'completed';
        if (isActive && data.timeSlot) {
          taken.add(data.timeSlot);
        }
      });
      callback(Array.from(taken));
    }, (error) => {
      console.error('Error listening booked slots:', error);
      callback([]);
    });
  },

  subscribeToActiveBookingsByDate(businessId, dateStr, callback) {
    const q = query(
      collection(db, `businesses/${businessId}/bookings`),
      where('date', '==', dateStr)
    );

    return onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.status !== 'cancelled' && item.status !== 'completed');
      callback(rows);
    }, (error) => {
      console.error('Error listening active bookings by date:', error);
      callback([]);
    });
  }
};
