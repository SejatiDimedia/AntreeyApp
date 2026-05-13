import React, { useEffect, useMemo, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { formatQueueNumber } from '../../utils/queueNumber';

const getLocalDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const QueueTvPage = () => {
  const { activeBusiness } = useBusiness();
  const [bookings, setBookings] = useState([]);
  const [viewMode, setViewMode] = useState('global'); // global | service

  useEffect(() => {
    if (!activeBusiness?.id) return;
    const unsubscribe = BookingRepository.subscribeToAllBookings(activeBusiness.id, setBookings);
    return () => unsubscribe();
  }, [activeBusiness?.id]);

  const today = getLocalDateString(new Date());
  const todaysBookings = useMemo(() => {
    const rows = bookings.filter((item) => item.date === today);
    rows.sort((a, b) => {
      const aQueue = Number(a.queuePosition || 0);
      const bQueue = Number(b.queuePosition || 0);
      if (aQueue > 0 && bQueue > 0) return aQueue - bQueue;
      if (aQueue > 0) return -1;
      if (bQueue > 0) return 1;

      const aTime = a.timeSlot || '';
      const bTime = b.timeSlot || '';
      if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);

      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });

    const normalized = rows.map((item, idx) => ({
      ...item,
      queueNo: Number(item.queuePosition || 0) > 0 ? Number(item.queuePosition) : idx + 1
    }));
    return normalized;
  }, [bookings, today]);

  const nowServing =
    todaysBookings.find((item) => item.status === 'in_progress') ||
    todaysBookings.find((item) => item.status === 'confirmed') ||
    todaysBookings.find((item) => item.status === 'checked_in') ||
    todaysBookings[0] ||
    null;
  const waiting = todaysBookings
    .filter((item) => item.status === 'pending')
    .slice(0, 6);
  const serviceLanes = useMemo(() => {
    const groups = {};
    todaysBookings.forEach((item) => {
      const key = item.serviceName || 'General Service';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).map(([serviceName, rows]) => {
      const sorted = [...rows].sort((a, b) => Number(a.queueNo || 0) - Number(b.queueNo || 0));
      return {
        serviceName,
        nowServing:
          sorted.find((item) => item.status === 'in_progress') ||
          sorted.find((item) => item.status === 'confirmed') ||
          sorted.find((item) => item.status === 'checked_in') ||
          sorted[0] ||
          null,
        waiting: sorted.filter((item) => item.status === 'pending' || item.status === 'checked_in').slice(0, 5)
      };
    });
  }, [todaysBookings]);
  const queueConfig = {
    prefix: activeBusiness?.queuePrefix || 'A',
    padLength: Number(activeBusiness?.queuePadLength || 1)
  };

  if (!activeBusiness?.id) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Queue TV</h1>
          <p className="text-slate-300">Please select an active business first from the dashboard or bookings page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-slate-300 text-sm uppercase tracking-[0.2em]">Queue Display</p>
            <h1 className="text-4xl md:text-6xl font-bold mt-2">{activeBusiness?.name || 'Business'}</h1>
          </div>
          <div className="text-right">
            <div className="mb-3 inline-flex bg-white/10 rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setViewMode('global')}
                className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'global' ? 'bg-white text-slate-900 font-semibold' : 'text-white/90'}`}
              >
                Global
              </button>
              <button
                onClick={() => setViewMode('service')}
                className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'service' ? 'bg-white text-slate-900 font-semibold' : 'text-white/90'}`}
              >
                Per Service
              </button>
            </div>
            <p className="text-slate-300 text-sm">Today</p>
            <p className="text-2xl md:text-3xl font-semibold">{new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>

        {viewMode === 'global' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
              <p className="text-slate-200 text-lg mb-2">Now Serving</p>
              <div className="text-7xl md:text-8xl font-extrabold tracking-wider">
                {formatQueueNumber(nowServing?.queueNo, queueConfig)}
              </div>
              <p className="text-xl text-slate-100 mt-3">{nowServing?.customerName || 'Waiting for next customer'}</p>
              <p className="text-slate-300 mt-1">{nowServing?.serviceName || '-'}</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
              <p className="text-slate-200 text-lg mb-4">Waiting List</p>
              <div className="space-y-3">
                {waiting.length === 0 && <p className="text-slate-300">No waiting queue</p>}
                {waiting.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                    <span className="font-bold text-2xl">{formatQueueNumber(item.queueNo, queueConfig)}</span>
                    <span className="text-slate-200 text-sm text-right ml-4 truncate">{item.customerName || 'Customer'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {serviceLanes.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 text-slate-200">
                No queue for today.
              </div>
            )}
            {serviceLanes.map((lane) => (
              <div key={lane.serviceName} className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
                <p className="text-slate-300 text-sm mb-1">Service Lane</p>
                <h3 className="text-xl font-bold mb-4">{lane.serviceName}</h3>
                <p className="text-slate-200 text-sm">Now Serving</p>
                <div className="text-4xl font-extrabold mb-1">{formatQueueNumber(lane.nowServing?.queueNo, queueConfig)}</div>
                <p className="text-sm text-slate-300 mb-4 truncate">{lane.nowServing?.customerName || 'Waiting...'}</p>
                <p className="text-slate-200 text-sm mb-2">Waiting</p>
                <div className="space-y-2">
                  {lane.waiting.length === 0 && <p className="text-slate-400 text-sm">No waiting queue</p>}
                  {lane.waiting.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                      <span className="font-semibold">{formatQueueNumber(item.queueNo, queueConfig)}</span>
                      <span className="text-xs text-slate-200 ml-2 truncate">{item.customerName || 'Customer'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
