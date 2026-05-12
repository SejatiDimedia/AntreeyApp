import React from 'react';

export const NotificationPreferences = () => {
  return (
    <section className="glass-card rounded-[24px] overflow-hidden">
      <div className="p-8 border-b border-outline-variant/30">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Notification Preferences</h2>
        <p className="text-on-surface-variant text-body-md mt-1">Control how you and your customers stay updated.</p>
      </div>
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-card-gap">
        {/* WhatsApp */}
        <div className="p-6 bg-surface-container-low/50 rounded-2xl flex flex-col justify-between border-l-4 border-[#25D366]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center text-[#25D366]">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <div>
                <h4 className="font-label-md text-on-surface">WhatsApp Notifications</h4>
                <p className="text-label-sm text-on-surface-variant">Send instant alerts to customers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Email */}
        <div className="p-6 bg-surface-container-low/50 rounded-2xl flex flex-col justify-between border-l-4 border-primary">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <div>
                <h4 className="font-label-md text-on-surface">Email Marketing</h4>
                <p className="text-label-sm text-on-surface-variant">Send weekly digests & offers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Staff Alert */}
        <div className="p-6 bg-surface-container-low/50 rounded-2xl flex flex-col justify-between border-l-4 border-on-surface-variant">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-on-surface-variant/10 rounded-xl flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl">campaign</span>
              </div>
              <div>
                <h4 className="font-label-md text-on-surface">Staff Push Alerts</h4>
                <p className="text-label-sm text-on-surface-variant">Notify staff of new bookings</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Daily Summary */}
        <div className="p-6 bg-surface-container-low/50 rounded-2xl flex flex-col justify-between border-l-4 border-primary-container">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">summarize</span>
              </div>
              <div>
                <h4 className="font-label-md text-on-surface">Daily Summary</h4>
                <p className="text-label-sm text-on-surface-variant">Morning email with daily schedule</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
