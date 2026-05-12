import React, { useState, useEffect } from 'react';
import { BookingRepository } from '../../repositories/BookingRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useAuth } from '../../context/AuthContext';

const buildUpcomingDates = (count = 7) => {
  const items = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    items.push({
      day: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: String(d.getDate()),
      fullDate: `${yyyy}-${mm}-${dd}`,
      active: i === 0
    });
  }
  return items;
};

const defaultTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

const toMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
};

const toHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const buildRangeSlots = (start, end, intervalMinutes) => {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const step = Number(intervalMinutes) > 0 ? Number(intervalMinutes) : 60;
  if (startMin == null || endMin == null || endMin <= startMin) return [];
  const slots = [];
  for (let cur = startMin; cur <= endMin; cur += step) {
    slots.push(toHHMM(cur));
  }
  return slots;
};

const getServiceTimeSlots = (service) => {
  if (!service) return defaultTimeSlots;
  if (Array.isArray(service.availableTimeSlots) && service.availableTimeSlots.length > 0) {
    return service.availableTimeSlots;
  }
  const slotsFromWindow = buildRangeSlots(
    service.availableStartTime,
    service.availableEndTime,
    service.slotIntervalMinutes || service.durationMinutes || 60
  );
  return slotsFromWindow.length > 0 ? slotsFromWindow : defaultTimeSlots;
};
const isStaffAvailableAt = (staff, dateStr, timeSlot) => {
  if (!staff) return false;
  const availability = staff.availability || {};
  const workingDays = Array.isArray(availability.workingDays) ? availability.workingDays : [0, 1, 2, 3, 4, 5, 6];
  const dayIdx = new Date(`${dateStr}T00:00:00`).getDay();
  if (!workingDays.includes(dayIdx)) return false;
  const start = toMinutes(availability.startTime || '00:00');
  const end = toMinutes(availability.endTime || '23:59');
  const slot = toMinutes(timeSlot);
  if (start == null || end == null || slot == null) return true;
  return slot >= start && slot <= end;
};

