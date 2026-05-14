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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">Loading...</p>
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
    <div className="flex flex-col min-h-full pb-10 bg-surface-bright">
      {/* Hero Section */}
      <div className="relative h-[320px] overflow-hidden rounded-b-[48px] shadow-2xl shadow-slate-200">
        <img
          src={businessCover}
          alt={businessName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">verified</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Instant</span>
          </div>
        </div>

        {/* Business Header Info */}
        <div className="absolute bottom-10 left-6 right-6 z-10">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest inline-block mb-3">
                {businessCategory}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-2">
                {businessName}
              </h1>
              <p className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <span className="truncate">{businessAddress}</span>
              </p>
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center p-1 overflow-hidden shadow-2xl shadow-black/20">
              {businessLogo ? (
                <img src={businessLogo} alt={businessName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-2xl font-black text-white">{getBusinessInitials(businessName)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20">
        {/* Info Grid */}
        <div className="glass-card rounded-[32px] p-5 mb-8">
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-medium">
            {businessDescription}
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low rounded-3xl p-3 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-xl bg-on-surface-variant/10 text-on-surface-variant flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-0.5">Speed</p>
              <p className="text-[11px] font-black text-on-surface">Fast Book</p>
            </div>
            
            <div className="bg-surface-container-low rounded-3xl p-3 flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-xl ${todayHours.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center mb-2`}>
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-0.5">Status</p>
              <p className="text-[11px] font-black text-on-surface truncate w-full">{todayHours.isOpen ? 'Open' : 'Closed'}</p>
            </div>

            <button
              onClick={onOpenMyBookings}
              className="bg-inverse-surface rounded-3xl p-3 flex flex-col items-center text-center relative transition-all active:scale-95 group shadow-lg shadow-black/5"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
              </div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Tickets</p>
              <p className="text-[11px] font-black text-white">My Books</p>
              {awaitingPaymentCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-container text-on-primary-container text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">
                  {awaitingPaymentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Business Switcher */}
        {customerBusinesses.length > 1 && (
          <div className="mb-8 group">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-[11px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">Partner Businesses</span>
              <span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">sync</span>
            </div>
            <div className="relative">
              <select
                className="w-full h-14 bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 text-sm font-black text-on-surface appearance-none shadow-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                value={activeBusinessId || ''}
                onChange={onBusinessChange}
              >
                {customerBusinesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.id}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">expand_more</span>
            </div>
          </div>
        )}

        {/* Services Section */}
        <div className="mb-6">
          <div className="flex items-end justify-between px-1 mb-6">
            <div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">Services</p>
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Pick your slot</h2>
            </div>
            <div className="bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-widest">
              {visibleServices.length} Available
            </div>
          </div>

          <div className="space-y-4">
            {visibleServices.length === 0 ? (
              <div className="glass-card rounded-[32px] p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-[32px]">event_busy</span>
                </div>
                <p className="text-on-surface font-black tracking-tight mb-1">No Services Available</p>
                <p className="text-on-surface-variant/50 text-xs font-medium">Please check again tomorrow.</p>
              </div>
            ) : (
              visibleServices.map((service) => {
                const duration = service.durationMinutes || service.duration || 30;
                const serviceName = service.name || service.title || 'Service';
                const serviceIcon = (!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon;
                
                return (
                  <button
                    key={service.id}
                    onClick={() => onServiceSelect(service)}
                    className="w-full bg-surface-container-low border border-outline-variant/10 p-4 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 text-left flex items-center gap-4 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-16 h-16 rounded-2xl bg-surface-bright text-on-surface-variant flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-inner">
                      <span className="material-symbols-outlined text-[28px]">{serviceIcon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-black text-on-surface text-lg leading-tight tracking-tight mb-1 group-hover:text-primary transition-colors">
                        {serviceName}
                      </h3>
                      {service.description && (
                        <p className="text-on-surface-variant/50 text-xs font-medium truncate mb-3">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[11px] font-black">
                          {formatPrice(service.price)}
                        </div>
                        <div className="bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 uppercase tracking-tighter">
                          <span className="material-symbols-outlined text-[14px]">timer</span>
                          {duration} Min
                        </div>
                        {service.dpRequired && (
                          <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                            DP {Number(service.dpPercent || 0)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0 w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface-variant/30 group-hover:bg-primary group-hover:text-on-primary transition-all group-hover:translate-x-1">
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
