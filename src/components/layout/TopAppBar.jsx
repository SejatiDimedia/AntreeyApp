import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository, NotificationRepository } from '../../repositories';

export const TopAppBar = ({ title, activeCount }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, role, logout } = useAuth();
  const { businesses, activeBusinessId, selectBusiness } = useBusiness();
  const showBusinessSwitcher = (role === 'owner' || role === 'admin' || role === 'staff') && businesses.length > 0;
  const canCreateBusiness = role === 'owner';

  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const displayRole = (role || 'customer').charAt(0).toUpperCase() + (role || 'customer').slice(1);
  const displayEmail = userProfile?.email || currentUser?.email || '-';
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!activeBusinessId || !(role === 'owner' || role === 'admin' || role === 'staff')) {
      setNotifications([]);
      return undefined;
    }
    return NotificationRepository.subscribeToBusinessNotifications(activeBusinessId, setNotifications);
  }, [activeBusinessId, role]);

  const formatNotificationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openCreateBusiness = () => {
    setBusinessForm({ name: '', category: '', phone: '', address: '' });
    setIsCreateBusinessOpen(true);
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid || !businessForm.name.trim()) return;

    try {
      setIsSavingBusiness(true);
      const payload = {
        name: businessForm.name.trim(),
        category: businessForm.category.trim(),
        phone: businessForm.phone.trim(),
        address: businessForm.address.trim(),
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      const created = await BusinessRepository.createBusiness(payload);
      selectBusiness(created.id);
      setIsCreateBusinessOpen(false);
    } catch (error) {
      console.error('Create business failed:', error);
    } finally {
      setIsSavingBusiness(false);
    }
  };

  return (
    <>
      <header className="w-full border-b border-outline-variant/20 px-4 sm:px-gutter py-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="font-headline-lg text-xl sm:text-2xl text-on-surface">{title}</h1>
              {activeCount !== undefined && (
                <div className="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {activeCount} Active Today
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="relative p-2 hover:bg-surface-container-highest/50 rounded-full transition-all text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-32px))] bg-white rounded-2xl shadow-2xl border border-outline-variant/20 z-[80] overflow-hidden">
                    <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
                      <p className="font-semibold text-on-surface">Notifications</p>
                      <span className="text-xs text-on-surface-variant">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-on-surface-variant">No notifications yet.</div>
                      ) : notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={async () => {
                            try {
                              if (!item.read) await NotificationRepository.markAsRead(activeBusinessId, item.id);
                            } catch (error) {
                              console.error('Mark notification read failed:', error);
                            }
                            setIsNotificationsOpen(false);
                            navigate('/bookings');
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${item.read ? 'bg-white' : 'bg-primary-container/10'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`material-symbols-outlined text-[20px] mt-0.5 ${item.read ? 'text-on-surface-variant' : 'text-primary'}`}>
                              {item.type?.includes('payment') ? 'payments' : item.type?.includes('cancel') ? 'event_busy' : 'event_note'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-on-surface truncate">{item.title || 'Notification'}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{item.message || '-'}</p>
                              <p className="text-[11px] text-on-surface-variant mt-1">{formatNotificationTime(item.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-outline-variant/30">
                <div className="text-right hidden md:block">
                  <p className="text-label-md text-on-surface font-semibold leading-tight">{displayName}</p>
                  <p className="text-[11px] text-on-surface-variant">{displayRole} • {displayEmail}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-label-md uppercase text-on-surface-variant border border-outline-variant/20">
                  {displayName.substring(0, 2)}
                </div>
                <button onClick={handleLogout} className="px-3 py-2 rounded-xl bg-error-container text-error text-xs font-semibold hover:opacity-90 transition-opacity">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {showBusinessSwitcher && (
                <select
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-sm w-full sm:w-auto min-w-[220px]"
                  value={activeBusinessId}
                  onChange={(e) => selectBusiness(e.target.value)}
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name || business.businessName || `Business ${business.id.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              )}

              {canCreateBusiness && (
                <button onClick={openCreateBusiness} className="bg-secondary text-on-secondary px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  Add Business
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto">
              <div className="relative group flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </span>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-full w-full xl:w-64 focus:ring-2 focus:ring-primary transition-all font-body-md shadow-sm outline-none"
                />
              </div>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="hidden sm:inline">New Booking</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isCreateBusinessOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4">
          <form onSubmit={handleCreateBusiness} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">Add New Business</h3>
            <input className="bg-surface-container rounded-xl p-3" placeholder="Business Name" value={businessForm.name} onChange={(e) => setBusinessForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Category (Barbershop/Futsal/etc)" value={businessForm.category} onChange={(e) => setBusinessForm((prev) => ({ ...prev, category: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Phone" value={businessForm.phone} onChange={(e) => setBusinessForm((prev) => ({ ...prev, phone: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Address" value={businessForm.address} onChange={(e) => setBusinessForm((prev) => ({ ...prev, address: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCreateBusinessOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button disabled={isSavingBusiness} type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary disabled:opacity-50">
                {isSavingBusiness ? 'Saving...' : 'Save Business'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