export const BookingFlowPage = ({ businessId, service, onBack, onConfirm }) => {
  const { currentUser, userProfile } = useAuth();
  const dates = buildUpcomingDates(7);
  const [selectedDate, setSelectedDate] = useState(dates[0].fullDate);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeBookings, setActiveBookings] = useState([]);
  const timeSlots = getServiceTimeSlots(service);
  const todayDate = buildUpcomingDates(1)[0].fullDate;
  const now = new Date();
  const isToday = selectedDate === now.toISOString().split('T')[0];
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  const isPastSlot = (time) => {
    if (!isToday) return false;
    const minutes = toMinutes(time);
    if (minutes == null) return true;
    return minutes <= currentMinutes;
  };

  const getEndTime = (startHHMM, minutes) => {
    const start = toMinutes(startHHMM);
    const duration = Number(minutes || 0);
    if (start == null || duration <= 0) return null;
    return start + duration;
  };

  const isOverlapping = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;
  const hasAnyIntersection = (arrA = [], arrB = []) => {
    if (!Array.isArray(arrA) || !Array.isArray(arrB) || arrA.length === 0 || arrB.length === 0) return false;
    const setB = new Set(arrB);
    return arrA.some((item) => setB.has(item));
  };
  const hasSharedConstraint = (candidate, existing) => {
    const sameService = candidate.serviceId && existing.serviceId && candidate.serviceId === existing.serviceId;
    const sameResource = hasAnyIntersection(candidate.resourceIds || [], existing.resourceIds || []);
    const candidateStaff = candidate.staffId || 'any';
    const existingStaff = existing.staffId || 'any';
    const sameSpecificStaff = candidateStaff !== 'any' && existingStaff !== 'any' && candidateStaff === existingStaff;
    const noExplicitConstraint =
      (!candidate.resourceIds || candidate.resourceIds.length === 0) &&
      (!existing.resourceIds || existing.resourceIds.length === 0) &&
      candidateStaff === 'any' &&
      existingStaff === 'any';
    return sameService || sameResource || sameSpecificStaff || noExplicitConstraint;
  };

  const isBookedByRange = (slotStartHHMM) => {
    const slotDuration = Number(service?.durationMinutes || service?.duration || 30);
    const slotStart = toMinutes(slotStartHHMM);
    const slotEnd = getEndTime(slotStartHHMM, slotDuration);
    if (slotStart == null || slotEnd == null) return true;

    return activeBookings.some((item) => {
      const bStart = toMinutes(item.timeSlot);
      const bDuration = Number(item.durationMinutes || item.duration || 30);
      const bEnd = toMinutes(item.endTimeSlot) ?? getEndTime(item.timeSlot, bDuration);
      if (bStart == null || bEnd == null) return false;
      return hasSharedConstraint(
        {
          serviceId: service?.id || '',
          staffId: selectedStaff?.id || 'any',
          resourceIds: service?.resourceIds || []
        },
        item
      ) && isOverlapping(slotStart, slotEnd, bStart, bEnd);
    });
  };
  const availableStaffList = staffList.filter((member) => isStaffAvailableAt(member, selectedDate, selectedTime || '00:00'));

  useEffect(() => {
    async function fetchStaff() {
      try {
        const data = await BusinessRepository.getStaff(businessId);
        setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    }
    fetchStaff();
  }, [businessId]);

  useEffect(() => {
    if (!businessId || !selectedDate) {
      setActiveBookings([]);
      return undefined;
    }

    const unsubscribe = BookingRepository.subscribeToActiveBookingsByDate(
      businessId,
      selectedDate,
      (rows) => {
        setActiveBookings(rows);
        setSelectedTime((prev) => (prev && isBookedByRange(prev) ? null : prev));
      }
    );

    return unsubscribe;
  }, [businessId, selectedDate, service?.durationMinutes, service?.duration]);

  useEffect(() => {
    if (!selectedStaff) return;
    const stillAvailable = isStaffAvailableAt(selectedStaff, selectedDate, selectedTime || '00:00');
    if (!stillAvailable) setSelectedStaff(null);
  }, [selectedDate, selectedTime, selectedStaff]);

  const handleConfirm = async () => {
    if (!selectedTime || !businessId || !service?.id || !currentUser?.uid) return;
    
    setLoading(true);
    setSubmitError('');
    try {
      const servicePrice = Number(service?.price || 0);
      const dpRequired = service?.dpRequired !== false;
      const dpPercent = Number(service?.dpPercent || 30);
      const depositAmount = dpRequired ? Math.round((servicePrice * dpPercent) / 100) : 0;
      const bookingData = {
        serviceId: service.id,
        serviceName: service.name || service.title || 'Service',
        staffId: selectedStaff?.id || 'any',
        staffName: selectedStaff?.name || 'Any Available Staff',
        resourceIds: service?.resourceIds || [],
        timeSlot: selectedTime,
        date: selectedDate,
        userId: currentUser.uid,
        customerId: currentUser.uid,
        customerName: userProfile?.name || currentUser.displayName || currentUser.email || 'Customer',
        customerEmail: currentUser.email || '',
        customerPhone: userProfile?.phone || '',
        status: dpRequired ? 'awaiting_payment' : 'pending',
        paymentRequired: dpRequired,
        dpPercent,
        depositAmount,
        paymentStatus: dpRequired ? 'awaiting_payment' : 'not_required'
      };
      
      const result = await BookingRepository.createBooking(businessId, bookingData);
      onConfirm(result.id);
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error?.code === 'booking/conflict') {
        setSubmitError('Kamu sudah punya booking di tanggal dan jam ini. Pilih waktu lain ya.');
      } else {
        setSubmitError(`Booking gagal (${error?.code || 'unknown'}). Coba lagi dalam beberapa saat.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface-bright pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-label-md text-[16px]">Book Appointment</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Selected Service Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-[24px] p-4 flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined">{(!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon}</span>
          </div>
          <div>
            <p className="font-label-md text-[16px] text-on-surface">{service.name}</p>
            <p className="text-[13px] text-on-surface-variant flex items-center gap-2 mt-1">
              <span className="font-semibold text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.price)}
              </span>
              <span>•</span>
              <span>{service.duration || service.durationMinutes} Min</span>
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-label-md text-[18px]">Select Date</h2>
            <span className="text-[13px] text-primary font-semibold">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
            {dates.map((d, i) => (
              <button 
                key={i}
                onClick={() => {
                  setSelectedDate(d.fullDate);
                  setSelectedTime(null);
                }}
                className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                  selectedDate === d.fullDate
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'border-outline-variant/30 bg-white text-on-surface hover:border-primary/50'
                }`}
              >
                <span className={`text-[12px] ${selectedDate === d.fullDate ? 'opacity-90' : 'text-on-surface-variant'}`}>{d.day}</span>
                <span className="font-headline-lg-mobile text-[20px] mt-1">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <h2 className="font-label-md text-[18px] mb-4">Available Time</h2>
          <div className="flex flex-wrap gap-3">
            {timeSlots.map((time, i) => {
              const isBooked = isBookedByRange(time);
              const disabled = isPastSlot(time) || isBooked;
              return (
              <button 
                key={i}
                onClick={() => {
                  if (!disabled) setSelectedTime(time);
                }}
                disabled={disabled}
                className={`px-5 py-3 rounded-full font-label-md text-[14px] transition-all border-2 ${
                  disabled
                    ? 'border-outline-variant/20 bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
                    :
                  selectedTime === time 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-outline-variant/30 bg-white text-on-surface hover:border-primary/50'
                }`}
              >
                {time}{isBooked ? ' (Booked)' : ''}
              </button>
            )})}
          </div>
          <p className="text-[12px] text-on-surface-variant mt-2">
            Kamu bisa booking hingga 7 hari ke depan. Jam yang sudah lewat hanya dinonaktifkan untuk hari ini.
          </p>
        </div>

        {/* Staff Selection (Optional) */}
        <div>
          <h2 className="font-label-md text-[18px] mb-4">Select Professional <span className="text-on-surface-variant text-[12px] font-normal">(Optional)</span></h2>
          <div className="flex flex-col gap-3">
            <div 
              onClick={() => setSelectedStaff(null)}
              className={`p-4 rounded-[20px] border-2 flex items-center gap-4 transition-all cursor-pointer ${
                selectedStaff === null ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="flex-1">
                <p className="font-label-md text-[15px]">Any Available Staff</p>
                <p className="text-[12px] text-on-surface-variant">Fastest available</p>
              </div>
              {selectedStaff === null && <span className="material-symbols-outlined text-primary">check_circle</span>}
            </div>

            {availableStaffList.length === 0 && <p className="text-[12px] text-on-surface-variant ml-2">No available staff in selected date/time</p>}

            {availableStaffList.map(staff => (
              <div 
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className={`p-4 rounded-[20px] border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  selectedStaff?.id === staff.id ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant overflow-hidden">
                  <span className="material-symbols-outlined text-[30px] mt-2">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-[15px]">{staff.name}</p>
                  <p className="text-[12px] text-on-surface-variant">{staff.role || 'Professional'}</p>
                </div>
                {selectedStaff?.id === staff.id && <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-b-[40px] z-20">
        {submitError && (
          <div className="mb-3 rounded-2xl border border-error/30 bg-error-container/70 text-on-error-container px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-[20px] mt-[1px]">error</span>
            <div>
              <p className="text-sm font-semibold">Booking belum berhasil</p>
              <p className="text-xs opacity-90">{submitError}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleConfirm}
          disabled={!selectedTime || loading || !businessId || !currentUser?.uid}
          className={`w-full py-4 rounded-full font-label-md text-[16px] transition-all flex justify-center items-center gap-2 ${
            selectedTime && !loading && businessId
              ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processing...' : service?.dpRequired !== false ? 'Confirm & Continue to Payment' : 'Confirm Details'}
          {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
};
