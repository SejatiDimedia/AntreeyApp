import React from 'react';

export const BookingFilters = ({
  serviceOptions = [],
  selectedServiceId = 'all',
  onServiceChange,
  selectedStatus = 'all',
  onStatusChange,
  selectedDate
}) => {
  const dateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  return (
    <div className="glass-card rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-xs sm:text-sm text-on-surface-variant">
        Active date: <span className="font-semibold text-on-surface">{dateLabel}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <select
            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-label-md border min-w-0 sm:min-w-[190px] text-sm"
            value={selectedServiceId}
            onChange={(e) => onServiceChange?.(e.target.value)}
          >
            <option value="all">All Services</option>
            {serviceOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <select
          className="w-full sm:w-auto bg-white/50 p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant text-sm"
          value={selectedStatus}
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="checked_in">Checked-in</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};
