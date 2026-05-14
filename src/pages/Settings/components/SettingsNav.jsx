import React from 'react';

export const SettingsNav = () => {
  const items = [
    { href: '#business-profile', icon: 'business', label: 'Business Profile' },
    { href: '#operating-hours', icon: 'schedule', label: 'Operating Hours' },
    { href: '#notifications', icon: 'notifications_active', label: 'Notifications' }
  ];

  return (
    <div className="glass-card rounded-[24px] p-6 flex flex-col gap-2 sticky top-24">
      <p className="px-4 pb-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Settings</p>
      {items.map((item, index) => (
        <a
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 w-full p-4 rounded-xl font-label-md text-left transition-all ${
            index === 0 ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </div>
  );
};
