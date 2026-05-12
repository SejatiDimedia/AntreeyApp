import React from 'react';

export const SettingsNav = () => {
  return (
    <div className="glass-card rounded-[24px] p-6 flex flex-col gap-2 sticky top-24">
      <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-primary text-white font-label-md text-left transition-all">
        <span className="material-symbols-outlined">business</span>
        Business Profile
      </button>
      <button className="flex items-center gap-3 w-full p-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-left transition-all">
        <span className="material-symbols-outlined">schedule</span>
        Operating Hours
      </button>
      <button className="flex items-center gap-3 w-full p-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-left transition-all">
        <span className="material-symbols-outlined">notifications_active</span>
        Notifications
      </button>
      <button className="flex items-center gap-3 w-full p-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-left transition-all">
        <span className="material-symbols-outlined">payments</span>
        Billing & Plans
      </button>
      <button className="flex items-center gap-3 w-full p-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-left transition-all">
        <span className="material-symbols-outlined">security</span>
        Privacy & Security
      </button>
    </div>
  );
};
