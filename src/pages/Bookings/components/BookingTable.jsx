import React from 'react';
import { formatQueueNumber } from '../../../utils/queueNumber';

export const BookingTable = ({ bookings = [], onCallNext, onOpenTv, onCreateWalkIn, queueConfig = {} }) => {
  const renderStatus = (status) => {
    switch(status) {
      case 'confirmed':
      case 'Confirmed':
        return (
          <span className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label-md">Confirmed</span>
          </span>
        );
      case 'pending':
      case 'Pending':
        return (
          <span className="flex items-center gap-1.5 text-tertiary">
            <span className="material-symbols-outlined text-[18px]">pending</span>
            <span className="font-label-md">Pending</span>
          </span>
        );
      case 'cancelled':
      case 'Cancelled':
        return (
          <span className="flex items-center gap-1.5 text-error">
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            <span className="font-label-md">Cancelled</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            <span className="font-label-md">Completed</span>
          </span>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="bg-inverse-surface p-6 flex justify-between items-center">
        <h2 className="text-inverse-on-surface font-headline-lg-mobile">Upcoming Reservations</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTv}
            className="bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:opacity-90 transition-colors"
          >
            Queue TV <span className="material-symbols-outlined text-[18px]">live_tv</span>
          </button>
          <button
            onClick={onCreateWalkIn}
            className="bg-primary text-white px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:opacity-90 transition-colors"
          >
            Walk-in <span className="material-symbols-outlined text-[18px]">person_add</span>
          </button>
          <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors">
            View full calendar <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary-container/10">
            <tr>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Time</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Queue</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Customer</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Service</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Staff</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20">Status</th>
              <th className="p-6 font-label-md text-on-surface-variant border-b border-outline-variant/20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-on-surface-variant opacity-50">
                  No upcoming reservations found
                </td>
              </tr>
            ) : bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface-container-high transition-colors">
                <td className="p-6">
                  <div className={`font-headline-lg-mobile ${booking.status === 'confirmed' ? 'text-primary' : ''}`}>{booking.timeSlot || '--:--'}</div>
                  <div className="text-label-sm text-on-surface-variant">{booking.duration || '30 mins'}</div>
                </td>
                <td className="p-6">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-container/40 text-on-primary-container font-bold">
                    {formatQueueNumber(booking.queuePosition, queueConfig)}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    {booking.customerImg ? (
                      <img src={booking.customerImg} alt={booking.customerName} className="w-10 h-10 rounded-full border border-outline-variant/20 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-label-md uppercase">
                        {(booking.customerName || 'A').substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <div className="font-label-md">{booking.customerName || 'Anonymous'}</div>
                      <div className="text-label-sm text-on-surface-variant">{booking.customerPhone || '---'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-white/60 px-3 py-1 rounded-full text-label-sm border border-outline-variant/20">{booking.serviceName || 'Service'}</span>
                </td>
                <td className="p-6">
                  <div className="bg-secondary-container/50 px-4 py-1 rounded-full inline-block font-label-sm">{booking.staffName || 'Any Staff'}</div>
                </td>
                <td className="p-6">
                  {renderStatus(booking.status)}
                </td>
                <td className="p-6 text-right">
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => onCallNext(booking.id)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-full text-label-sm hover:bg-primary-fixed-dim transition-all mr-2"
                    >
                      Call Next
                    </button>
                  )}
                  <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
