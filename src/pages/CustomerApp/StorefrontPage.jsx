import React from 'react';

const DEFAULT_COVERS = {
  sport: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
  badminton: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be7?auto=format&fit=crop&w=900&q=80',
  barber: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',
  clinic: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'
};

const resolveBusinessCover = (business) => {
  const explicitCover = business?.coverImageUrl || business?.bannerUrl || business?.imageUrl || business?.photoURL;
  if (explicitCover) return explicitCover;

  const haystack = `${business?.category || ''} ${business?.name || ''}`.toLowerCase();
  if (haystack.includes('badminton')) return DEFAULT_COVERS.badminton;
  if (haystack.includes('sport') || haystack.includes('lapangan') || haystack.includes('futsal')) return DEFAULT_COVERS.sport;
  if (haystack.includes('barber')) return DEFAULT_COVERS.barber;
  if (haystack.includes('salon') || haystack.includes('spa')) return DEFAULT_COVERS.salon;
  if (haystack.includes('clinic') || haystack.includes('medical')) return DEFAULT_COVERS.clinic;
  if (haystack.includes('fitness') || haystack.includes('gym')) return DEFAULT_COVERS.fitness;
  return DEFAULT_COVERS.default;
};

const formatPrice = (value) => (
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0))
);

const getBusinessInitials = (name) => {
  const words = String(name || 'A').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'A';
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getTodayOperatingHours = (business) => {
  const todayKey = DAY_KEYS[new Date().getDay()];
  const row = business?.operatingHours?.[todayKey];
  if (!row) return { label: '09:00 - 21:00', isOpen: true };
  if (row.isOpen === false) return { label: 'Closed today', isOpen: false };
  return {
    label: `${row.startTime || '09:00'} - ${row.endTime || '21:00'}`,
    isOpen: true
  };
};

export const StorefrontPage = ({
  business,
  services = [],
  loading,
  error = '',
  customerBusinesses = [],
  activeBusinessId = '',
  awaitingPaymentCount = 0,
  onBusinessChange,
  onOpenMyBookings,
  onServiceSelect
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const businessName = business?.name || 'Antreey Studio';
  const businessAddress = business?.address || 'Jakarta, ID';
  const businessDescription = business?.description || 'Premium styling and grooming services designed for the modern professional.';
  const businessCover = resolveBusinessCover(business);
  const businessLogo = business?.logoUrl || business?.logo || business?.avatarUrl || '';
  const businessCategory = business?.category || 'Service Business';
  const visibleServices = services.filter((service) => String(service.status || 'active').toLowerCase() !== 'inactive');
  const todayHours = getTodayOperatingHours(business);

  return (
    <div className="flex flex-col min-h-full pb-8 bg-[#f8f5ee]">
      {/* Cover Image & Header */}
      <div className="relative min-h-[285px] bg-surface-container-high rounded-b-[42px] overflow-hidden shadow-[0_24px_60px_rgba(47,36,25,0.22)]">
        <img 
          src={businessCover}
          alt={`${businessName} cover`}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-[#1d1712]/90"></div>
        <div className="absolute -bottom-16 -right-12 w-44 h-44 rounded-full bg-primary/35 blur-3xl"></div>
        <div className="absolute -top-14 -left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl"></div>

        <div className="relative z-10 px-6 pt-7 pb-7 flex flex-col min-h-[285px]">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/16 border border-white/20 text-white px-3 py-1.5 backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span className="text-xs font-semibold">Book instantly</span>
            </div>
            <button
              onClick={onOpenMyBookings}
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/18 border border-white/25 text-white backdrop-blur-md shadow-lg"
              aria-label="Open my bookings"
            >
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              {awaitingPaymentCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] rounded-full bg-amber-400 text-[#2b1b08] font-black border border-white/70">
                  {awaitingPaymentCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-auto">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="inline-flex items-center rounded-full bg-white/14 border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                  {businessCategory}
                </p>
                <h1 className="mt-3 font-headline-lg-mobile text-[31px] leading-[1.02] text-white drop-shadow-sm">
                  {businessName}
                </h1>
                <p className="text-[14px] text-white/88 flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-[17px]">location_on</span>
                  <span className="truncate">{businessAddress}</span>
                </p>
              </div>
              <div className="shrink-0 w-[70px] h-[70px] bg-white/18 rounded-[24px] flex items-center justify-center border border-white/30 shadow-xl overflow-hidden backdrop-blur-md">
                {businessLogo ? (
                  <img src={businessLogo} alt={`${businessName} logo`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-2xl">{getBusinessInitials(businessName)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-5 py-6 -mt-2 relative z-10">
        <div className="rounded-[28px] bg-white/90 border border-white shadow-[0_20px_45px_rgba(67,54,38,0.09)] p-5">
          <p className="text-on-surface-variant text-[14px] leading-relaxed">
          {businessDescription}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="rounded-2xl bg-[#f6efe3] px-3 py-3">
              <span className="material-symbols-outlined text-[19px] text-primary">bolt</span>
              <p className="mt-1 text-[11px] text-on-surface-variant">Fast</p>
              <p className="text-[12px] font-bold text-on-surface">Instant Book</p>
            </div>
            <div className="rounded-2xl bg-[#eef5ea] px-3 py-3">
              <span className={`material-symbols-outlined text-[19px] ${todayHours.isOpen ? 'text-emerald-700' : 'text-rose-700'}`}>schedule</span>
              <p className="mt-1 text-[11px] text-on-surface-variant">Hours</p>
              <p className="text-[12px] font-bold text-on-surface">{todayHours.label}</p>
            </div>
            <button
              onClick={onOpenMyBookings}
              className="rounded-2xl bg-[#f0edf9] px-3 py-3 text-left relative"
            >
              <span className="material-symbols-outlined text-[19px] text-secondary">confirmation_number</span>
              <p className="mt-1 text-[11px] text-on-surface-variant">Tickets</p>
              <p className="text-[12px] font-bold text-on-surface">My Books</p>
              {awaitingPaymentCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] rounded-full bg-amber-500 text-white font-bold">
                  {awaitingPaymentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {customerBusinesses.length > 1 && (
          <div className="mt-4 rounded-[24px] bg-white border border-outline-variant/20 p-4 shadow-sm">
            <label className="text-xs uppercase tracking-[0.14em] text-on-surface-variant font-bold mb-2 block">Switch business</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-[#fbfaf7] border border-outline-variant/20 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                value={activeBusinessId || ''}
                onChange={onBusinessChange}
              >
                {customerBusinesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.id}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">expand_more</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-error-container/70 text-on-error-container text-sm">
            {error}
          </div>
        )}

        {/* Services List */}
        <div className="flex items-end justify-between gap-4 mt-8 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-black">Services</p>
            <h2 className="font-headline-lg-mobile text-[24px] text-on-surface">Choose your slot</h2>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant bg-white px-3 py-1.5 rounded-full border border-outline-variant/20">
            {visibleServices.length} available
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {visibleServices.length === 0 ? (
            <div className="text-center text-on-surface-variant py-10 bg-white rounded-[28px] border border-outline-variant/20">
              <span className="material-symbols-outlined text-[36px] opacity-60">event_busy</span>
              <p className="mt-2 font-semibold">No services available</p>
              <p className="text-sm opacity-70">Please check again later.</p>
            </div>
          ) : visibleServices.map((service) => {
            const duration = service.durationMinutes || service.duration || 30;
            const serviceName = service.name || service.title || 'Service';
            const serviceIcon = (!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon;
            return (
            <div 
              key={service.id} 
              onClick={() => onServiceSelect(service)}
              className="relative overflow-hidden bg-white p-4 rounded-[28px] border border-white flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 group"
            >
              <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-primary/8 group-hover:bg-primary/14 transition-colors"></div>
              <div className="flex items-center gap-4 min-w-0 relative z-10">
                <div className="w-[58px] h-[58px] rounded-[22px] bg-[#f6efe3] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                  <span className="material-symbols-outlined text-[28px]">{serviceIcon}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[16px] text-on-surface truncate">{serviceName}</h3>
                  {service.description && (
                    <p className="text-[12px] text-on-surface-variant mt-0.5 line-clamp-1">{service.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[12px] text-on-surface-variant">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 font-bold">
                      {formatPrice(service.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {duration} min
                    </span>
                    {service.dpRequired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 font-bold">
                        DP {Number(service.dpPercent || 0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-full bg-[#f7f4ee] flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
};
