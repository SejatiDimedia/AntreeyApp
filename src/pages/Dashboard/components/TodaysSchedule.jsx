import React from 'react';

export const TodaysSchedule = ({ bookings = [] }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  return (
    <section className="glass-card rounded-[32px] overflow-hidden">
      <div className="bg-inverse-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-inverse-on-surface">Today's Schedule</h2>
          <span className="text-headline-lg-mobile font-headline-lg-mobile text-primary-container">{bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length} / {bookings.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-variant/20 text-surface-variant px-4 py-2 rounded-full font-label-md">{dateStr}</div>
          <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary transition-all">
            View full calendar
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="text-label-sm text-on-surface-variant/60 uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4 text-left font-semibold">Time</th>
              <th className="px-8 py-4 text-left font-semibold">Customer</th>
              <th className="px-8 py-4 text-left font-semibold">Service</th>
              <th className="px-8 py-4 text-left font-semibold">Staff</th>
              <th className="px-8 py-4 text-left font-semibold">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-on-surface-variant opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                  <p>No bookings scheduled for today</p>
                </td>
              </tr>
            ) : bookings.map((item, index) => (
              <tr key={item.id || index} className={`${item.status === 'confirmed' ? 'bg-primary-container/10 hover:bg-primary-container/20' : 'hover:bg-surface-container-low'} transition-colors group`}>
                <td className="px-8 py-6 font-headline-lg-mobile text-on-surface">{item.timeSlot || '--:--'}</td>
                <td className="px-8 py-6 font-body-lg text-on-surface">{item.customerName || 'Anonymous'}</td>
                <td className="px-8 py-6 text-on-surface-variant">{item.serviceName || 'Service'}</td>
                <td className="px-8 py-6"><span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md">{item.staffName || 'Any'}</span></td>
                <td className="px-8 py-6">
                  {item.status === 'confirmed' ? (
                    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full w-fit border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-label-md">{item.customerPhone || '---'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full w-fit border border-outline-variant/30">
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">check_circle</span>
                      <span className="text-label-md text-on-surface-variant">{item.customerPhone || '---'}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
