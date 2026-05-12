import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', path: '/dashboard', roles: ['owner', 'admin', 'staff'] },
  { icon: 'event_note', label: 'Bookings', path: '/bookings', roles: ['owner', 'admin', 'staff'] },
  { icon: 'medical_services', label: 'Services', path: '/services', roles: ['owner', 'admin'] },
  { icon: 'inventory_2', label: 'Resources', path: '/resources', roles: ['owner', 'admin'] },
  { icon: 'group', label: 'Staff', path: '/staff', roles: ['owner', 'admin'] },
  { icon: 'group', label: 'Customers', path: '/customers', roles: ['owner', 'admin'] },
];

export const Sidebar = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(role)
  );
  return (
    <nav className="fixed left-0 top-0 h-screen w-[80px] z-40 bg-surface-container-lowest dark:bg-inverse-surface flex flex-col items-center py-6 border-r border-outline-variant dark:border-outline shadow-sm">
      <div className="mb-10">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-headline-lg">grid_view</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {filteredNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={item.label}
            className={`p-3 rounded-xl scale-95 active:scale-90 transition-transform ${
              location.pathname === item.path 
                ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary/10' 
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors duration-200'
            }`}
          >
            <span 
              className="material-symbols-outlined"
              style={location.pathname === item.path ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto flex flex-col items-center gap-4">
        {(role === 'owner' || role === 'admin') && (
          <button 
            onClick={() => navigate('/settings')}
            className={`p-3 rounded-xl transition-colors duration-200 scale-95 active:scale-90 ${
              location.pathname === '/settings' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}
        <div className="mt-2">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpFFLqhOdfl3BnRvjXCqhe8H7bZmMFZxC-e3sACYlCn3I5Vp3tioTsEkA5NwUsut_x7EVvR6Bn1rrfSWInBgBPj5xu1SjFTVSJO_RteKJWw45M_-WEao-bJrDI8U61JXjhVYcTCOEqW4LR9hyUjJzpnzNB-FsLwA_syAy0YmB1OjCIu28F4qbMvA9zhA0wWNSIAus9G3NB_MqFGJTyb_HKcXDbVYREi44IwOGWA0LlKlvQPiwDmcsw54scWlgrihItrYy-BFTKCMpl" 
            alt="User Profile" 
            className="w-10 h-10 rounded-full border-2 border-outline-variant object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
