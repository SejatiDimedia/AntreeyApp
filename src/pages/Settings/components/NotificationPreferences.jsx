import React from 'react';

const DEFAULT_PREFERENCES = {
  paymentReview: true,
  newBooking: true,
  dailySummary: true,
  customerUpdates: true
};

const preferenceCards = [
  {
    key: 'paymentReview',
    icon: 'receipt_long',
    title: 'Payment Review Alerts',
    description: 'Show internal alerts when customers upload transfer proofs.',
    accent: 'border-blue-400',
    iconClass: 'bg-blue-50 text-blue-600'
  },
  {
    key: 'newBooking',
    icon: 'event_available',
    title: 'New Booking Alerts',
    description: 'Notify the team when a new booking enters the queue.',
    accent: 'border-primary',
    iconClass: 'bg-primary/10 text-primary'
  },
  {
    key: 'dailySummary',
    icon: 'summarize',
    title: 'Daily Operations Summary',
    description: 'Keep the daily summary card enabled for operational review.',
    accent: 'border-emerald-400',
    iconClass: 'bg-emerald-50 text-emerald-600'
  },
  {
    key: 'customerUpdates',
    icon: 'notifications_active',
    title: 'Customer Status Updates',
    description: 'Prepare booking status signals for customer-facing updates.',
    accent: 'border-amber-400',
    iconClass: 'bg-amber-50 text-amber-600'
  }
];

export const NotificationPreferences = ({ value = {}, onChange }) => {
  const preferences = { ...DEFAULT_PREFERENCES, ...(value || {}) };

  const updatePreference = (key) => {
    onChange?.({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  return (
    <section id="notifications" className="glass-card rounded-[24px] overflow-hidden scroll-mt-28">
      <div className="p-8 border-b border-outline-variant/30">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Notification Preferences</h2>
        <p className="text-on-surface-variant text-body-md mt-1">Choose which operational signals should be active for this business.</p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-card-gap">
        {preferenceCards.map((item) => {
          const enabled = Boolean(preferences[item.key]);
          return (
            <button
              type="button"
              key={item.key}
              onClick={() => updatePreference(item.key)}
              className={`p-6 bg-surface-container-low/50 rounded-2xl border-l-4 ${item.accent} text-left transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconClass}`}>
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-on-surface">{item.title}</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">{item.description}</p>
                  </div>
                </div>
                <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                  <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-[2px]'}`} />
                </span>
              </div>
              <p className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-bold ${enabled ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
