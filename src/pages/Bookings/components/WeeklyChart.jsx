import React from 'react';

const getLast7Days = () => {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({ key, label });
  }
  return days;
};

export const WeeklyChart = ({ bookings = [] }) => {
  const days = getLast7Days();
  const counts = days.map((day) => bookings.filter((item) => item.date === day.key).length);
  const maxCount = Math.max(...counts, 1);
  const peakIndex = counts.findIndex((value) => value === maxCount);

  return (
    <div className="glass-card p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-label-md">Weekly Bookings</h3>
        <span className="text-label-sm text-on-surface-variant">Last 7 Days</span>
      </div>
      <div className="flex items-end justify-between h-32 gap-2 mt-4">
        {days.map((day, idx) => {
          const value = counts[idx];
          const height = `${Math.max(8, Math.round((value / maxCount) * 100))}%`;
          const isPeak = idx === peakIndex && value > 0;
          return (
            <div key={day.key} className="w-full relative group cursor-pointer">
              <div 
                className={`w-full rounded-full transition-all duration-500 ${isPeak ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-primary/20 hover:bg-primary/30'}`}
                style={{ height }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded hidden group-hover:block transition-all whitespace-nowrap z-10">
                  {value} bookings
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant">
        {days.filter((_, i) => i % 2 === 0).map(day => (
          <span key={day.key}>{day.label}</span>
        ))}
      </div>
    </div>
  );
};
