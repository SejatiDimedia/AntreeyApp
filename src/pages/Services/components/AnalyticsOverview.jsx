import React from 'react';

export const AnalyticsOverview = ({ averagePrice = 0, averageDuration = 0, totalCategories = 0, totalBookings = 0, distribution = [] }) => {
  return (
    <section className="mt-8 mb-12">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">Service Distribution</h2>
      <div className="glass-card rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant font-bold uppercase">Average Price</p>
            <p className="font-headline-lg-mobile text-headline-lg-mobile">Rp {Number(averagePrice || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant font-bold uppercase">Avg. Duration</p>
            <p className="font-headline-lg-mobile text-headline-lg-mobile">{Math.round(averageDuration || 0)} Min</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-on-surface/5 text-on-surface rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant font-bold uppercase">Bookings + Categories</p>
            <p className="font-headline-lg-mobile text-headline-lg-mobile">{totalBookings} / {totalCategories}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 mt-4">
        <h3 className="font-label-md mb-3">Bookings by Service</h3>
        {distribution.length === 0 && (
          <p className="text-on-surface-variant text-sm">No booking data yet. Distribution will appear automatically from Firestore bookings.</p>
        )}
        {distribution.length > 0 && (
          <div className="space-y-2">
            {distribution.map((item) => (
              <div key={item.serviceId} className="flex items-center justify-between bg-surface-container rounded-xl px-3 py-2">
                <span className="text-sm">{item.title}</span>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
