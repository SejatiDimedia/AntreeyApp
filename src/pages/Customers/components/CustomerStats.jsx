import React from 'react';

export const CustomerStats = ({ users = [], onAddCustomer, onAssignExistingCustomer }) => {
  const now = new Date();
  const totalCustomers = users.length;
  const newThisMonth = users.filter((user) => {
    if (!user?.createdAt) return false;
    const createdAt = new Date(user.createdAt);
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }).length;
  const repeatCustomersCount = users.filter((user) => Number(user?.bookings || 0) > 1).length;
  const repeatCustomersPercent = totalCustomers > 0 ? Math.round((repeatCustomersCount / totalCustomers) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-card-gap">
      <div className="glass-card rounded-[24px] p-container-padding flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">group</span>
        </div>
        <div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Total Customers</p>
          <p className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">{totalCustomers}</p>
        </div>
      </div>

      <div className="glass-card rounded-[24px] p-container-padding flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined">person_add</span>
        </div>
        <div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">New this Month</p>
          <p className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">{newThisMonth}</p>
        </div>
      </div>

      <div className="glass-card rounded-[24px] p-container-padding flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined">stars</span>
        </div>
        <div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Repeat Customers</p>
          <p className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">{repeatCustomersPercent}%</p>
        </div>
      </div>

      <div className="glass-card rounded-[24px] p-container-padding flex items-center justify-center">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button onClick={onAddCustomer} className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-full text-[13px] font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Customer
          </button>
          <button onClick={onAssignExistingCustomer} className="flex items-center gap-1.5 bg-surface-container text-on-surface px-4 py-2 rounded-full text-[13px] font-semibold">
            <span className="material-symbols-outlined text-[18px]">link</span>
            Assign Existing
          </button>
        </div>
      </div>
    </div>
  );
};
