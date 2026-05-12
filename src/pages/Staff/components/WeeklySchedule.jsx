import React from 'react';

export const WeeklySchedule = () => {
  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_0_rgba(0,0,0,0.1)] rounded-[40px] p-container-padding h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Weekly Schedule</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">October 12 - October 18, 2025</p>
        </div>
        <div className="flex bg-surface-container rounded-full p-1">
          <button className="px-6 py-2 rounded-full bg-white shadow-sm font-label-md text-label-md">Week</button>
          <button className="px-6 py-2 rounded-full text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors">Month</button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="flex-grow overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px]">
          {/* Table Header (Days) */}
          <div className="grid grid-cols-8 gap-4 border-b border-outline-variant pb-4 mb-4">
            <div className="col-span-1"></div> {/* Spacer for time column */}
            
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Mon</div>
              <div className="text-headline-lg-mobile font-bold">12</div>
            </div>
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Tue</div>
              <div className="text-headline-lg-mobile font-bold">13</div>
            </div>
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Wed</div>
              <div className="text-headline-lg-mobile font-bold">14</div>
            </div>
            <div className="text-center bg-primary text-on-primary rounded-2xl py-1 shadow-md shadow-primary/20">
              <div className="text-label-sm uppercase font-bold tracking-tighter opacity-70">Thu</div>
              <div className="text-headline-lg-mobile font-bold">15</div>
            </div>
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Fri</div>
              <div className="text-headline-lg-mobile font-bold">16</div>
            </div>
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Sat</div>
              <div className="text-headline-lg-mobile font-bold">17</div>
            </div>
            <div className="text-center">
              <div className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tighter">Sun</div>
              <div className="text-headline-lg-mobile font-bold">18</div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            {/* 09:00 Slot */}
            <div className="grid grid-cols-8 gap-4 items-center">
              <div className="text-label-sm text-on-surface-variant font-bold">09:00</div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Widodo</span>
                <div className="flex -space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary border border-white"></div>
                </div>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Linus</span>
              </div>
              
              <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-2 h-16 flex flex-col justify-center items-center hover:opacity-90 cursor-pointer transition-opacity">
                <span className="text-[10px] font-bold uppercase opacity-50">Meeting</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Widodo</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
            </div>

            {/* 11:00 Slot */}
            <div className="grid grid-cols-8 gap-4 items-center">
              <div className="text-label-sm text-on-surface-variant font-bold">11:00</div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between col-span-2 hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Darent - Masterclass</span>
              </div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Linus</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Widodo</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
            </div>

            {/* 14:00 Slot (Highlighted in Mockup style) */}
            <div className="grid grid-cols-8 gap-4 items-center">
              <div className="text-label-sm text-on-surface-variant font-bold">14:00</div>
              
              <div className="bg-primary-fixed rounded-xl p-2 h-20 flex flex-col justify-between shadow-sm border border-primary/20 cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-[10px] font-extrabold text-on-primary-fixed uppercase tracking-wider">Busy</span>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">Widodo</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
              
              <div className="bg-primary-fixed rounded-xl p-2 h-20 flex flex-col justify-between shadow-sm border border-primary/20 cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-[10px] font-extrabold text-on-primary-fixed uppercase tracking-wider">Busy</span>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">Darent</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-20 border border-dashed border-outline-variant/30"></div>
              <div className="bg-surface-container-low rounded-xl h-20 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-fixed rounded-xl p-2 h-20 flex flex-col justify-between shadow-sm border border-primary/20 cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-[10px] font-extrabold text-on-primary-fixed uppercase tracking-wider">Busy</span>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">Linus</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-20 border border-dashed border-outline-variant/30"></div>
              <div className="bg-surface-container-low rounded-xl h-20 border border-dashed border-outline-variant/30"></div>
            </div>

            {/* 16:00 Slot */}
            <div className="grid grid-cols-8 gap-4 items-center">
              <div className="text-label-sm text-on-surface-variant font-bold">16:00</div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Darent</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2 h-16 flex flex-col justify-between hover:bg-primary-container/30 cursor-pointer transition-colors">
                <span className="text-[10px] font-bold text-primary uppercase truncate">Linus</span>
              </div>
              
              <div className="bg-surface-container-low rounded-xl h-16 border border-dashed border-outline-variant/30"></div>
              
              <div className="bg-error-container text-on-error-container rounded-xl p-2 h-16 flex flex-col justify-center items-center border border-error/20">
                <span className="text-[10px] font-bold uppercase">Off</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legend & Actions */}
      <div className="mt-8 pt-6 border-t border-outline-variant/50 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-fixed"></div>
            <span className="text-[12px] text-on-surface-variant">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-container/20 border border-primary/30"></div>
            <span className="text-[12px] text-on-surface-variant">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-inverse-surface"></div>
            <span className="text-[12px] text-on-surface-variant">Internal</span>
          </div>
        </div>
        <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-label-md hover:bg-surface-container-highest/80 transition-colors">
          Download PDF
        </button>
      </div>
    </div>
  );
};
