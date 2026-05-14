import React, { useState, useEffect } from 'react';
import { StorefrontPage } from './StorefrontPage';
import { BookingFlowPage } from './BookingFlowPage';
import { TicketPage } from './TicketPage';
import { MyBookingsPage } from './MyBookingsPage';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { BookingRepository } from '../../repositories/BookingRepository';

const ACTIVE_BUSINESS_STORAGE_KEY = 'antreey_active_business_id';

export const CustomerAppFlow = () => {
  const navigate = useNavigate();
  const { businessId: businessIdFromPath } = useParams();
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
  const [awaitingPaymentCount, setAwaitingPaymentCount] = useState(0);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const customerDisplayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Customer';
  const customerEmail = userProfile?.email || currentUser?.email || '';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError('');
        const businessIdFromQuery = searchParams.get('businessId');
        const businessIdFromStorage = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
        const isCustomer = (userProfile?.role || 'customer') === 'customer';
        let resolvedBusinessId = businessIdFromPath || businessIdFromQuery || contextBusinessId || (!isCustomer ? businessIdFromStorage : null);
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
          setLoadError(`Access denied (${errorCode}). ${errorMessage}`);
        } else {
          setLoadError(`Failed to load business/service data (${errorCode}): ${errorMessage}`);
        }
        setBusiness(null);
        setServices([]);
        setActiveBusinessId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [businessIdFromPath, searchParams, contextBusinessId, userProfile?.role, currentUser?.uid]);

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
          setLoadError('Access denied. This customer does not have permission to read this business yet.');
        }
      }
    }
    reloadServicesForCustomerBusiness();
  }, [activeBusinessId, userProfile?.role]);

  useEffect(() => {
    if (!activeBusinessId || !currentUser?.uid) {
      setAwaitingPaymentCount(0);
      return;
    }
    const unsubscribe = BookingRepository.subscribeToCustomerBookings(
      activeBusinessId,
      currentUser.uid,
      (rows) => {
        const count = rows.filter((item) => String(item.status || '').toLowerCase() === 'awaiting_payment').length;
        setAwaitingPaymentCount(count);
      }
    );
    return () => unsubscribe();
  }, [activeBusinessId, currentUser?.uid]);

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

  const handleCustomerLogout = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center md:p-10 lg:p-16">
      <div className="mx-auto w-full md:max-w-[430px] min-h-screen md:min-h-[880px] bg-surface-bright md:rounded-[48px] md:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] md:ring-1 md:ring-outline-variant/30 overflow-x-hidden relative flex flex-col">
        {currentUser && step !== 'ticket' && step !== 'mybookings' && (
          <div className="fixed md:absolute top-4 right-4 z-40">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              className="backdrop-blur-md w-10 h-10 rounded-2xl bg-white/18 border border-white/25 text-white backdrop-blur-md shadow-lg"
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
            >
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>

            {isAccountMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 md:absolute md:inset-auto md:-top-4 md:-right-4 md:w-[430px] md:h-screen cursor-default"
                  aria-label="Close account menu"
                  onClick={() => setIsAccountMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-[280px] rounded-3xl bg-white shadow-2xl border border-outline-variant/20 overflow-hidden">
                  <div className="p-4 bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold uppercase">
                        {customerDisplayName.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{customerDisplayName}</p>
                        <p className="text-xs text-on-surface-variant truncate">{customerEmail || 'Signed in customer'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleCustomerLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left text-error hover:bg-error-container/60 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {step === 'storefront' && (
          <StorefrontPage
            business={business}
            services={services}
            loading={loading}
            error={loadError}
            customerBusinesses={customerBusinesses}
            activeBusinessId={activeBusinessId}
            awaitingPaymentCount={awaitingPaymentCount}
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
