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
    <section className="glass-card rounded-[32px] p-6 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-label-md text-on-secondary-container">Weekly Bookings Chart</h3>
        <div className="bg-primary-container/30 px-3 py-1 rounded-full text-label-sm text-primary flex items-center gap-1 cursor-pointer hover:bg-primary-container/50 transition-colors">
          Last Week
          <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-end justify-between px-2 gap-2 relative h-[200px]">
        {days.map((day, idx) => {
          const value = counts[idx];
          const height = `${Math.max(8, Math.round((value / maxCount) * 100))}%`;
          const isPeak = idx === peakIndex && value > 0;
          return (
            <div key={day.key} className="flex flex-col gap-1 w-full items-center relative">
              {isPeak && (
                <div className="absolute -top-8 bg-on-background text-white px-3 py-1 rounded-full text-[12px] font-bold shadow-xl">
                  {value}
                </div>
              )}
              <div className={`w-full rounded-t-full transition-all duration-500 cursor-pointer ${isPeak ? 'bg-primary' : 'bg-primary-container'}`} style={{ height }}>
                {isPeak && <div className="w-full h-full flex items-start justify-center pt-2"><span className="w-2 h-2 rounded-full bg-white"></span></div>}
              </div>
              <span className={`text-[10px] ${isPeak ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>{day.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
