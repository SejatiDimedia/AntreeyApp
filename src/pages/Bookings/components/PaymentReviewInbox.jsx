import React from 'react';
import { formatQueueNumber } from '../../../utils/queueNumber';

const formatSubmittedTime = (value) => {
  if (!value) return 'Recently submitted';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!amount) return '-';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const PaymentReviewInbox = ({
  items = [],
  selectedDate,
  onReviewPayment,
  onOpenDetail,
  onShowAll,
  queueConfig = {}
}) => {
  const dateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'selected date';

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">All payments reviewed</p>
              <h3 className="text-xl font-bold text-on-surface mt-1">No proof needs attention for {dateLabel}.</h3>
              <p className="text-sm text-on-surface-variant mt-1">New payment proofs will appear here as soon as customers upload them.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onShowAll}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            View schedule
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 sm:p-6 shadow-sm overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-blue-200/30 blur-2xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700">Payment Review Inbox</p>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
              {items.length} payment {items.length > 1 ? 'proofs' : 'proof'} waiting for review
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Review uploaded transfer proofs before confirming the booking queue.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onShowAll}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">filter_alt</span>
          Focus waiting review
        </button>
      </div>

      <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-3">
        {items.slice(0, 4).map((booking) => (
          <article key={booking.id} className="rounded-2xl bg-white/85 border border-blue-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-primary-container/40 px-3 py-1 text-xs font-bold text-on-primary-container">
                    {formatQueueNumber(booking.queuePosition, queueConfig)}
                  </span>
                  <span className="text-xs text-blue-700 font-semibold">{formatSubmittedTime(booking.paymentProofSubmittedAt)}</span>
                </div>
                <h4 className="mt-3 text-base font-bold text-on-surface truncate">{booking.customerName || 'Anonymous Customer'}</h4>
                <p className="text-sm text-on-surface-variant truncate">{booking.serviceName || 'Service'} • {booking.timeSlot || '--:--'}</p>
              </div>
              {booking.paymentProofUrl && (
                <a href={booking.paymentProofUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="shrink-0">
                  <img src={booking.paymentProofUrl} alt="Payment proof preview" className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/20 bg-surface-container" />
                </a>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-surface-container-low px-3 py-2">
                <p className="text-on-surface-variant">Deposit</p>
                <p className="font-bold text-on-surface mt-0.5">{formatCurrency(booking.depositAmount)}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low px-3 py-2">
                <p className="text-on-surface-variant">Status</p>
                <p className="font-bold text-blue-700 mt-0.5">Waiting Review</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenDetail?.(booking)}
                className="rounded-full border border-outline-variant/30 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Detail
              </button>
              <button
                type="button"
                onClick={() => onReviewPayment?.(booking)}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Review Proof
              </button>
            </div>
          </article>
        ))}
      </div>

      {items.length > 4 && (
        <p className="relative mt-4 text-sm text-blue-700 font-semibold">+{items.length - 4} more proofs are available in the filtered booking list.</p>
      )}
    </section>
  );
};
