import React from 'react';

export const QuickStats = ({ bookings = [] }) => {
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
  
  return (
    <section className="glass-card rounded-[32px] p-container-padding">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-6">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-on-surface-variant/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">event_note</span>
          </div>
          <span className="text-label-md text-on-secondary-container">Bookings Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-headline-xl">{bookings.length}</span>
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_drop_up</span>
          </div>
          <span className="text-label-sm text-on-surface-variant mt-2">+3 vs yesterday</span>
        </div>
        
        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-on-surface-variant/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">medical_services</span>
          </div>
          <span className="text-label-md text-on-secondary-container">Staff Working Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-headline-xl">4 / 5</span>
          </div>
          <span className="text-label-sm text-on-surface-variant mt-2">1 staff on leave</span>
        </div>
        
        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-on-surface-variant/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
          </div>
          <span className="text-label-md text-on-secondary-container">WhatsApp Confirmations</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-headline-xl">{confirmedCount}</span>
          </div>
          <span className="text-label-sm text-on-surface-variant mt-2">Out of {bookings.length} bookings today</span>
        </div>
      </div>
    </section>
  );
};
