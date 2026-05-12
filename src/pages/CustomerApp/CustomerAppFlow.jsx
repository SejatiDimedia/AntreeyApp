import React, { useState, useEffect } from 'react';
import { StorefrontPage } from './StorefrontPage';
import { BookingFlowPage } from './BookingFlowPage';
import { TicketPage } from './TicketPage';
import { MyBookingsPage } from './MyBookingsPage';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';

const ACTIVE_BUSINESS_STORAGE_KEY = 'antreey_active_business_id';

export const CustomerAppFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeBusinessId: contextBusinessId } = useBusiness();
  const { currentUser, userProfile, logout } = useAuth();
  const [step, setStep] = useState('storefront'); // 'storefront', 'booking', 'ticket', 'mybookings'
  const [selectedService, setSelectedService] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [ticketBackStep, setTicketBackStep] = useState('storefront');
  const [services, setServices] = useState([]);
  const [business, setBusiness] = useState(null);
  const [customerBusinesses, setCustomerBusinesses] = useState([]);
  const [activeBusinessId, setActiveBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError('');
        const businessIdFromQuery = searchParams.get('businessId');
        const businessIdFromStorage = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
        const isCustomer = (userProfile?.role || 'customer') === 'customer';
        let resolvedBusinessId = businessIdFromQuery || contextBusinessId || (!isCustomer ? businessIdFromStorage : null);
        let businessData = null;

        if (isCustomer && currentUser?.uid) {
          const memberships = await BusinessRepository.getBusinessesForCustomer(currentUser.uid);
          setCustomerBusinesses(memberships);
          if (!resolvedBusinessId && memberships.length > 0) {
            resolvedBusinessId = memberships[0].id;
          }
        } else {
          setCustomerBusinesses([]);
        }

        if (resolvedBusinessId) {
          businessData = await BusinessRepository.getBusiness(resolvedBusinessId);
        } else {
          // For customer users, never trust stale owner storage and prefer discoverable accessible business.
          const publicBusiness = await BusinessRepository.getFirstPublicBusiness();
          if (publicBusiness?.id) {
            resolvedBusinessId = publicBusiness.id;
            businessData = publicBusiness;
          } else {
            const firstBusiness = await BusinessRepository.getFirstBusiness();
            if (firstBusiness?.id) {
              resolvedBusinessId = firstBusiness.id;
              businessData = firstBusiness;
            }
          }
        }

        if (!resolvedBusinessId || !businessData) {
          setBusiness(null);
          setServices([]);
          setActiveBusinessId(null);
          return;
        }

        const servicesData = await BusinessRepository.getServices(resolvedBusinessId);
        setBusiness(businessData);
        setServices(servicesData);
        setActiveBusinessId(resolvedBusinessId);
      } catch (error) {
        const errorCode = error?.code || 'unknown';
        const errorMessage = error?.message || 'Unknown error';
        console.error('Error fetching storefront data:', {
          code: errorCode,
          message: errorMessage,
          activeBusinessId: contextBusinessId,
          role: userProfile?.role || 'customer'
        });
        if (errorCode === 'permission-denied') {
          setLoadError(`Akses ditolak (${errorCode}). ${errorMessage}`);
        } else {
          setLoadError(`Gagal memuat data bisnis/service (${errorCode}): ${errorMessage}`);
        }
        setBusiness(null);
        setServices([]);
        setActiveBusinessId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams, contextBusinessId, userProfile?.role, currentUser?.uid]);

  const handleCustomerBusinessChange = (event) => {
    const nextBusinessId = event.target.value;
    if (!nextBusinessId) return;
    const nextBusiness = customerBusinesses.find((item) => item.id === nextBusinessId) || null;
    setActiveBusinessId(nextBusinessId);
    setBusiness(nextBusiness);
    setServices([]);
    setStep('storefront');
    localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, nextBusinessId);
  };

  useEffect(() => {
    async function reloadServicesForCustomerBusiness() {
      if (!activeBusinessId) return;
      if ((userProfile?.role || 'customer') !== 'customer') return;
      try {
        const servicesData = await BusinessRepository.getServices(activeBusinessId);
        setServices(servicesData);
      } catch (error) {
        if (error?.code === 'permission-denied') {
          setLoadError('Akses ditolak. Customer belum punya izin baca data bisnis ini.');
        }
      }
    }
    reloadServicesForCustomerBusiness();
  }, [activeBusinessId, userProfile?.role]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep('booking');
  };

  const handleBookingConfirm = (bookingId) => {
    setActiveBookingId(bookingId);
    setTicketBackStep('storefront');
    setStep('ticket');
  };

  const handleBackToStorefront = () => {
    setSelectedService(null);
    setStep('storefront');
  };

  return (
    <div className="min-h-screen bg-surface-container-high md:p-6 lg:p-10">
      <div className="mx-auto w-full md:max-w-[430px] min-h-screen md:min-h-[calc(100vh-3rem)] bg-surface-bright md:rounded-[28px] md:shadow-xl md:overflow-hidden relative">
        {currentUser && step !== 'ticket' && (
          <button
            onClick={async () => {
              await logout();
              navigate('/signin', { replace: true });
            }}
            className="fixed md:absolute top-4 right-4 z-40 bg-white/90 text-on-surface px-3 py-2 rounded-xl shadow-sm border border-outline-variant/30 hover:bg-white"
          >
            <span className="text-[12px] font-semibold">Logout</span>
          </button>
        )}
        {step === 'storefront' && (
          <StorefrontPage
            business={business}
            services={services}
            loading={loading}
            error={loadError}
            customerBusinesses={customerBusinesses}
            activeBusinessId={activeBusinessId}
            onBusinessChange={handleCustomerBusinessChange}
            onOpenMyBookings={() => setStep('mybookings')}
            onServiceSelect={handleServiceSelect} 
          />
        )}
        
        {step === 'booking' && (
          <BookingFlowPage 
            businessId={activeBusinessId}
            service={selectedService} 
            onBack={handleBackToStorefront}
            onConfirm={handleBookingConfirm}
          />
        )}

        {step === 'ticket' && (
          <TicketPage 
            businessId={activeBusinessId}
            bookingId={activeBookingId}
            onHome={() => setStep(ticketBackStep)}
            queueConfig={{
              prefix: business?.queuePrefix || 'A',
              padLength: Number(business?.queuePadLength || 1)
            }}
          />
        )}

        {step === 'mybookings' && (
          <MyBookingsPage
            businessId={activeBusinessId}
            onBack={handleBackToStorefront}
            onOpenTicket={(bookingId) => {
              setActiveBookingId(bookingId);
              setTicketBackStep('mybookings');
              setStep('ticket');
            }}
            queueConfig={{
              prefix: business?.queuePrefix || 'A',
              padLength: Number(business?.queuePadLength || 1)
            }}
          />
        )}
      </div>
    </div>
  );
};
