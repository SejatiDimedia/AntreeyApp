import React from 'react';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isFilled = (value) => value !== undefined && value !== null && value !== '';

export const getBookingTimelineSteps = (booking = {}) => {
  const status = String(booking.status || 'pending').toLowerCase();
  const paymentStatus = String(booking.paymentStatus || '').toLowerCase();
  const hasPayment = Boolean(booking.paymentRequired || paymentStatus === 'awaiting_payment' || paymentStatus === 'proof_submitted' || paymentStatus === 'approved' || paymentStatus === 'rejected');
  const isCancelled = status === 'cancelled';

  const steps = [
    {
      key: 'created',
      label: 'Booking Created',
      description: 'Your booking request was created.',
      icon: 'event_available',
      time: booking.createdAt,
      complete: true
    }
  ];

  if (hasPayment) {
    steps.push({
      key: 'payment_required',
      label: 'Payment Required',
      description: 'A deposit is required to secure this slot.',
      icon: 'payments',
      time: booking.createdAt,
      complete: ['awaiting_payment', 'proof_submitted', 'approved', 'rejected'].includes(paymentStatus) || status !== 'pending'
    });
    steps.push({
      key: 'proof_submitted',
      label: paymentStatus === 'rejected' ? 'Proof Needs Revision' : 'Proof Submitted',
      description: paymentStatus === 'rejected'
        ? (booking.paymentReviewNote || 'The submitted proof needs correction.')
        : 'Payment proof has been uploaded for review.',
      icon: paymentStatus === 'rejected' ? 'report' : 'receipt_long',
      time: booking.paymentProofSubmittedAt,
      complete: ['proof_submitted', 'approved', 'rejected'].includes(paymentStatus),
      tone: paymentStatus === 'rejected' ? 'danger' : 'info'
    });
    steps.push({
      key: 'payment_reviewed',
      label: paymentStatus === 'approved' ? 'Payment Approved' : paymentStatus === 'rejected' ? 'Payment Rejected' : 'Payment Review',
      description: paymentStatus === 'approved'
        ? 'The business has approved your payment proof.'
        : paymentStatus === 'rejected'
          ? (booking.paymentReviewNote || 'Please upload a corrected proof.')
          : 'The business team will review your proof.',
      icon: paymentStatus === 'approved' ? 'verified' : paymentStatus === 'rejected' ? 'cancel' : 'manage_search',
      time: booking.paymentReviewedAt,
      complete: ['approved', 'rejected'].includes(paymentStatus),
      tone: paymentStatus === 'rejected' ? 'danger' : paymentStatus === 'approved' ? 'success' : 'default'
    });
  }

  steps.push({
    key: 'confirmed',
    label: 'Booking Confirmed',
    description: 'Your booking slot is confirmed.',
    icon: 'task_alt',
    time: booking.confirmedAt || booking.paymentReviewedAt,
    complete: ['confirmed', 'checked_in', 'in_progress', 'completed'].includes(status) || paymentStatus === 'approved'
  });

  steps.push({
    key: 'checked_in',
    label: 'Checked In',
    description: 'You have arrived and checked in.',
    icon: 'login',
    time: booking.checkedInAt,
    complete: ['checked_in', 'in_progress', 'completed'].includes(status) || isFilled(booking.checkedInAt)
  });

  steps.push({
    key: 'serving',
    label: 'Now Serving',
    description: 'Your service is in progress.',
    icon: 'autoplay',
    time: booking.startedAt,
    complete: ['in_progress', 'completed'].includes(status) || isFilled(booking.startedAt)
  });

  steps.push({
    key: 'completed',
    label: isCancelled ? 'Booking Cancelled' : 'Completed',
    description: isCancelled ? 'This booking was cancelled.' : 'The booking has been completed.',
    icon: isCancelled ? 'event_busy' : 'done_all',
    time: isCancelled ? booking.cancelledAt : booking.completedAt,
    complete: isCancelled || status === 'completed',
    tone: isCancelled ? 'danger' : 'success'
  });

  return steps;
};

const toneClasses = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-surface-container text-on-surface-variant border-outline-variant/20'
};

export const BookingStatusTimeline = ({ booking, compact = false, className = '' }) => {
  const steps = getBookingTimelineSteps(booking);
  const firstIncompleteIndex = steps.findIndex((step) => !step.complete);
  const activeIndex = firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;

  return (
    <div className={className}>
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {steps.map((step, index) => {
          const isComplete = Boolean(step.complete);
          const isActive = index === activeIndex && !isComplete;
          const tone = step.tone || 'default';
          const iconClass = isComplete
            ? (toneClasses[tone] || toneClasses.default)
            : isActive
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-outline border-outline-variant/30';

          return (
            <div key={step.key} className="relative flex gap-3">
              {index < steps.length - 1 && (
                <div className={`absolute left-4 top-8 bottom-[-14px] w-px ${isComplete ? 'bg-primary/30' : 'bg-outline-variant/30'}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${iconClass}`}>
                <span className="material-symbols-outlined text-[16px]">{isComplete ? step.icon : isActive ? 'radio_button_checked' : step.icon}</span>
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${isComplete || isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                  {step.time && <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{formatTime(step.time)}</span>}
                </div>
                {!compact && <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{step.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
