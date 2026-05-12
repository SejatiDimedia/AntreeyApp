import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingFilters } from './components/BookingFilters';
import { BookingTable } from './components/BookingTable';
import { CalendarCard } from './components/CalendarCard';
import { WeeklyChart } from './components/WeeklyChart';
import { Promotions } from './components/Promotions';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const getTodayDateKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const BookingsPage = () => {
  const navigate = useNavigate();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    serviceId: '',
    date: getTodayDateKey(),
    timeSlot: '',
    durationMinutes: '30'
  });

  const getCurrentRoundedTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const rounded = Math.ceil(minutes / 5) * 5;
    if (rounded === 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    } else {
      now.setMinutes(rounded);
    }
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  useEffect(() => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }

    const unsubscribe = BookingRepository.subscribeToAllBookings(activeBusiness.id, (data) => {
      setBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeBusiness]);

  useEffect(() => {
    async function loadServices() {
      if (!activeBusiness?.id) {
        setServices([]);
        return;
      }
      try {
        const list = await BusinessRepository.getServices(activeBusiness.id);
        setServices(list);
      } catch (error) {
        console.error('Error loading services for walk-in:', error);
        setServices([]);
      }
    }
    loadServices();
  }, [activeBusiness?.id]);

  const handleCallNext = async (bookingId) => {
    if (!activeBusiness) return;
    try {
      await BookingRepository.updateBookingStatus(activeBusiness.id, bookingId, 'confirmed');
    } catch (error) {
      console.error('Error calling next:', error);
    }
  };

  const handleOpenWalkInModal = () => {
    const firstService = services[0];
    setWalkInForm({
      customerName: '',
      serviceId: firstService?.id || '',
      date: selectedDate,
      timeSlot: getCurrentRoundedTime(),
      durationMinutes: String(firstService?.durationMinutes || firstService?.duration || 30)
    });
    setWalkInModalOpen(true);
  };

  const handleCreateWalkIn = async () => {
    if (!activeBusiness?.id) return;
    const customerName = walkInForm.customerName.trim();
    const selectedService = services.find((item) => item.id === walkInForm.serviceId);
    const serviceName = selectedService?.name || selectedService?.title || '';
    const date = walkInForm.date;
    const timeSlot = walkInForm.timeSlot;
    const durationMinutes = Number(walkInForm.durationMinutes || 30);
    if (!customerName || !serviceName || !date || !timeSlot || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      toast.error('Lengkapi data walk-in terlebih dahulu.');
      return;
    }
    setWalkInSubmitting(true);
    try {
      await BookingRepository.createWalkInBooking(activeBusiness.id, {
        customerName,
        customerId: `walkin-${Date.now()}`,
        userId: `walkin-${Date.now()}`,
        serviceId: selectedService?.id || 'walkin',
        serviceName,
        resourceIds: selectedService?.resourceIds || [],
        staffId: 'any',
        staffName: 'Any Available Staff',
        date,
        timeSlot,
        durationMinutes
      });
      toast.success('Walk-in booking berhasil dibuat.');
      setWalkInModalOpen(false);
    } catch (error) {
      if (error?.code === 'booking/conflict') {
        toast.error('Waktu bentrok dengan booking lain.');
      } else {
        toast.error('Gagal membuat walk-in booking.');
      }
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const bookingCountByDate = bookings.reduce((acc, item) => {
    const key = item.date;
    if (!key) return acc;
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredBookings = bookings
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => {
      const aQueue = Number(a.queuePosition || 0);
      const bQueue = Number(b.queuePosition || 0);
      if (aQueue > 0 && bQueue > 0) return aQueue - bQueue;
      return String(a.timeSlot || '').localeCompare(String(b.timeSlot || ''));
    });

  if (businessLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeBusiness) {
    return (
      <div className="glass-card rounded-[32px] p-12 text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">No Business Found</h2>
        <p className="text-on-surface-variant mb-6">Please set up your business in the Settings page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BookingFilters />
      
      {/* Bento Booking Table */}
      <div className="grid grid-cols-12 gap-card-gap">
        <div className="col-span-12 lg:col-span-9 glass-card rounded-3xl overflow-hidden flex flex-col">
          <BookingTable
            bookings={filteredBookings}
            onCallNext={handleCallNext}
            onOpenTv={() => navigate('/queue-tv')}
            onCreateWalkIn={handleOpenWalkInModal}
            queueConfig={{
              prefix: activeBusiness?.queuePrefix || 'A',
              padLength: Number(activeBusiness?.queuePadLength || 1)
            }}
          />
        </div>
        
        {/* Sidebar Calendar & Stats (Bento Style) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-card-gap">
          <CalendarCard
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            monthAnchor={monthAnchor}
            onPrevMonth={() => setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            onNextMonth={() => setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            bookingCountByDate={bookingCountByDate}
          />
          <WeeklyChart />
          
          {/* Quick Insights */}
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between border-l-4 border-primary">
            <div>
              <p className="text-label-sm text-on-surface-variant">Busiest Slot</p>
              <p className="font-headline-lg-mobile text-primary">14:00 - 15:30</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[32px]">bolt</span>
          </div>
        </div>
      </div>
      
      <Promotions />

      {walkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !walkInSubmitting && setWalkInModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-primary/5">
              <div>
                <h3 className="font-headline-lg-mobile text-[22px] text-on-surface">Add Walk-in Booking</h3>
                <p className="text-sm text-on-surface-variant">Masukkan customer yang datang langsung ke toko.</p>
              </div>
              <button
                onClick={() => !walkInSubmitting && setWalkInModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-on-surface mb-1 block">Customer Name</label>
                <input className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low" value={walkInForm.customerName} onChange={(e) => setWalkInForm((p) => ({ ...p, customerName: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-on-surface mb-1 block">Service</label>
                <select
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low"
                  value={walkInForm.serviceId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const nextService = services.find((item) => item.id === nextId);
                    setWalkInForm((p) => ({
                      ...p,
                      serviceId: nextId,
                      durationMinutes: String(nextService?.durationMinutes || nextService?.duration || 30)
                    }));
                  }}
                >
                  <option value="">Pilih service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {(service.name || service.title || 'Service')} - {Number(service.durationMinutes || service.duration || 30)}m
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1 block">Date</label>
                <input type="date" className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low" value={walkInForm.date} onChange={(e) => setWalkInForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1 block">Start Time</label>
                <input type="time" className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low" value={walkInForm.timeSlot} onChange={(e) => setWalkInForm((p) => ({ ...p, timeSlot: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1 block">Duration (minutes)</label>
                <input type="number" min="5" step="5" readOnly className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface-variant" value={walkInForm.durationMinutes} />
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setWalkInModalOpen(false)}
                disabled={walkInSubmitting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWalkIn}
                disabled={walkInSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold"
              >
                {walkInSubmitting ? 'Saving...' : 'Create Walk-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
