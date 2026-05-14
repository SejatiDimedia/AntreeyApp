import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BookingRepository } from '../../repositories/BookingRepository';
import { formatQueueNumber } from '../../utils/queueNumber';
import { BookingStatusTimeline } from '../../components/booking/BookingStatusTimeline';

export const TicketPage = ({ businessId, bookingId, onHome, queueConfig = {} }) => {
  const [booking, setBooking] = useState(null);
  const [nowServing, setNowServing] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || !businessId) return;

    const bookingRef = doc(db, `businesses/${businessId}/bookings`, bookingId);
    const unsubscribe = onSnapshot(bookingRef, (docSnap) => {
      if (docSnap.exists()) {
        setBooking({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId, businessId]);

  useEffect(() => {
    if (!businessId || !booking?.date) return;
    const unsubscribe = BookingRepository.subscribeToNowServing(
      businessId,
      booking.date,
      (current) => setNowServing(current)
    );
    return () => unsubscribe();
  }, [businessId, booking?.date]);

  useEffect(() => {
    if (!businessId || !booking?.date) return;
    const unsubscribe = BookingRepository.subscribeToActiveBookingsByDate(
      businessId,
      booking.date,
      (rows) => {
        const queueRows = rows
          .filter((item) => item.status === 'pending' || item.status === 'checked_in' || item.status === 'confirmed')
          .sort((a, b) => Number(a.queuePosition || 0) - Number(b.queuePosition || 0));
        setActiveQueue(queueRows);
      }
    );
    return () => unsubscribe();
  }, [businessId, booking?.date]);

  const currentQueue = Number(booking?.queuePosition || 0);
  const nowServingQueue = Number(nowServing?.queuePosition || 0);
  const isServing = booking?.status === 'confirmed' || booking?.status === 'in_progress';
  const aheadCount = isServing
    ? 0
    : Math.max(0, currentQueue - (nowServingQueue || 1));
  const avgDuration = (() => {
    const durations = activeQueue
      .map((item) => Number(item.durationMinutes || item.duration || 30))
      .filter((v) => Number.isFinite(v) && v > 0);
    if (durations.length === 0) return 30;
    return Math.round(durations.reduce((sum, v) => sum + v, 0) / durations.length);
  })();
  const estWaitMinutes = isServing ? 0 : aheadCount * avgDuration;
  const estWaitLabel = isServing
    ? 'NOW'
    : estWaitMinutes <= 0
      ? '<1m'
      : `${estWaitMinutes}m`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-black text-white/40 uppercase tracking-widest">Verifying Ticket...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-900 relative overflow-hidden pb-12">
      {/* Cinematic Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>

      {/* Header */}
      <div className="px-6 py-8 flex items-center justify-between text-white relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">Your Ticket</h1>
        </div>
        <button
          onClick={onHome}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 backdrop-blur-md border border-white/10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="px-6 flex-1 flex flex-col relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <h2 className="text-white text-2xl font-black tracking-tight mb-2">Ready to be served?</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Please arrive 5 minutes before your time slot and show this digital ticket to our staff.
          </p>
        </div>

        {/* Premium Ticket Component */}
        <div className="flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          {/* Ticket Header (Branding) */}
          <div className="bg-surface-bright rounded-t-[40px] p-6 pb-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-black">A</div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Antreey Digital Pass</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isServing ? 'bg-emerald-500 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {booking?.status?.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Main Ticket Body (Queue Number) */}
          <div className="bg-surface-bright p-8 pt-4 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03),transparent)] pointer-events-none" />

            <p className="text-on-surface-variant/40 text-[11px] font-black uppercase tracking-[0.3em] mb-4">Queue Number</p>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-[84px] font-black text-on-surface leading-none tracking-tighter relative z-10">
                {formatQueueNumber(booking?.queuePosition, queueConfig)}
              </h2>
            </div>

            <div className="w-full h-px bg-outline-variant/10 my-8 relative">
              <div className="absolute -left-11 -top-4 w-8 h-8 bg-slate-900 rounded-full" />
              <div className="absolute -right-11 -top-4 w-8 h-8 bg-slate-900 rounded-full" />
              <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-outline-variant/20" />
            </div>

            <div className="grid grid-cols-2 gap-10 w-full mb-8">
              <div className="text-center">
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-lg font-black text-on-surface leading-none">{aheadCount === 0 ? 'Serving' : `${aheadCount} Ahead`}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Wait Time</p>
                <p className="text-lg font-black text-primary leading-none">{estWaitLabel}</p>
              </div>
            </div>

            <div className="w-full bg-surface-container-low rounded-[32px] p-5 flex items-center justify-between border border-outline-variant/10 shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Now Serving</span>
                <span className="text-lg font-black text-on-surface">{formatQueueNumber(nowServing?.queuePosition, queueConfig)}</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-wider">
                Live Update
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              </div>
            </div>
          </div>

          {/* Ticket Footer (Details) */}
          <div className="bg-surface-container-low rounded-b-[40px] p-8 space-y-6 relative border-t-2 border-dashed border-outline-variant/20">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Service</p>
                <p className="text-sm font-black text-on-surface">{booking?.serviceName}</p>
              </div>
              <div>
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-black text-on-surface">{booking?.date}</p>
              </div>
              <div>
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Time Slot</p>
                <p className="text-sm font-black text-on-surface">{booking?.timeSlot}</p>
              </div>
              <div>
                <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-1">Staff</p>
                <p className="text-sm font-black text-on-surface">{booking?.staffName || 'Auto Assigned'}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6 px-4 bg-surface-bright rounded-[32px] border border-outline-variant/10 shadow-sm group">
              <span className="material-symbols-outlined text-[72px] text-on-surface mb-3 group-hover:scale-110 transition-transform duration-500">qr_code_2</span>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Pass ID</p>
                <p className="font-mono text-[12px] font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-lg">
                  {booking?.id?.substring(0, 12).toUpperCase()}
                </p>
              </div>
            </div>


          </div>
        </div>

        <button
          onClick={onHome}
          className="mt-10 h-14 w-full rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm tracking-tight transition-all active:scale-[0.98] border border-white/10 mb-8"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
