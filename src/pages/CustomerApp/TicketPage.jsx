import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BookingRepository } from '../../repositories/BookingRepository';
import { formatQueueNumber } from '../../utils/queueNumber';

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
  const aheadCount = booking?.status === 'confirmed'
    ? 0
    : Math.max(0, currentQueue - (nowServingQueue || 1));
  const avgDuration = (() => {
    const durations = activeQueue
      .map((item) => Number(item.durationMinutes || item.duration || 30))
      .filter((v) => Number.isFinite(v) && v > 0);
    if (durations.length === 0) return 30;
    return Math.round(durations.reduce((sum, v) => sum + v, 0) / durations.length);
  })();
  const estWaitMinutes = booking?.status === 'confirmed' ? 0 : aheadCount * avgDuration;
  const estWaitLabel = booking?.status === 'confirmed'
    ? 'NOW'
    : estWaitMinutes <= 0
      ? '<1m'
      : `${estWaitMinutes}m`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-primary relative overflow-hidden pb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between text-white relative z-10 mt-4">
        <h1 className="font-headline-lg-mobile text-[24px]">Your Ticket</h1>
        <button onClick={onHome} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col relative z-10">
        <p className="text-white/80 text-[15px] mb-6">
          Show this ticket to the staff upon arrival. We'll notify you when it's almost your turn.
        </p>

        {/* The Ticket */}
        <div className="bg-surface rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col">
          {/* Top section (Status & Queue Number) */}
          <div className="p-8 flex flex-col items-center border-b-[3px] border-dashed border-outline-variant/30 bg-surface-bright relative">
            {/* Cutout circles for ticket effect */}
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-primary rounded-full"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-primary rounded-full"></div>
            
            <div className={`px-4 py-1.5 rounded-full font-label-md text-[12px] flex items-center gap-1 mb-6 ${booking?.status === 'confirmed' ? 'bg-primary text-white' : 'bg-tertiary-container/30 text-tertiary animate-pulse'}`}>
              <span className={`w-2 h-2 rounded-full ${booking?.status === 'confirmed' ? 'bg-white' : 'bg-tertiary'}`}></span>
              {booking?.status === 'confirmed' ? "It's your turn!" : "Queue is Moving"}
            </div>

            <p className="text-on-surface-variant text-[14px] uppercase tracking-wider mb-2">Your Queue Number</p>
            <h2 className="font-headline-xl text-[64px] leading-none text-on-surface font-bold text-center">
              {formatQueueNumber(booking?.queuePosition, queueConfig)}
            </h2>
            <div className="mt-4 px-4 py-2 rounded-xl bg-surface-container text-on-surface">
              <p className="text-[12px] text-on-surface-variant">Now Serving</p>
              <p className="font-label-md text-[16px]">
                {formatQueueNumber(nowServing?.queuePosition, queueConfig)}
              </p>
            </div>
            
            <div className="flex items-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-on-surface-variant text-[12px]">Ahead of you</p>
                <p className="font-headline-lg-mobile text-[24px] text-on-surface">{aheadCount}</p>
              </div>
              <div className="w-[1px] h-10 bg-outline-variant/30"></div>
              <div className="text-center">
                <p className="text-on-surface-variant text-[12px]">Est. Wait</p>
                <p className="font-headline-lg-mobile text-[24px] text-primary">{estWaitLabel}</p>
              </div>
            </div>
          </div>

          {/* Bottom section (Details & QR) */}
          <div className="p-8 bg-surface">
            <h3 className="font-label-md text-[18px] text-on-surface mb-6 border-b border-outline-variant/20 pb-4">
              Booking Details
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-[14px]">Service</span>
                <span className="font-label-md text-[14px] text-right">{booking?.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-[14px]">Date</span>
                <span className="font-label-md text-[14px] text-right">{booking?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-[14px]">Time</span>
                <span className="font-label-md text-[14px] text-right">{booking?.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-[14px]">Staff</span>
                <span className="font-label-md text-[14px] text-right">{booking?.staffName}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl">
              <span className="material-symbols-outlined text-[64px] text-on-surface mb-2">qr_code_2</span>
              <p className="font-mono text-on-surface-variant text-[12px] tracking-widest uppercase">ID: {booking?.id?.substring(0, 8)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
