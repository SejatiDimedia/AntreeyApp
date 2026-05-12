import React from 'react';

export const WeeklyChart = () => {
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
        {/* Simple Chart Simulation */}
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[20%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Mon</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[45%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Tue</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[35%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Wed</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[55%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Thu</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[30%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Fri</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center relative">
          <div className="absolute -top-8 bg-on-background text-white px-3 py-1 rounded-full text-[12px] font-bold shadow-xl">15</div>
          <div className="w-full bg-primary rounded-t-full h-[70%] flex items-start justify-center pt-2 transition-all duration-500 cursor-pointer hover:opacity-90">
            <span className="w-2 h-2 rounded-full bg-white"></span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-bold">Sat</span>
        </div>
        <div className="flex flex-col gap-1 w-full items-center">
          <div className="w-full bg-primary-container rounded-t-full h-[25%] transition-all duration-500 hover:opacity-80 cursor-pointer"></div>
          <span className="text-[10px] text-on-surface-variant">Sun</span>
        </div>
      </div>
    </section>
  );
};
