import React from 'react';
import { QuickStats } from './components/QuickStats';
import { TodaysSchedule } from './components/TodaysSchedule';
import { CalendarWidget } from './components/CalendarWidget';
import { WeeklyChart } from './components/WeeklyChart';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const [todayBookings, setTodayBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const unsubscribe = BookingRepository.subscribeToTodaysBookings(
      activeBusiness.id,
      todayStr,
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
        createdAt: new Date().toISOString()
      });
      // BusinessContext listener will automatically pick this up
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

  return (
    <div className="grid grid-cols-12 gap-card-gap pb-12 relative z-10">
      {/* Left Side: Stats and Schedule */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-card-gap">
        <QuickStats bookings={todayBookings} staff={staff} />
        <TodaysSchedule bookings={todayBookings} />
      </div>

      {/* Right Side: Calendar and Analytics */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-card-gap">
        <CalendarWidget bookings={allBookings} />
        <WeeklyChart bookings={allBookings} />
      </div>

    </div>
  );
};
