import React from 'react';

export const OperatingHours = () => {
  return (
    <section className="glass-card rounded-[24px] overflow-hidden">
      <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Operating Hours</h2>
          <p className="text-on-surface-variant text-body-md mt-1">Set your weekly availability for bookings.</p>
        </div>
        <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm">Auto-Save Active</span>
      </div>
      
      <div className="p-8 space-y-4">
        {/* Monday */}
        <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-low transition-colors">
          <div className="flex items-center gap-4 w-32">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <span className="font-label-md">Monday</span>
          </div>
          <div className="flex items-center gap-6">
            <input className="bg-transparent border-none font-body-md outline-none focus:ring-2 focus:ring-primary rounded px-2" type="time" defaultValue="09:00" />
            <span className="text-on-surface-variant">to</span>
            <input className="bg-transparent border-none font-body-md outline-none focus:ring-2 focus:ring-primary rounded px-2" type="time" defaultValue="18:00" />
          </div>
          <button className="p-2 text-error hover:bg-error/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
        
        {/* Tuesday */}
        <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-low transition-colors">
          <div className="flex items-center gap-4 w-32">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <span className="font-label-md">Tuesday</span>
          </div>
          <div className="flex items-center gap-6">
            <input className="bg-transparent border-none font-body-md outline-none focus:ring-2 focus:ring-primary rounded px-2" type="time" defaultValue="09:00" />
            <span className="text-on-surface-variant">to</span>
            <input className="bg-transparent border-none font-body-md outline-none focus:ring-2 focus:ring-primary rounded px-2" type="time" defaultValue="18:00" />
          </div>
          <button className="p-2 text-error hover:bg-error/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
        
        {/* Sunday (Closed) */}
        <div className="flex items-center justify-between p-4 bg-surface-container-highest/30 rounded-2xl opacity-60">
          <div className="flex items-center gap-4 w-32">
            <div className="w-10 h-10 rounded-full bg-on-surface-variant/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">do_not_disturb_on</span>
            </div>
            <span className="font-label-md">Sunday</span>
          </div>
          <div className="flex items-center gap-6 italic text-on-surface-variant">
            <span>Closed for all bookings</span>
          </div>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
        </div>
      </div>
    </section>
  );
};
