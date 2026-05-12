import React from 'react';

export const WeeklyChart = () => {
  return (
    <div className="glass-card p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-label-md">Weekly Bookings</h3>
        <span className="text-label-sm text-on-surface-variant">Last Week</span>
      </div>
      <div className="flex items-end justify-between h-32 gap-2 mt-4">
        <div className="w-full bg-primary/20 rounded-full h-1/2 group relative cursor-pointer hover:bg-primary/30 transition-colors">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded hidden group-hover:block transition-all">10</div>
        </div>
        <div className="w-full bg-primary/40 rounded-full h-2/3 group relative cursor-pointer hover:bg-primary/50 transition-colors">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded hidden group-hover:block transition-all">15</div>
        </div>
        <div className="w-full bg-primary/60 rounded-full h-1/3 group relative cursor-pointer hover:bg-primary/70 transition-colors"></div>
        <div className="w-full bg-primary/80 rounded-full h-4/5 group relative cursor-pointer hover:bg-primary/90 transition-colors"></div>
        <div className="w-full bg-primary rounded-full h-full group relative cursor-pointer shadow-[0_0_15px_rgba(72,104,0,0.3)]">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded hidden group-hover:block transition-all">25</div>
        </div>
        <div className="w-full bg-primary/30 rounded-full h-1/2 group relative cursor-pointer hover:bg-primary/40 transition-colors"></div>
        <div className="w-full bg-primary/50 rounded-full h-2/3 group relative cursor-pointer hover:bg-primary/60 transition-colors"></div>
      </div>
      <div className="flex justify-between mt-4 text-label-sm text-on-surface-variant">
        <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
      </div>
    </div>
  );
};
