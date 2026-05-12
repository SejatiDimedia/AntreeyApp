import React, { useMemo } from 'react';

const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const toDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getWeekStart = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getWeekDays = (anchor = new Date()) => {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return {
      key: toDateKey(d),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });
};

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

export const WeeklySchedule = ({ staff = [], bookings = [] }) => {
  const weekDays = useMemo(() => getWeekDays(new Date()), []);
  const timeSlots = useMemo(() => {
    if (!staff.length) return DEFAULT_TIME_SLOTS;
    const starts = staff
      .map((member) => toMinutes(member?.availability?.startTime || '09:00'))
      .filter((v) => Number.isFinite(v));
    const ends = staff
      .map((member) => toMinutes(member?.availability?.endTime || '17:00'))
      .filter((v) => Number.isFinite(v));
    if (!starts.length || !ends.length) return DEFAULT_TIME_SLOTS;
    const minStart = Math.min(...starts);
    const maxEnd = Math.max(...ends);
    if (maxEnd <= minStart) return DEFAULT_TIME_SLOTS;
    const slots = [];
    for (let cur = minStart; cur <= maxEnd; cur += 60) {
      slots.push(toHHMM(cur));
    }
    return slots.length ? slots : DEFAULT_TIME_SLOTS;
  }, [staff]);

  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings
      .filter((item) => item.status !== 'cancelled')
      .forEach((item) => {
        const key = `${item.date}|${item.timeSlot}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      });
    return map;
  }, [bookings]);

  const weekBookings = useMemo(() => {
    const keySet = new Set(weekDays.map((day) => day.key));
    return bookings.filter((item) => keySet.has(item.date) && item.status !== 'cancelled');
  }, [bookings, weekDays]);
  const activeStatuses = new Set(['pending', 'checked_in', 'confirmed', 'in_progress']);
  const visibleWeekBookingCount = useMemo(() => {
    const keySet = new Set(weekDays.map((day) => day.key));
    const slotSet = new Set(timeSlots);
    return bookings.filter((item) => {
      if (!keySet.has(item.date)) return false;
      if (!slotSet.has(item.timeSlot)) return false;
      return activeStatuses.has(String(item.status || '').toLowerCase());
    }).length;
  }, [bookings, weekDays, timeSlots]);

  const rangeText = `${weekDays[0].month} ${weekDays[0].day} - ${weekDays[6].month} ${weekDays[6].day}`;

  const getAvailabilityCount = (dayKey, time) => {
    return staff.filter((member) => {
      const start = toMinutes(member?.availability?.startTime || '09:00');
      const end = toMinutes(member?.availability?.endTime || '17:00');
      const slot = toMinutes(time);
      const dayIdx = new Date(`${dayKey}T00:00:00`).getDay();
      const workingDays = Array.isArray(member?.availability?.workingDays) ? member.availability.workingDays : [1, 2, 3, 4, 5, 6];
      if (!workingDays.includes(dayIdx)) return false;
      if (slot == null || start == null || end == null) return true;
      return slot >= start && slot <= end;
    }).length;
  };

  return (
    <section className="rounded-[28px] border border-outline-variant/30 bg-white shadow-[0_16px_30px_rgba(0,0,0,0.06)] p-6 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Operations</p>
          <h2 className="text-[26px] leading-tight font-semibold text-on-surface">Weekly Schedule</h2>
          <p className="text-sm text-on-surface-variant mt-1">{rangeText}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 min-w-[150px]">
            <p className="text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">Bookings</p>
            <p className="text-xl font-semibold text-on-surface">{visibleWeekBookingCount}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 min-w-[150px]">
            <p className="text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">Staff</p>
            <p className="text-xl font-semibold text-on-surface">{staff.length}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-8 gap-2 mb-3">
            <div></div>
            {weekDays.map((day) => (
              <div key={day.key} className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">{day.label}</p>
                <p className="text-lg font-semibold text-on-surface">{day.day}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                <div className="h-[54px] rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-center text-xs font-semibold text-on-surface-variant">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const key = `${day.key}|${time}`;
                  const items = (bookingMap.get(key) || []).filter((item) => item.status !== 'completed');
                  const availabilityCount = getAvailabilityCount(day.key, time);

                  if (items.length > 0) {
                    return (
                      <div key={key} className="h-[54px] rounded-xl border border-primary/30 bg-primary-container/55 px-3 py-2 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-[0.07em] text-primary font-semibold">Booked</p>
                        <p className="text-[12px] font-semibold text-on-surface truncate">{items[0].customerName || items[0].serviceName || 'Reserved'}</p>
                      </div>
                    );
                  }

                  if (availabilityCount > 0) {
                    return (
                      <div key={key} className="h-[54px] rounded-xl border border-outline-variant/20 bg-white px-3 py-2 flex items-center justify-center">
                        <p className="text-[11px] text-on-surface-variant">{availabilityCount} available</p>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="h-[54px] rounded-xl border border-error/25 bg-error-container/40 px-3 py-2 flex items-center justify-center">
                      <p className="text-[11px] font-medium text-on-error-container">Off</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-outline-variant/25 flex flex-wrap gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span>Booked</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-surface-container-high border border-outline-variant/30"></span>Available</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-error-container border border-error/35"></span>Off</div>
      </div>
    </section>
  );
};
