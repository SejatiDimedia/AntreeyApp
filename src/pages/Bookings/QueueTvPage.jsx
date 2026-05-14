import React, { useEffect, useMemo, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BookingRepository } from '../../repositories/BookingRepository';
import { formatQueueNumber } from '../../utils/queueNumber';

const getLocalDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Clock = ({ isDark }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]`}>
        {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-label-md uppercase tracking-[0.3em] mt-1 text-[10px]`}>
        {time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  );
};

export const QueueTvPage = () => {
  const { activeBusiness } = useBusiness();
  const [bookings, setBookings] = useState([]);
  const [viewMode, setViewMode] = useState('global'); // global | service
  const [theme, setTheme] = useState('dark'); // dark | light
  const [lastCalledId, setLastCalledId] = useState(null);

  useEffect(() => {
    if (!activeBusiness?.id) return;
    const unsubscribe = BookingRepository.subscribeToAllBookings(activeBusiness.id, (data) => {
      const sortedByUpdate = [...data].sort((a, b) =>
        String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))
      );
      const latest = sortedByUpdate.find(b => b.status === 'in_progress' || b.status === 'confirmed');
      if (latest && latest.id !== lastCalledId) {
        setLastCalledId(latest.id);
        setTimeout(() => setLastCalledId(null), 15000); // 15 seconds highlight
      }
      setBookings(data);
    });
    return () => unsubscribe();
  }, [activeBusiness?.id, lastCalledId]);

  const today = getLocalDateString(new Date());
  const todaysBookings = useMemo(() => {
    const rows = bookings.filter((item) => {
      if (!item.date) return false;
      const itemDate = item.date.includes('T') ? item.date.split('T')[0] : item.date;
      return itemDate === today;
    });
    rows.sort((a, b) => {
      const aQueue = Number(a.queuePosition || 0);
      const bQueue = Number(b.queuePosition || 0);
      if (aQueue > 0 && bQueue > 0) return aQueue - bQueue;
      if (aQueue > 0) return -1;
      if (bQueue > 0) return 1;

      const aTime = a.timeSlot || '';
      const bTime = b.timeSlot || '';
      if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);

      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });

    const normalized = rows.map((item, idx) => ({
      ...item,
      queueNo: Number(item.queuePosition || 0) > 0 ? Number(item.queuePosition) : idx + 1
    }));
    return normalized;
  }, [bookings, today]);

  const nowServing =
    todaysBookings.find((item) => item.status === 'in_progress') ||
    todaysBookings.find((item) => item.status === 'confirmed') ||
    todaysBookings.find((item) => item.status === 'checked_in') ||
    todaysBookings[0] ||
    null;

  const stats = useMemo(() => {
    const servingCount = nowServing ? 1 : 0;
    const waitingCount = todaysBookings.filter(b =>
      (b.status === 'pending' || b.status === 'checked_in' || b.status === 'confirmed') &&
      b.id !== nowServing?.id
    ).length;
    const completedCount = todaysBookings.filter(b => b.status === 'completed').length;
    return { servingCount, waitingCount, completedCount };
  }, [todaysBookings, nowServing]);

  const waiting = todaysBookings
    .filter((item) =>
      (item.status === 'pending' || item.status === 'confirmed' || item.status === 'checked_in') &&
      item.id !== nowServing?.id
    )
    .slice(0, 8);

  const serviceLanes = useMemo(() => {
    const groups = {};
    todaysBookings.forEach((item) => {
      const key = item.serviceName || 'General Service';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).map(([serviceName, rows]) => {
      const sorted = [...rows].sort((a, b) => Number(a.queueNo || 0) - Number(b.queueNo || 0));
      return {
        serviceName,
        nowServing:
          sorted.find((item) => item.status === 'in_progress') ||
          sorted.find((item) => item.status === 'confirmed') ||
          sorted.find((item) => item.status === 'checked_in') ||
          sorted[0] ||
          null,
        waiting: sorted.filter((item) => item.status === 'pending' || item.status === 'checked_in').slice(0, 5)
      };
    });
  }, [todaysBookings]);

  const queueConfig = {
    prefix: activeBusiness?.queuePrefix || 'A',
    padLength: Number(activeBusiness?.queuePadLength || 1)
  };

  if (!activeBusiness?.id) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#05070a] text-white' : 'bg-slate-50 text-slate-900'} flex items-center justify-center p-8`}>
        <div className="text-center">
          <div className={`w-24 h-24 ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} backdrop-blur-xl rounded-full border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex items-center justify-center shadow-2xl mx-auto mb-8 animate-bounce`}>
            <span className="material-symbols-outlined text-primary text-[48px]">sync</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Display Mode Connecting</h1>
          <p className="text-slate-500 font-medium">Waiting for business authentication...</p>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#05070a] text-white' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden font-sans transition-colors duration-500`}>
      {/* Background Ambience */}
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full ${isDark ? 'bg-primary/10' : 'bg-primary/5'} blur-[150px] animate-pulse pointer-events-none`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full ${isDark ? 'bg-indigo-900/10' : 'bg-indigo-900/5'} blur-[150px] pointer-events-none`} />

      <div className="relative z-10 p-8 md:p-12 min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="flex flex-wrap items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary-container rounded-[24px] shadow-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[32px] md:text-[44px]">layers</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full border-4 ${isDark ? 'border-[#05070a]' : 'border-[#fff]'} flex items-center justify-center shadow-lg`}>
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                {activeBusiness?.name || 'Antreey'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 md:gap-16">
            <div className="hidden xl:flex items-center gap-10">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">In Queue</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.waitingCount}</span>
              </div>
              <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Active</span>
                <span className="text-2xl font-black text-primary">{stats.servingCount}</span>
              </div>
              <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Done</span>
                <span className={`text-2xl font-black ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>{stats.completedCount}</span>
              </div>
            </div>

            <div className={`w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'} hidden lg:block`} />

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50'} border`}
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <div className={`w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'} hidden lg:block`} />

            {/* View Mode Switcher */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-xl rounded-2xl p-1 border flex shadow-2xl`}>
              <button
                onClick={() => setViewMode('global')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${viewMode === 'global' ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Global
              </button>
              <button
                onClick={() => setViewMode('service')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${viewMode === 'service' ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Per Line
              </button>
            </div>

            <div className={`w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'} hidden lg:block`} />

            <Clock isDark={isDark} />
          </div>
        </header>

        {/* Global Overview Layout */}
        <main className="flex-1 pb-12">
          {viewMode === 'global' ? (
            <div className="grid grid-cols-12 gap-8 lg:gap-10 h-full">
              {/* NOW SERVING - PRIMARY FOCUS */}
              <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[400px]">
                <div className={`flex-1 relative rounded-[48px] border transition-all duration-1000 p-10 md:p-16 flex flex-col justify-center overflow-hidden group ${lastCalledId === nowServing?.id
                  ? 'bg-primary/20 border-primary/40 shadow-[0_0_100px_rgba(var(--primary-rgb),0.15)] ring-4 ring-primary/10'
                  : isDark ? 'bg-white/[0.03] border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                  {/* Decorative Dynamic Background */}
                  <div className={`absolute top-1/2 right-[-5%] -translate-y-1/2 text-[20vw] font-black tracking-tighter select-none pointer-events-none transition-all duration-1000 ${lastCalledId === nowServing?.id ? 'text-primary/[0.08] scale-110' : isDark ? 'text-white/[0.02]' : 'text-slate-900/[0.02]'
                    }`}>
                    {formatQueueNumber(nowServing?.queueNo, queueConfig)}
                  </div>

                  {/* Shimmer Effect */}
                  {lastCalledId === nowServing?.id && <div className="shimmer-overlay" />}

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8 md:mb-12">
                      <div className="bg-primary text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/30">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Currently Calling
                      </div>
                      <div className={`h-px w-16 md:w-24 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                    </div>

                    <h2 className="text-slate-500 text-2xl md:text-3xl font-black uppercase tracking-widest mb-4 md:mb-6 opacity-60">Ticket Number</h2>
                    <div className={`font-black tracking-tighter leading-none transition-all duration-700 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap ${lastCalledId === nowServing?.id ? isDark ? 'text-white scale-[1.02]' : 'text-primary scale-[1.02]' : 'text-primary'
                      }`} style={{ fontSize: 'clamp(10rem, 12vw, 12rem)' }}>
                      {formatQueueNumber(nowServing?.queueNo, queueConfig)}
                    </div>

                    <div className="mt-10 md:mt-16 flex items-start gap-6 md:gap-10">
                      <div className="w-1.5 h-24 md:h-20 bg-gradient-to-b from-primary to-transparent rounded-full mt-2" />
                      <div>
                        <p className={`text-lg md:text-xl lg:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3 md:mb-4 tracking-tight leading-tight`}>
                          {nowServing?.customerName || 'Waiting...'}
                        </p>
                        <p className="text-sm md:text-lg font-bold text-slate-500 uppercase tracking-[0.2em]">
                          {nowServing?.serviceName || 'No Service Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPCOMING LIST - SIDEBAR */}
              <div className="col-span-12 lg:col-span-4 flex flex-col min-h-[400px]">
                <div className={`flex-1 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} backdrop-blur-3xl rounded-[48px] border p-8 md:p-10 flex flex-col shadow-2xl relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-primary/5' : 'bg-primary/[0.02]'} blur-[40px] pointer-events-none`} />

                  <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h3 className="text-xl md:text-2xl font-black tracking-tighter">Next Up</h3>
                    <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} flex items-center gap-2 px-3 py-1.5 rounded-2xl border`}>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{waiting.length} Waiting</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 md:space-y-5">
                    {waiting.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40 italic">
                        <span className="material-symbols-outlined text-[48px] md:text-[64px] mb-4">hourglass_top</span>
                        <p className="font-bold text-sm md:text-base">Queue is empty</p>
                      </div>
                    ) : (
                      waiting.map((item, idx) => (
                        <div key={item.id} className={`group relative flex items-center justify-between ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5' : 'bg-slate-50 hover:bg-slate-100 border-slate-100'} border rounded-[28px] p-5 md:p-6 transition-all duration-300`}>
                          <div className="flex items-center gap-6 md:gap-8">
                            <span className="text-slate-600 text-xs md:text-sm font-black italic">{(idx + 1).toString().padStart(2, '0')}</span>
                            <div>
                              <p className={`text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tighter mb-1`}>{formatQueueNumber(item.queueNo, queueConfig)}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[150px] md:max-w-[180px]">{item.customerName || '---'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                            <p className="text-[9px] font-black text-slate-600">{item.timeSlot || '--:--'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {todaysBookings.filter(b => b.status === 'pending').length > 8 && (
                    <div className={`mt-6 md:mt-8 pt-6 md:pt-8 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex items-center justify-center gap-3`}>
                      <span className="material-symbols-outlined text-slate-600 text-[18px]">more_horiz</span>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
                        {todaysBookings.filter(b => b.status === 'pending').length - 8} more customers
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* SERVICE LANES VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 pb-10">
              {serviceLanes.map((lane) => (
                <div key={lane.serviceName} className={`${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} backdrop-blur-2xl rounded-[40px] md:rounded-[48px] border p-8 md:p-10 flex flex-col shadow-2xl relative group hover:bg-white/[0.05] transition-all duration-500`}>
                  <header className="mb-8 md:mb-10">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-primary font-black mb-2 md:mb-3">Service Lane</p>
                    <h3 className={`text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tighter leading-none`}>{lane.serviceName}</h3>
                  </header>

                  <div className={`rounded-[32px] p-6 md:p-8 mb-8 md:mb-10 transition-all duration-1000 overflow-hidden relative ${lastCalledId === lane.nowServing?.id
                    ? 'bg-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.25)]'
                    : isDark ? 'bg-white/5 border-white/10 shadow-xl' : 'bg-slate-50 border-slate-100 shadow-sm'
                    }`}>
                    {lastCalledId === lane.nowServing?.id && <div className="shimmer-overlay" />}
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-3 md:mb-4 ${lastCalledId === lane.nowServing?.id ? 'text-white/80' : 'text-slate-500'}`}>Now Serving</p>
                    <div className="flex items-end justify-between gap-4 md:gap-6 relative z-10">
                      <div className={`text-6xl md:text-7xl font-black tracking-tighter whitespace-nowrap ${lastCalledId === lane.nowServing?.id ? 'text-white' : 'text-primary'}`}>
                        {formatQueueNumber(lane.nowServing?.queueNo, queueConfig)}
                      </div>
                      <div className="text-right min-w-0 flex-1">
                        <p className={`text-lg md:text-xl font-black truncate leading-tight ${lastCalledId === lane.nowServing?.id ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {lane.nowServing?.customerName || '---'}
                        </p>
                        <p className={`text-[10px] font-bold mt-1 ${lastCalledId === lane.nowServing?.id ? 'text-white/60' : 'text-slate-500'}`}>
                          {lane.nowServing?.timeSlot || '--:--'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 md:space-y-4">
                    <div className="flex items-center gap-4 mb-4 md:mb-6 px-2">
                      <p className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-600">Next In Line</p>
                      <div className={`h-px flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                    </div>
                    {lane.waiting.length === 0 ? (
                      <div className={`${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} rounded-[24px] p-5 md:p-6 border border-dashed text-center`}>
                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">No pending queue</p>
                      </div>
                    ) : (
                      lane.waiting.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/5' : 'bg-slate-50 border-slate-50 hover:bg-slate-100'} border rounded-[20px] px-5 py-3 md:py-4 transition-all`}>
                          <span className={`text-xl md:text-2xl font-black ${isDark ? 'text-white/90' : 'text-slate-900'} tracking-tighter whitespace-nowrap`}>{formatQueueNumber(item.queueNo, queueConfig)}</span>
                          <span className="text-[9px] font-black text-slate-500 truncate ml-4 md:ml-6 uppercase tracking-widest">{item.customerName || '---'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Persistent Mode Switcher */}
      <div className="fixed bottom-10 left-10 z-50">
        <div className={`${isDark ? 'bg-black/50' : 'bg-white/80'} backdrop-blur-xl px-6 py-3 rounded-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'} shadow-2xl flex items-center gap-4`}>
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/80' : 'text-slate-600'}`}>Broadcasting display</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .shimmer-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,${isDark ? '0.2' : '0.4'}), transparent);
          animation: shimmer 3s infinite ease-in-out;
          pointer-events: none;
          z-index: 5;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
      `}} />
    </div>
  );
};
