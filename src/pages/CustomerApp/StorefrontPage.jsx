import React from 'react';

export const StorefrontPage = ({
  business,
  services = [],
  loading,
  error = '',
  customerBusinesses = [],
  activeBusinessId = '',
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

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Cover Image & Header */}
      <div className="relative h-48 bg-surface-container-high rounded-b-[40px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Barbershop Interior" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg-mobile text-[24px]">{businessName}</h1>
            <p className="text-[14px] opacity-90 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {businessAddress}
            </p>
          </div>
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl">
            <span className="material-symbols-outlined text-[28px] text-on-primary">storefront</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-6 py-6 mt-2">
        <p className="text-on-surface-variant text-body-md mb-6">
          {businessDescription}
        </p>

        {/* Quick Info Badges */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
          <button
            onClick={onOpenMyBookings}
            className="flex-shrink-0 flex items-center gap-2 bg-secondary-container/40 text-secondary px-4 py-2 rounded-full font-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            My Bookings
          </button>
          <div className="flex-shrink-0 flex items-center gap-2 bg-primary-container/30 text-primary px-4 py-2 rounded-full font-label-md">
            <span className="material-symbols-outlined text-[18px]">star</span>
            4.9 (120+ Reviews)
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-md">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            Open 09:00 - 21:00
          </div>
        </div>

        <h2 className="font-headline-lg-mobile text-[20px] text-on-surface mb-4">Select a Service</h2>
        {customerBusinesses.length > 1 && (
          <div className="mb-4">
            <label className="text-sm text-on-surface-variant mb-1 block">Pilih Bisnis</label>
            <select
              className="w-full bg-white border border-outline-variant/30 rounded-xl px-3 py-2"
              value={activeBusinessId || ''}
              onChange={onBusinessChange}
            >
              {customerBusinesses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.id}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/60 text-on-error-container text-sm">
            {error}
          </div>
        )}

        {/* Services List */}
        <div className="flex flex-col gap-4">
          {services.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No services available</p>
          ) : services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => onServiceSelect(service)}
              className="bg-white p-4 rounded-[24px] border border-outline-variant/30 flex items-center justify-between hover:border-primary cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">{(!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon}</span>
                </div>
                <div>
                  <h3 className="font-label-md text-[16px] text-on-surface">{service.name || service.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[13px] text-on-surface-variant">
                    <span className="font-semibold text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.price)}
                    </span>
                    <span className="flex items-center gap-1 opacity-70">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {service.duration || service.durationMinutes} Min
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
