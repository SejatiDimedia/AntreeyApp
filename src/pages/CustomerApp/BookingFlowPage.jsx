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
        setSubmitError('You already have a booking at this date and time. Please choose another slot.');
      } else {
        setSubmitError(`Booking failed (${error?.code || 'unknown'}). Please try again shortly.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface-bright pb-32">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-outline-variant/10 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[18px] font-black text-on-surface tracking-tight">Book Appointment</h1>
            <p className="text-[11px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-0.5">Selection Process</p>
          </div>
        </div>
        <div className="w-11"></div>
      </div>

      <div className="px-6 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Selected Service Summary */}
        <div className="glass-card rounded-[32px] p-5 flex gap-5 items-center shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-surface-bright text-primary flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500">
            <span className="material-symbols-outlined text-[32px]">{(!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-lg text-on-surface tracking-tight mb-1">{service.name}</p>
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-[12px] font-black">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.price)}
              </span>
              <div className="w-1 h-1 bg-outline-variant/30 rounded-full" />
              <span className="text-[12px] font-black text-on-surface-variant/50 uppercase tracking-tighter flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                {service.duration || service.durationMinutes} Min
              </span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-end mb-6 px-1">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">Step 1</p>
              <h2 className="text-xl font-black text-on-surface tracking-tight">Choose Date</h2>
            </div>
            <div className="bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {dates.map((d, i) => (
              <button 
                key={i}
                onClick={() => {
                  setSelectedDate(d.fullDate);
                  setSelectedTime(null);
                }}
                className={`flex flex-col items-center justify-center min-w-[72px] h-[92px] rounded-[32px] border-2 transition-all duration-300 active:scale-95 ${
                  selectedDate === d.fullDate
                    ? 'border-primary bg-primary text-on-primary shadow-xl shadow-primary/20 scale-105' 
                    : 'border-outline-variant/10 bg-surface-container-low text-on-surface hover:border-primary/40'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${selectedDate === d.fullDate ? 'text-on-primary/70' : 'text-on-surface-variant/40'}`}>{d.day}</span>
                <span className="text-2xl font-black tracking-tighter leading-none">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <div className="flex justify-between items-end mb-6 px-1">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">Step 2</p>
              <h2 className="text-xl font-black text-on-surface tracking-tight">Select Time</h2>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 bg-outline-variant/30 rounded-full" />
                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase">Booked</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time, i) => {
              const isBooked = isBookedByRange(time);
              const disabled = isPastSlot(time) || isBooked;
              const isSelected = selectedTime === time;
              
              return (
                <button 
                  key={i}
                  onClick={() => {
                    if (!disabled) setSelectedTime(time);
                  }}
                  disabled={disabled}
                  className={`h-14 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-1.5 active:scale-[0.96] ${
                    disabled
                      ? 'border-outline-variant/10 bg-surface-bright text-on-surface-variant/20 cursor-not-allowed opacity-50'
                      :
                    isSelected 
                      ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5' 
                      : 'border-outline-variant/10 bg-surface-container-low text-on-surface hover:border-primary/40'
                  }`}
                >
                  <span className="tracking-tight">{time}</span>
                  {isBooked && <span className="material-symbols-outlined text-[16px] opacity-40">lock</span>}
                </button>
              )
            })}
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex gap-3">
             <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px]">info</span>
             <p className="text-[11px] font-medium text-on-surface-variant/60 leading-relaxed">
               Slots are updated in real-time. You can book up to 7 days ahead for any available time window.
             </p>
          </div>
        </div>

        {/* Staff Selection */}
        <div>
          <div className="flex justify-between items-end mb-6 px-1">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">Step 3</p>
              <h2 className="text-xl font-black text-on-surface tracking-tight">Professional <span className="text-on-surface-variant/30 font-medium">(Optional)</span></h2>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => setSelectedStaff(null)}
              className={`w-full p-5 rounded-[32px] border-2 flex items-center gap-4 transition-all active:scale-[0.98] text-left ${
                selectedStaff === null ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-bright flex items-center justify-center text-on-surface-variant/40 shadow-inner">
                <span className="material-symbols-outlined text-[32px]">group</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-on-surface text-lg tracking-tight leading-none mb-1">Any Professional</p>
                <p className="text-[12px] font-medium text-on-surface-variant/40 uppercase tracking-widest">Fastest available slot</p>
              </div>
              {selectedStaff === null && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
              )}
            </button>

            {availableStaffList.length === 0 && selectedTime && (
              <div className="py-10 text-center">
                 <span className="material-symbols-outlined text-on-surface-variant/20 text-[40px] mb-2">person_off</span>
                 <p className="text-xs font-black text-on-surface-variant/30 uppercase tracking-widest">No specific staff available</p>
              </div>
            )}

            {availableStaffList.map(staff => (
              <button 
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className={`w-full p-5 rounded-[32px] border-2 flex items-center gap-4 transition-all active:scale-[0.98] text-left ${
                  selectedStaff?.id === staff.id ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface-container-low'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-bright flex items-center justify-center text-on-surface-variant/40 overflow-hidden relative group">
                  <span className="material-symbols-outlined text-[40px] mt-2">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-black text-on-surface text-lg tracking-tight leading-none mb-1">{staff.name}</p>
                  <p className="text-[12px] font-medium text-on-surface-variant/40 uppercase tracking-widest">{staff.role || 'Professional Specialist'}</p>
                </div>
                {selectedStaff?.id === staff.id && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] rounded-t-[40px] z-40">
        <div className="max-w-[380px] mx-auto">
          {submitError && (
            <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 p-4 flex gap-3 items-center animate-in fade-in zoom-in-95">
              <span className="material-symbols-outlined text-rose-600">error</span>
              <p className="text-[12px] font-black text-rose-800 leading-tight">{submitError}</p>
            </div>
          )}
          
          <button 
            onClick={handleConfirm}
            disabled={!selectedTime || loading || !businessId || !currentUser?.uid}
            className={`w-full h-15 rounded-full font-black text-[16px] transition-all flex justify-center items-center gap-3 relative overflow-hidden ${
              selectedTime && !loading && businessId
                ? 'bg-inverse-surface text-inverse-on-surface shadow-2xl shadow-black/20 active:scale-95 hover:opacity-90' 
                : 'bg-surface-container-low text-on-surface-variant/30 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-inverse-on-surface/20 border-t-inverse-on-surface rounded-full animate-spin" />
            ) : (
              <>
                <span>{service?.dpRequired !== false ? 'Review & Pay' : 'Confirm Booking'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
          
          {selectedTime && (
            <p className="text-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] mt-4">
               {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at {selectedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
