import React from 'react';

export const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const DEFAULT_OPERATING_HOURS = DAYS.reduce((acc, day) => {
  acc[day.key] = {
    isOpen: day.key !== 'sunday',
    startTime: '09:00',
    endTime: day.key === 'saturday' ? '17:00' : '21:00'
  };
  return acc;
}, {});

export const normalizeOperatingHours = (value = {}) => {
  return DAYS.reduce((acc, day) => {
    const row = value?.[day.key] || {};
    acc[day.key] = {
      isOpen: typeof row.isOpen === 'boolean' ? row.isOpen : DEFAULT_OPERATING_HOURS[day.key].isOpen,
      startTime: row.startTime || DEFAULT_OPERATING_HOURS[day.key].startTime,
      endTime: row.endTime || DEFAULT_OPERATING_HOURS[day.key].endTime
    };
    return acc;
  }, {});
};

export const OperatingHours = ({ value = {}, onChange }) => {
  const hours = normalizeOperatingHours(value);

  const updateDay = (dayKey, patch) => {
    onChange?.({
      ...hours,
      [dayKey]: {
        ...hours[dayKey],
        ...patch
      }
    });
  };

  const copyMondayToWeekdays = () => {
    const source = hours.monday;
    const next = { ...hours };
    ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((dayKey) => {
      next[dayKey] = { ...source };
    });
    onChange?.(next);
  };

  return (
    <section className="glass-card rounded-[24px] overflow-hidden">
      <div className="p-8 border-b border-outline-variant/30 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Operating Hours</h2>
          <p className="text-on-surface-variant text-body-md mt-1">Set weekly availability shown on the customer booking page.</p>
        </div>
        <button
          type="button"
          onClick={copyMondayToWeekdays}
          className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-label-sm font-semibold hover:bg-primary-fixed-dim transition-colors"
        >
          Copy Monday to Weekdays
        </button>
      </div>

      <div className="p-8 space-y-4">
        {DAYS.map((day) => {
          const row = hours[day.key];
          return (
            <div
              key={day.key}
              className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl transition-colors ${
                row.isOpen
                  ? 'bg-surface-container-low/50 hover:bg-surface-container-low'
                  : 'bg-surface-container-highest/30 opacity-75'
              }`}
            >
              <div className="flex items-center gap-4 md:w-40">
                <button
                  type="button"
                  onClick={() => updateDay(day.key, { isOpen: !row.isOpen })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    row.isOpen ? 'bg-primary/10 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'
                  }`}
                  aria-label={`Toggle ${day.label}`}
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: row.isOpen ? "'FILL' 1" : undefined }}>
                    {row.isOpen ? 'check_circle' : 'do_not_disturb_on'}
                  </span>
                </button>
                <span className="font-label-md">{day.label}</span>
              </div>

              {row.isOpen ? (
                <div className="flex items-center gap-3 md:gap-6">
                  <input
                    className="bg-transparent border border-outline-variant/20 font-body-md outline-none focus:ring-2 focus:ring-primary rounded-xl px-3 py-2"
                    type="time"
                    value={row.startTime}
                    onChange={(event) => updateDay(day.key, { startTime: event.target.value })}
                  />
                  <span className="text-on-surface-variant">to</span>
                  <input
                    className="bg-transparent border border-outline-variant/20 font-body-md outline-none focus:ring-2 focus:ring-primary rounded-xl px-3 py-2"
                    type="time"
                    value={row.endTime}
                    onChange={(event) => updateDay(day.key, { endTime: event.target.value })}
                  />
                </div>
              ) : (
                <div className="italic text-on-surface-variant">Closed for bookings</div>
              )}

              <button
                type="button"
                onClick={() => updateDay(day.key, { isOpen: !row.isOpen })}
                className={`md:w-24 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                  row.isOpen
                    ? 'text-error bg-error-container/60 hover:bg-error-container'
                    : 'text-primary bg-primary-container/60 hover:bg-primary-container'
                }`}
              >
                {row.isOpen ? 'Close' : 'Open'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
