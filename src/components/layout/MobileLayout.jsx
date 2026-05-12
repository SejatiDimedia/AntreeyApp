import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const MobileLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-container-high md:p-8 lg:p-12 flex justify-center items-center">
      {/* Phone Mockup Wrapper */}
      <div className="w-full max-w-[400px] h-full md:h-[850px] bg-surface relative md:rounded-[40px] md:shadow-2xl overflow-hidden md:border-[8px] border-surface-container flex flex-col">
        {/* Mock Notch/Status Bar for desktop view */}
        <div className="hidden md:flex justify-between items-center px-6 py-2 text-[12px] font-semibold text-on-surface-variant relative z-50">
          <span>9:41</span>
          <div className="w-32 h-6 bg-black rounded-b-3xl absolute top-0 left-1/2 -translate-x-1/2"></div>
          <div className="flex gap-1 items-center">
            <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[14px]">wifi</span>
            <span className="material-symbols-outlined text-[14px]">battery_full</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative bg-surface-bright">
          {currentUser && (
            <button
              onClick={logout}
              className="absolute top-4 right-4 z-40 bg-white/90 text-on-surface px-3 py-2 rounded-xl shadow-sm border border-outline-variant/30 hover:bg-white"
            >
              <span className="text-[12px] font-semibold">Logout</span>
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
