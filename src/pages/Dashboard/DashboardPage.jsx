import React from 'react';
import { CalendarCard } from '../Bookings/components/CalendarCard';
import { WeeklyChart } from './components/WeeklyChart';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatQueueNumber } from '../../utils/queueNumber';

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const statusLabel = (status = '') => String(status || 'pending').replaceAll('_', ' ');

const isActiveBooking = (booking) => !['cancelled', 'completed'].includes(String(booking.status || '').toLowerCase());

const MetricCard = ({ title, value, caption, icon, tone = 'primary' }) => {
  const tones = {
    primary: 'bg-primary-container/30 text-primary border-primary/20',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  return (
    <div className="rounded-3xl bg-white border border-outline-variant/20 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-on-surface-variant">{title}</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${tones[tone] || tones.primary}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant mt-4">{caption}</p>
    </div>
  );
};

const SectionHeader = ({ title, caption, action }) => (
  <div className="flex items-start justify-between gap-4 mb-4">
    <div>
      <h2 className="text-xl font-bold text-on-surface">{title}</h2>
      {caption ? <p className="text-sm text-on-surface-variant mt-1">{caption}</p> : null}
    </div>
    {action}
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const [todayBookings, setTodayBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [monthAnchor, setMonthAnchor] = useState(new Date());

  useEffect(() => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }

    const unsubscribe = BookingRepository.subscribeToTodaysBookings(
      activeBusiness.id,
      getTodayKey(),
      (data) => {
        setTodayBookings(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeBusiness]);

  useEffect(() => {
    if (!activeBusiness?.id) {
      setAllBookings([]);
      return;
    }
    const unsubscribe = BookingRepository.subscribeToAllBookings(activeBusiness.id, setAllBookings);
    return () => unsubscribe();
  }, [activeBusiness?.id]);

  useEffect(() => {
    async function loadStaff() {
      if (!activeBusiness?.id) {
        setStaff([]);
        return;
      }
      try {
        const data = await BusinessRepository.getStaff(activeBusiness.id);
        setStaff(data);
      } catch (error) {
        console.error('Failed to load staff for dashboard:', error);
        setStaff([]);
      }
    }
    loadStaff();
  }, [activeBusiness?.id]);

  if (businessLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCreateBusiness = async () => {
    if (!currentUser) return;
    try {
      await BusinessRepository.createBusiness({
        name: `${currentUser.displayName || 'My'} Business`,
        ownerId: currentUser.uid,
        address: 'Set your address',
        category: 'Other',
        isPublic: true,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Failed to create business.');
    }
  };

  if (!activeBusiness) {
    return (
      <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">storefront</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">No Business Found</h2>
        <p className="text-on-surface-variant mb-8 max-w-md">You haven't set up a business yet. Create one now to start managing your queue.</p>
        <button 
          onClick={handleCreateBusiness}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          Create My Business
        </button>
      </div>
    );
  }

  const selectedDateBookings = allBookings
    .filter((booking) => booking.date === selectedDate)
    .sort((a, b) => String(a.timeSlot || '').localeCompare(String(b.timeSlot || '')));
  const activeQueue = todayBookings.filter(isActiveBooking);
  const waitingReview = allBookings.filter((booking) => booking.status === 'awaiting_payment' && booking.paymentStatus === 'proof_submitted');
  const awaitingPayment = allBookings.filter((booking) => booking.status === 'awaiting_payment' && booking.paymentStatus !== 'proof_submitted');
  const completedToday = todayBookings.filter((booking) => booking.status === 'completed').length;
  const activeStaffCount = staff.filter((member) => String(member.status || '').toLowerCase() !== 'off').length;
  const approvedDeposit = allBookings
    .filter((booking) => booking.paymentStatus === 'approved')
    .reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0);
  const projectedDepositToday = todayBookings.reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0);
  const nextBooking = selectedDateBookings.find(isActiveBooking) || null;
  const queueConfig = {
    prefix: activeBusiness?.queuePrefix || 'A',
    padLength: Number(activeBusiness?.queuePadLength || 1)
  };

  const bookingCountByDate = allBookings.reduce((acc, b) => {
    if (b.date) acc[b.date] = (acc[b.date] || 0) + 1;
    return acc;
  }, {});

  const serviceStats = Object.values(allBookings.reduce((acc, booking) => {
    const key = booking.serviceName || 'Service';
    if (!acc[key]) acc[key] = { serviceName: key, total: 0, completed: 0, deposit: 0 };
    acc[key].total += 1;
    if (booking.status === 'completed') acc[key].completed += 1;
    if (booking.paymentStatus === 'approved') acc[key].deposit += Number(booking.depositAmount || 0);
    return acc;
  }, {})).sort((a, b) => b.total - a.total).slice(0, 5);

  const currentTimeLabel = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pb-12 relative z-10 space-y-6">
      <section className="relative overflow-hidden rounded-[36px] bg-inverse-surface text-inverse-on-surface p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-16 bottom-[-80px] w-56 h-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div>
            <p className="text-sm text-white/60">Owner Command Center</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">{activeBusiness.name || 'Business Dashboard'}</h1>
            <p className="text-white/65 mt-3 max-w-2xl">Live operational view for queue, payments, staff capacity, and daily booking performance.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:min-w-[560px]">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-white/50 text-xs">Now</p>
              <p className="text-xl font-bold mt-1">{currentTimeLabel}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-white/50 text-xs">Queue Active</p>
              <p className="text-xl font-bold mt-1">{activeQueue.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-white/50 text-xs">Need Review</p>
              <p className="text-xl font-bold mt-1">{waitingReview.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-white/50 text-xs">Staff Ready</p>
              <p className="text-xl font-bold mt-1">{activeStaffCount}/{staff.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Bookings Today" value={todayBookings.length} caption={`${completedToday} completed, ${activeQueue.length} still active`} icon="event_note" tone="primary" />
        <MetricCard title="Payment Reviews" value={waitingReview.length} caption="Proofs waiting for owner/staff decision" icon="receipt_long" tone="blue" />
        <MetricCard title="Awaiting Payment" value={awaitingPayment.length} caption="Customers still need to upload proof" icon="payments" tone="amber" />
        <MetricCard title="Approved Deposits" value={formatCurrency(approvedDeposit)} caption={`${formatCurrency(projectedDepositToday)} projected deposits today`} icon="account_balance_wallet" tone="emerald" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap">
        <div className="xl:col-span-8 space-y-6">
          <section className="glass-card rounded-[32px] p-6">
            <SectionHeader
              title="Today's Operations"
              caption="Queue movement and the next customer to handle."
              action={<button onClick={() => navigate('/bookings')} className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold">Open Bookings</button>}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 rounded-3xl bg-primary-container/30 p-5">
                <p className="text-sm text-on-primary-container/70">Next Booking</p>
                {nextBooking ? (
                  <div className="mt-3">
                    <p className="text-3xl font-black text-on-primary-container">{nextBooking.timeSlot || '--:--'}</p>
                    <p className="font-semibold mt-3 text-on-surface">{nextBooking.customerName || 'Anonymous'}</p>
                    <p className="text-sm text-on-surface-variant">{nextBooking.serviceName || 'Service'}</p>
                    <span className="mt-4 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-on-primary-container">
                      {formatQueueNumber(nextBooking.queuePosition, queueConfig)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-on-surface-variant">No active booking for selected date.</p>
                )}
              </div>
              <div className="lg:col-span-2 rounded-3xl bg-white border border-outline-variant/20 overflow-hidden">
                <div className="grid grid-cols-4 bg-surface-container-low px-4 py-3 text-xs font-semibold text-on-surface-variant">
                  <span>Time</span>
                  <span className="col-span-2">Customer</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-outline-variant/10 max-h-[320px] overflow-y-auto">
                  {selectedDateBookings.length === 0 ? (
                    <div className="p-6 text-sm text-on-surface-variant text-center">No bookings on this date.</div>
                  ) : selectedDateBookings.slice(0, 8).map((booking) => (
                    <button key={booking.id} onClick={() => navigate('/bookings')} className="w-full grid grid-cols-4 gap-2 px-4 py-3 text-left hover:bg-surface-container-low transition-colors">
                      <span className="font-semibold text-on-surface">{booking.timeSlot || '--:--'}</span>
                      <span className="col-span-2 min-w-0">
                        <span className="block font-semibold text-sm truncate">{booking.customerName || 'Anonymous'}</span>
                        <span className="block text-xs text-on-surface-variant truncate">{booking.serviceName || 'Service'}</span>
                      </span>
                      <span className="text-xs capitalize text-on-surface-variant">{statusLabel(booking.status)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-[32px] p-6">
            <SectionHeader title="Service Performance" caption="Most booked services across the current business." />
            <div className="space-y-3">
              {serviceStats.length === 0 ? (
                <div className="rounded-2xl bg-white border border-outline-variant/20 p-5 text-sm text-on-surface-variant">No service data yet.</div>
              ) : serviceStats.map((item) => {
                const percent = Math.round((item.total / Math.max(serviceStats[0]?.total || 1, 1)) * 100);
                return (
                  <div key={item.serviceName} className="rounded-2xl bg-white border border-outline-variant/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-on-surface">{item.serviceName}</p>
                        <p className="text-xs text-on-surface-variant">{item.completed} completed • {formatCurrency(item.deposit)} approved deposits</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{item.total} bookings</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <CalendarCard 
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            monthAnchor={monthAnchor}
            onPrevMonth={() => setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            onNextMonth={() => setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            bookingCountByDate={bookingCountByDate}
          />
          <WeeklyChart bookings={allBookings} />

          <section className="glass-card rounded-[32px] p-6">
            <SectionHeader title="Attention Queue" caption="Items that need a quick decision." />
            <div className="space-y-3">
              <button onClick={() => navigate('/bookings')} className="w-full rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left hover:bg-blue-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-800">Payment proofs</span>
                  <span className="text-xl font-black text-blue-700">{waitingReview.length}</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Waiting for review</p>
              </button>
              <button onClick={() => navigate('/bookings')} className="w-full rounded-2xl bg-amber-50 border border-amber-100 p-4 text-left hover:bg-amber-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-800">Unpaid bookings</span>
                  <span className="text-xl font-black text-amber-700">{awaitingPayment.length}</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">Customers still need to submit proof</p>
              </button>
              <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface">Staff availability</span>
                  <span className="text-xl font-black text-on-surface">{activeStaffCount}/{staff.length}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Active staff configured for this business</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
