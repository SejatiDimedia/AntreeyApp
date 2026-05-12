import React from 'react';

export const CalendarWidget = ({ bookings = [] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const bookingCountByDate = bookings.reduce((acc, item) => {
    if (!item?.date) return acc;
    acc[item.date] = (acc[item.date] || 0) + 1;
    return acc;
  }, {});

  const dateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <section className="bg-primary-container rounded-[32px] p-6 shadow-lg shadow-primary-container/20">
      <div className="flex items-center justify-between mb-8 bg-primary p-4 rounded-2xl">
        <span className="text-on-primary font-headline-lg-mobile">{monthName}</span>
        <span className="material-symbols-outlined text-on-primary cursor-pointer hover:bg-white/10 rounded-full p-1">arrow_drop_down</span>
      </div>
      <div className="grid grid-cols-7 text-center gap-y-4">
        {/* Day Headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <span key={`h-${i}`} className="text-on-primary-fixed-variant/60 font-label-md">{day}</span>
        ))}
        
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`p-${idx}`} className="flex flex-col items-center gap-1 opacity-20 text-on-primary-fixed-variant font-label-md"><span>•</span></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const isToday = day === now.getDate();
          const key = dateKey(day);
          const count = bookingCountByDate[key] || 0;
          return (
            <div key={`d-${day}`} className="flex flex-col items-center gap-1">
              <div className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full font-label-md cursor-pointer transition-colors ${isToday ? 'bg-on-background text-white shadow-lg scale-110' : 'text-on-primary-fixed-variant hover:bg-white/50'}`}>
                {day}
              </div>
              {count > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] rounded-full bg-on-background text-white">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-on-background/30 cursor-pointer"></span>
        <span className="w-6 h-2 rounded-full bg-on-background cursor-pointer"></span>
        <span className="w-2 h-2 rounded-full bg-on-background/30 cursor-pointer"></span>
      </div>
    </section>
  );
};
