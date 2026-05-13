import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingFilters } from './components/BookingFilters';
import { BookingTable } from './components/BookingTable';
import { BookingDetailDrawer } from './components/BookingDetailDrawer';
import { CalendarCard } from './components/CalendarCard';
import { WeeklyChart } from './components/WeeklyChart';
import { Promotions } from './components/Promotions';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const getTodayDateKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatReviewTime = (value) => {
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

export const BookingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [detailBookingId, setDetailBookingId] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [services, setServices] = useState([]);
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    serviceId: '',
    date: getTodayDateKey(),
    timeSlot: '',
    durationMinutes: '30'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    bookingId: '',
    action: '', // cancel | delete
    title: '',
    message: ''
  });
  const [reviewModal, setReviewModal] = useState({
    open: false,
    booking: null,
    note: '',
    submitting: false
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
  const handleStartService = async (bookingId) => {
    if (!activeBusiness?.id) return;
    try {
      await BookingRepository.updateBookingStatus(activeBusiness.id, bookingId, 'in_progress');
      toast.success('Service started.');
    } catch (error) {
      toast.error('Failed to start service.');
    }
  };
  const handleCompleteBooking = async (bookingId) => {
    if (!activeBusiness?.id) return;
    try {
      await BookingRepository.updateBookingStatus(activeBusiness.id, bookingId, 'completed');
      toast.success('Booking completed.');
    } catch (error) {
      toast.error('Failed to complete booking.');
    }
  };

  const openConfirm = (bookingId, action) => {
    if (action === 'cancel') {
      setConfirmDialog({
        open: true,
        bookingId,
        action,
        title: 'Cancel Booking?',
        message: 'This booking will be marked as cancelled. This may affect the active queue.'
      });
      return;
    }
    setConfirmDialog({
      open: true,
      bookingId,
      action,
      title: 'Delete Booking Permanently?',
      message: 'This booking will be permanently deleted and cannot be restored.'
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!activeBusiness?.id) return;
    try {
      await BookingRepository.updateBookingStatus(activeBusiness.id, bookingId, 'cancelled');
      toast.success('Booking cancelled.');
    } catch (error) {
      console.error('Cancel booking failed:', error);
      toast.error('Failed to cancel booking.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!activeBusiness?.id) return;
    try {
      await BookingRepository.deleteBooking(activeBusiness.id, bookingId);
      toast.success('Booking deleted.');
    } catch (error) {
      console.error('Delete booking failed:', error);
      toast.error('Failed to delete booking.');
    }
  };

  const openPaymentReview = (booking) => {
    setReviewModal({
      open: true,
      booking,
      note: booking?.paymentReviewNote || '',
      submitting: false
    });
  };

  const handleReviewPayment = async (decision) => {
    if (!activeBusiness?.id || !reviewModal.booking?.id) return;
    setReviewModal((prev) => ({ ...prev, submitting: true }));
    try {
      await BookingRepository.reviewPaymentProof(
        activeBusiness.id,
        reviewModal.booking.id,
        decision,
        reviewModal.note,
        {
          uid: currentUser?.uid,
          name: userProfile?.name || currentUser?.displayName,
          email: userProfile?.email || currentUser?.email
        }
      );
      toast.success(decision === 'approve' ? 'Payment approved.' : 'Payment rejected.');
      setReviewModal({ open: false, booking: null, note: '', submitting: false });
    } catch (error) {
      toast.error('Failed to review payment proof.');
      setReviewModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.bookingId || !confirmDialog.action) return;
    if (confirmDialog.action === 'cancel') {
      await handleCancelBooking(confirmDialog.bookingId);
    } else if (confirmDialog.action === 'delete') {
      await handleDeleteBooking(confirmDialog.bookingId);
    }
    setConfirmDialog({ open: false, bookingId: '', action: '', title: '', message: '' });
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
      toast.error('Please complete the walk-in details first.');
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
      toast.success('Walk-in booking created successfully.');
      setWalkInModalOpen(false);
    } catch (error) {
      if (error?.code === 'booking/conflict') {
        toast.error('This time conflicts with another booking.');
      } else {
        toast.error('Failed to create walk-in booking.');
      }
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const handleCheckInByCode = async () => {
    if (!activeBusiness?.id) return;
    const code = checkInCode.trim();
    if (!code) {
      toast.error('Please enter the booking code first.');
      return;
    }
    setCheckInSubmitting(true);
    try {
      await BookingRepository.checkInByCode(activeBusiness.id, selectedDate, code);
      toast.success('Customer checked in successfully.');
      setCheckInModalOpen(false);
      setCheckInCode('');
    } catch (error) {
      if (error?.code === 'booking/not-found') {
        toast.error('Booking code was not found for this date.');
      } else {
        toast.error('Check-in failed. Please try again.');
      }
    } finally {
      setCheckInSubmitting(false);
    }
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  };

  const startScanner = async () => {
    try {
      const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      if (!hasBarcodeDetector) {
        setScannerSupported(false);
        toast.error('Scanner is not supported in this browser. Please enter the code manually.');
        return;
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScannerActive(true);
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const rawValue = String(codes[0].rawValue || '').trim();
            if (!rawValue) return;
            const parsed = rawValue.includes(':') ? rawValue.split(':').pop().trim() : rawValue;
            setCheckInCode(parsed.slice(0, 8));
            toast.success('Booking code detected.');
            stopScanner();
          }
        } catch {
          // no-op scan frame failure
        }
      }, 700);
    } catch (error) {
      console.error('Start scanner failed:', error);
      toast.error('Unable to access the camera.');
      stopScanner();
    }
  };

  const bookingCountByDate = bookings.reduce((acc, item) => {
    const key = item.date;
    if (!key) return acc;
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});

  const serviceOptions = services.map((item) => ({
    id: item.id,
    name: item.title || item.name || 'Service'
  }));

  const isWaitingReview = (item) =>
    String(item.status || '').toLowerCase() === 'awaiting_payment' &&
    String(item.paymentStatus || '').toLowerCase() === 'proof_submitted';

  const waitingReviewCount = bookings.filter((item) => item.date === selectedDate && isWaitingReview(item)).length;
  const queueConfig = {
    prefix: activeBusiness?.queuePrefix || 'A',
    padLength: Number(activeBusiness?.queuePadLength || 1)
  };

  const filteredBookings = bookings
    .filter((item) => item.date === selectedDate)
    .filter((item) => (selectedServiceId === 'all' ? true : item.serviceId === selectedServiceId))
    .filter((item) => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'waiting_review') return isWaitingReview(item);
      return String(item.status || '').toLowerCase() === selectedStatus;
    })
    .sort((a, b) => {
      const aQueue = Number(a.queuePosition || 0);
      const bQueue = Number(b.queuePosition || 0);
      if (aQueue > 0 && bQueue > 0) return aQueue - bQueue;
      return String(a.timeSlot || '').localeCompare(String(b.timeSlot || ''));
    });
  const detailBooking = bookings.find((item) => item.id === detailBookingId) || null;

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
      <BookingFilters
        serviceOptions={serviceOptions}
        selectedServiceId={selectedServiceId}
        onServiceChange={setSelectedServiceId}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDate={selectedDate}
        waitingReviewCount={waitingReviewCount}
      />
      
      {/* Bento Booking Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-card-gap">
        <div className="xl:col-span-9 glass-card rounded-3xl overflow-hidden flex flex-col">
        <BookingTable
          bookings={filteredBookings}
          onCallNext={handleCallNext}
          onStartService={handleStartService}
          onCompleteBooking={handleCompleteBooking}
          onCancelBooking={(id) => openConfirm(id, 'cancel')}
            onDeleteBooking={(id) => openConfirm(id, 'delete')}
            onOpenTv={() => navigate('/queue-tv')}
            onCreateWalkIn={handleOpenWalkInModal}
            onOpenCheckIn={() => {
              setCheckInCode('');
              setScannerSupported(true);
              setCheckInModalOpen(true);
            }}
            onReviewPayment={openPaymentReview}
            onOpenDetail={(booking) => setDetailBookingId(booking.id)}
            queueConfig={queueConfig}
          />
        </div>
        
        {/* Sidebar Calendar & Stats (Bento Style) */}
        <div className="xl:col-span-3 flex flex-col gap-4 sm:gap-card-gap">
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

      <BookingDetailDrawer
        open={Boolean(detailBooking)}
        booking={detailBooking}
        onClose={() => setDetailBookingId('')}
        onCallNext={handleCallNext}
        onStartService={handleStartService}
        onCompleteBooking={handleCompleteBooking}
        onCancelBooking={(id) => openConfirm(id, 'cancel')}
        onDeleteBooking={(id) => openConfirm(id, 'delete')}
        onReviewPayment={(booking) => {
          setDetailBookingId('');
          openPaymentReview(booking);
        }}
        queueConfig={queueConfig}
      />

      {walkInModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !walkInSubmitting && setWalkInModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-primary/5">
              <div>
                <h3 className="font-headline-lg-mobile text-[22px] text-on-surface">Add Walk-in Booking</h3>
                <p className="text-sm text-on-surface-variant">Add a customer who arrives directly at the store.</p>
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
                  <option value="">Select service</option>
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

      {checkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            if (!checkInSubmitting) {
              stopScanner();
              setCheckInModalOpen(false);
            }
          }} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-secondary-container/30">
              <div>
                <h3 className="font-headline-lg-mobile text-[22px] text-on-surface">Check-in Booking</h3>
                <p className="text-sm text-on-surface-variant">Enter the ticket code from the customer (for example, the first 8 ID characters).</p>
              </div>
              <button
                onClick={() => !checkInSubmitting && setCheckInModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface-variant">
                Active date: <span className="font-semibold text-on-surface">{selectedDate}</span>
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1 block">Booking Code</label>
                <input
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low uppercase tracking-widest"
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value)}
                  placeholder="e.g. 3fa9bc12"
                />
              </div>
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-on-surface">QR Scanner</p>
                  {!scannerActive ? (
                    <button onClick={startScanner} type="button" className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white">Start Scan</button>
                  ) : (
                    <button onClick={stopScanner} type="button" className="text-xs px-3 py-1.5 rounded-lg bg-error text-white">Stop</button>
                  )}
                </div>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/70 flex items-center justify-center">
                  <video ref={videoRef} className={`w-full h-full object-cover ${scannerActive ? 'block' : 'hidden'}`} muted playsInline />
                  {!scannerActive && (
                    <p className="text-xs text-white/80 px-4 text-center">
                      {scannerSupported ? 'Click Start Scan to open the camera.' : 'Scanner is not supported in this browser.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  stopScanner();
                  setCheckInModalOpen(false);
                }}
                disabled={checkInSubmitting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckInByCode}
                disabled={checkInSubmitting}
                className="px-5 py-2.5 rounded-xl bg-secondary text-white font-semibold"
              >
                {checkInSubmitting ? 'Checking...' : 'Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setConfirmDialog({ open: false, bookingId: '', action: '', title: '', message: '' })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20">
              <h3 className="text-[20px] font-bold text-on-surface">{confirmDialog.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ open: false, bookingId: '', action: '', title: '', message: '' })}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white font-semibold ${confirmDialog.action === 'delete' ? 'bg-error' : 'bg-tertiary'}`}
              >
                {confirmDialog.action === 'delete' ? 'Yes, Delete' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !reviewModal.submitting && setReviewModal({ open: false, booking: null, note: '', submitting: false })} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20 bg-blue-50">
              <h3 className="font-headline-lg-mobile text-[22px] text-on-surface">Review Payment Proof</h3>
              <p className="text-sm text-on-surface-variant">Check transfer proof before confirming booking.</p>
            </div>
            <div className="p-6 space-y-4">
              {reviewModal.booking?.paymentReviewedAt && (
                <div className={`rounded-2xl border p-4 text-sm ${
                  reviewModal.booking?.paymentStatus === 'approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {reviewModal.booking?.paymentStatus === 'approved' ? 'Payment Approved' : 'Payment Rejected'}
                    </p>
                    <span className="text-xs opacity-80">{formatReviewTime(reviewModal.booking.paymentReviewedAt)}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-85">
                    Reviewed by {reviewModal.booking?.paymentReviewedByName || 'Reviewer'}
                  </p>
                  {reviewModal.booking?.paymentReviewNote ? (
                    <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">
                      {reviewModal.booking.paymentReviewNote}
                    </p>
                  ) : null}
                </div>
              )}
              {reviewModal.booking?.paymentProofUrl ? (
                <a href={reviewModal.booking.paymentProofUrl} target="_blank" rel="noreferrer" className="block">
                  <img src={reviewModal.booking.paymentProofUrl} alt="Payment proof" className="w-full max-h-80 object-contain rounded-2xl border border-outline-variant/20 bg-surface-container-low" />
                </a>
              ) : (
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  No proof image found.
                </div>
              )}
              <textarea
                className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low"
                rows={3}
                placeholder="Internal note (optional)"
                value={reviewModal.note}
                onChange={(e) => setReviewModal((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setReviewModal({ open: false, booking: null, note: '', submitting: false })}
                disabled={reviewModal.submitting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface"
              >
                Close
              </button>
              <button
                onClick={() => handleReviewPayment('reject')}
                disabled={reviewModal.submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-100 text-rose-700 font-semibold"
              >
                Reject
              </button>
              <button
                onClick={() => handleReviewPayment('approve')}
                disabled={reviewModal.submitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
