import React from 'react';
import { formatQueueNumber } from '../../../utils/queueNumber';
import { BookingStatusTimeline } from '../../../components/booking/BookingStatusTimeline';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 py-2 last:border-b-0">
    <span className="text-xs text-on-surface-variant">{label}</span>
    <span className="text-sm font-semibold text-on-surface text-right break-words">{value || '-'}</span>
  </div>
);

export const BookingDetailDrawer = ({
  booking,
  open,
  onClose,
  onCallNext,
  onStartService,
  onCompleteBooking,
  onCancelBooking,
  onDeleteBooking,
  onReviewPayment,
  queueConfig = {}
}) => {
  if (!open || !booking) return null;

  const queueNumber = formatQueueNumber(booking.queuePosition, queueConfig);
  const paymentStatus = String(booking.paymentStatus || '').replaceAll('_', ' ') || 'not required';
  const canCancel = booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-outline-variant/20 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-outline-variant/20 px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-on-surface-variant">Booking Detail</p>
            <h2 className="text-2xl font-bold text-on-surface mt-1">{booking.customerName || 'Anonymous'}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{booking.serviceName || 'Service'} • {booking.date || '-'} at {booking.timeSlot || '--:--'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary-container/30 p-4">
              <p className="text-xs text-on-primary-container/70">Queue</p>
              <p className="text-2xl font-bold text-on-primary-container mt-1">{queueNumber}</p>
            </div>
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-on-surface-variant">Status</p>
              <p className="text-lg font-bold text-on-surface mt-1 capitalize">{String(booking.status || 'pending').replaceAll('_', ' ')}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-outline-variant/20 p-4">
            <h3 className="font-semibold text-on-surface mb-2">Customer</h3>
            <InfoRow label="Name" value={booking.customerName || 'Anonymous'} />
            <InfoRow label="Phone" value={booking.customerPhone || '-'} />
            <InfoRow label="Email" value={booking.customerEmail || '-'} />
            <InfoRow label="Customer ID" value={booking.customerId || booking.userId || '-'} />
          </section>

          <section className="rounded-2xl border border-outline-variant/20 p-4">
            <h3 className="font-semibold text-on-surface mb-2">Booking</h3>
            <InfoRow label="Date" value={booking.date} />
            <InfoRow label="Time" value={`${booking.timeSlot || '--:--'} - ${booking.endTimeSlot || '--:--'}`} />
            <InfoRow label="Duration" value={`${booking.durationMinutes || booking.duration || 30} mins`} />
            <InfoRow label="Service" value={booking.serviceName || 'Service'} />
            <InfoRow label="Staff" value={booking.staffName || 'Any Staff'} />
            <InfoRow label="Type" value={booking.type || 'appointment'} />
          </section>

          <section className="rounded-2xl border border-outline-variant/20 p-4">
            <h3 className="font-semibold text-on-surface mb-2">Payment</h3>
            <InfoRow label="Required" value={booking.paymentRequired ? 'Yes' : 'No'} />
            <InfoRow label="Status" value={paymentStatus} />
            <InfoRow label="DP" value={booking.paymentRequired ? `${booking.dpPercent || 0}%` : '-'} />
            <InfoRow label="Deposit" value={booking.depositAmount ? `Rp ${Number(booking.depositAmount).toLocaleString('id-ID')}` : '-'} />
            {booking.paymentProofUrl && (
              <a href={booking.paymentProofUrl} target="_blank" rel="noreferrer" className="mt-3 block">
                <img src={booking.paymentProofUrl} alt="Payment proof" className="w-full max-h-56 object-contain rounded-xl bg-surface-container border border-outline-variant/20" />
              </a>
            )}
            {booking.paymentReviewDecision && (
              <div className="mt-3 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
                <p className="font-semibold text-on-surface capitalize">{booking.paymentReviewDecision}</p>
                <p>Reviewed by {booking.paymentReviewedByName || 'Reviewer'} • {formatDateTime(booking.paymentReviewedAt)}</p>
                {booking.paymentReviewNote ? <p className="mt-2">{booking.paymentReviewNote}</p> : null}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/20 p-4">
            <h3 className="font-semibold text-on-surface mb-4">Timeline</h3>
            <BookingStatusTimeline booking={booking} />
          </section>

          <div className="flex flex-wrap gap-2 pt-1">
            {booking.status === 'pending' && (
              <button onClick={() => onCallNext?.(booking.id)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Confirm</button>
            )}
            {(booking.status === 'checked_in' || booking.status === 'confirmed') && (
              <button onClick={() => onStartService?.(booking.id)} className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-semibold">Start</button>
            )}
            {booking.status === 'in_progress' && (
              <button onClick={() => onCompleteBooking?.(booking.id)} className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-semibold">Complete</button>
            )}
            {booking.paymentProofUrl && (
              <button onClick={() => onReviewPayment?.(booking)} className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold">Review Proof</button>
            )}
            {canCancel && (
              <button onClick={() => onCancelBooking?.(booking.id)} className="px-4 py-2 rounded-xl bg-tertiary-container text-on-tertiary-container text-sm font-semibold">Cancel</button>
            )}
            <button onClick={() => onDeleteBooking?.(booking.id)} className="px-4 py-2 rounded-xl bg-error-container text-error text-sm font-semibold">Delete</button>
          </div>
        </div>
      </aside>
    </div>
  );
};
