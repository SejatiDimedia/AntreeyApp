import React from 'react';

export const CalendarWidget = () => {
  return (
    <section className="bg-primary-container rounded-[32px] p-6 shadow-lg shadow-primary-container/20">
      <div className="flex items-center justify-between mb-8 bg-primary p-4 rounded-2xl">
        <span className="text-on-primary font-headline-lg-mobile">October</span>
        <span className="material-symbols-outlined text-on-primary cursor-pointer hover:bg-white/10 rounded-full p-1">arrow_drop_down</span>
      </div>
      <div className="grid grid-cols-7 text-center gap-y-4">
        {/* Day Headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <span key={`h-${i}`} className="text-on-primary-fixed-variant/60 font-label-md">{day}</span>
        ))}
        
        {/* Previous Month Days */}
        {[24, 25, 26].map(day => (
          <div key={`p-${day}`} className="flex flex-col items-center gap-1 opacity-20 text-on-primary-fixed-variant font-label-md"><span>{day}</span></div>
        ))}
        
        {/* Current Month Days (Past) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(day => (
          <div key={`c-${day}`} className="mx-auto w-10 h-10 flex items-center justify-center bg-white rounded-full text-on-surface font-label-md shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">{day}</div>
        ))}
        
        {/* Today */}
        <div className="mx-auto w-10 h-10 flex items-center justify-center bg-on-background rounded-full text-white font-label-md shadow-lg scale-110 cursor-pointer">12</div>
        
        {/* Current Month Days (Future) */}
        {[13, 14, 15, 16, 17, 18].map(day => (
          <div key={`f-${day}`} className="mx-auto w-10 h-10 flex items-center justify-center text-on-primary-fixed-variant font-label-md cursor-pointer hover:bg-white/50 rounded-full transition-colors">{day}</div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-on-background/30 cursor-pointer"></span>
        <span className="w-6 h-2 rounded-full bg-on-background cursor-pointer"></span>
        <span className="w-2 h-2 rounded-full bg-on-background/30 cursor-pointer"></span>
      </div>
    </section>
  );
};
