import React from 'react';

export const BookingFilters = () => {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md transition-colors whitespace-nowrap">All Services</button>
        <button className="bg-white/50 text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-colors whitespace-nowrap border border-outline-variant/30">Haircut</button>
        <button className="bg-white/50 text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-colors whitespace-nowrap border border-outline-variant/30">Styling</button>
        <button className="bg-white/50 text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-colors whitespace-nowrap border border-outline-variant/30">Spa Treatments</button>
        <button className="bg-white/50 text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-colors whitespace-nowrap border border-outline-variant/30">Coloring</button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="bg-white/50 rounded-lg px-4 py-2 flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span className="font-label-md">12 Oct, 2025</span>
        </div>
        <button className="bg-white/50 p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>
    </div>
  );
};
