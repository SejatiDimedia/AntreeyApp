import React from 'react';
import { formatQueueNumber } from '../../../utils/queueNumber';

export const BookingTable = ({
  bookings = [],
  onCallNext,
  onStartService,
  onCompleteBooking,
  onCancelBooking,
  onDeleteBooking,
  onOpenTv,
  onCreateWalkIn,
  onOpenCheckIn,
  onReviewPayment,
  queueConfig = {}
}) => {
  const renderStatus = (status, paymentStatus) => {
    if (paymentStatus === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-emerald-700">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="font-label-md">Payment Approved</span>
        </span>
      );
    }

    if (paymentStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-rose-700">
          <span className="material-symbols-outlined text-[18px]">report</span>
          <span className="font-label-md">Payment Rejected</span>
        </span>
      );
    }

    if (status === 'awaiting_payment' && paymentStatus === 'proof_submitted') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-blue-700">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span className="font-label-md">Proof Sent</span>
        </span>
      );
    }

    switch (status) {
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
      case 'checked_in':
        return (
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span className="font-label-md">Checked-in</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 text-indigo-600">
            <span className="material-symbols-outlined text-[18px]">autoplay</span>
            <span className="font-label-md">In Progress</span>
          </span>
        );
      case 'awaiting_payment':
        return (
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span className="font-label-md">Awaiting Payment</span>
          </span>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="bg-inverse-surface p-4 sm:p-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <h2 className="text-inverse-on-surface font-headline-lg-mobile">Upcoming Reservations</h2>
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            onClick={onOpenCheckIn}
            className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:opacity-90 transition-colors"
          >
            Check-in <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          </button>
          <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors">
            View full calendar <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
      <div className="block md:hidden p-3 space-y-3">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant opacity-60">No upcoming reservations found</div>
        ) : bookings.map((booking) => (
          <div key={booking.id} className="rounded-2xl border border-outline-variant/20 p-4 bg-white/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-on-surface">{booking.customerName || 'Anonymous'}</p>
                <p className="text-xs text-on-surface-variant">{booking.customerPhone || '---'}</p>
              </div>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-container/40 text-on-primary-container font-bold text-xs">
                {formatQueueNumber(booking.queuePosition, queueConfig)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-on-surface-variant">Time:</span> {booking.timeSlot || '--:--'}</p>
              <p><span className="text-on-surface-variant">Staff:</span> {booking.staffName || 'Any Staff'}</p>
              <p className="col-span-2"><span className="text-on-surface-variant">Service:</span> {booking.serviceName || 'Service'}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>{renderStatus(booking.status, booking.paymentStatus)}</div>
              <div className="flex items-center gap-1">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => onCallNext(booking.id)}
                    className="inline-flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">campaign</span> Call
                  </button>
                )}
                {(booking.status === 'checked_in' || booking.status === 'confirmed') && (
                  <button
                    onClick={() => onStartService?.(booking.id)}
                    className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">autoplay</span> Start
                  </button>
                )}
                {booking.status === 'in_progress' && (
                  <button
                    onClick={() => onCompleteBooking?.(booking.id)}
                    className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">task_alt</span> Complete
                  </button>
                )}
                {booking.paymentProofUrl && (
                  <button
                    onClick={() => onReviewPayment?.(booking)}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">receipt_long</span> {booking.paymentStatus === 'proof_submitted' ? 'Review' : 'Proof'}
                  </button>
                )}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button
                    onClick={() => onCancelBooking?.(booking.id)}
                    className="inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">do_not_disturb_on</span> Cancel
                  </button>
                )}
                <button
                  onClick={() => onDeleteBooking?.(booking.id)}
                  className="inline-flex items-center gap-1 bg-error-container text-error px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary-container/10">
            <tr>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 text-center">Time</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 whitespace-nowrap text-center">Queue</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 text-center">Customer</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 text-center">Service</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 whitespace-nowrap text-center">Staff</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 text-center">Status</th>
              <th className="px-5 py-4 font-label-md text-on-surface-variant border-b border-outline-variant/20 text-center">Action</th>
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
              <tr key={booking.id} className="hover:bg-surface-container-high/40 transition-colors">
                <td className="px-5 py-4 align-middle">
                  <div className={`font-semibold text-[16px] ${booking.status === 'confirmed' ? 'text-primary' : 'text-on-surface'}`}>{booking.timeSlot || '--:--'}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{booking.duration || '30 mins'}</div>
                </td>
                <td className="px-5 py-4 align-middle whitespace-nowrap">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-container/40 text-on-primary-container font-bold whitespace-nowrap">
                    {formatQueueNumber(booking.queuePosition, queueConfig)}
                  </span>
                </td>
                <td className="px-5 py-4 align-middle">
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
                <td className="px-5 py-4 align-middle">
                  <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant/20">{booking.serviceName || 'Service'}</span>
                </td>
                <td className="px-5 py-4 align-middle whitespace-nowrap">
                  <div className="bg-secondary-container/50 px-3 py-1 rounded-full inline-block text-xs font-semibold whitespace-nowrap">{booking.staffName || 'Any Staff'}</div>
                </td>
                <td className="px-5 py-4 align-middle">
                  {renderStatus(booking.status, booking.paymentStatus)}
                </td>
                <td className="px-5 py-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => onCallNext(booking.id)}
                        className="inline-flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-primary-fixed-dim transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">campaign</span> Call
                      </button>
                    )}
                    {(booking.status === 'checked_in' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => onStartService?.(booking.id)}
                        className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px]">autoplay</span> Start
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => onCompleteBooking?.(booking.id)}
                        className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px]">task_alt</span> Complete
                      </button>
                    )}
                    {booking.paymentProofUrl && (
                      <button
                        onClick={() => onReviewPayment?.(booking)}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span> {booking.paymentStatus === 'proof_submitted' ? 'Review' : 'Proof'}
                      </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => onCancelBooking?.(booking.id)}
                        className="inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px]">do_not_disturb_on</span> Cancel
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteBooking?.(booking.id)}
                      className="inline-flex items-center gap-1 bg-error-container text-error px-3 py-1.5 rounded-full text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
