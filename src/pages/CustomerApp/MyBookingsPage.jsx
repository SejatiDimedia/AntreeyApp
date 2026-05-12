import React, { useEffect, useState } from 'react';
import { BookingRepository } from '../../repositories/BookingRepository';
import { useAuth } from '../../context/AuthContext';
import { formatQueueNumber } from '../../utils/queueNumber';

export const MyBookingsPage = ({ businessId, onBack, onOpenTicket, queueConfig = {} }) => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!businessId || !currentUser?.uid) return;
    const unsubscribe = BookingRepository.subscribeToCustomerBookings(
      businessId,
      currentUser.uid,
      setBookings
    );
    return () => unsubscribe();
  }, [businessId, currentUser?.uid]);

  return (
    <div className="flex flex-col min-h-full bg-surface-bright">
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-label-md text-[16px]">My Bookings</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-3">
        {bookings.length === 0 && (
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 text-on-surface-variant text-sm">
            Belum ada booking yang diajukan.
          </div>
        )}
        {bookings.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpenTicket(item.id)}
            className="bg-white border border-outline-variant/20 rounded-2xl p-4 w-full text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-label-md">{item.serviceName || 'Service'}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-surface-container">
                {item.status || 'pending'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">{item.date} • {item.timeSlot}</p>
            <p className="text-sm text-on-surface-variant">Queue: {formatQueueNumber(item.queuePosition, queueConfig)}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
