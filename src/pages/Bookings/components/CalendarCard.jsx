import React from 'react';

const formatDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    const dayNumber = prevMonthDays - startWeekday + i + 1;
    cells.push({ day: dayNumber, inMonth: false, dateKey: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day);
    cells.push({ day, inMonth: true, dateKey: formatDateKey(current) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, inMonth: false, dateKey: null });
  }

  return cells;
};

export const CalendarCard = ({
  selectedDate,
  onSelectDate,
  monthAnchor,
  onPrevMonth,
  onNextMonth,
  bookingCountByDate = {}
}) => {
  const cells = buildCalendarCells(monthAnchor);
  const monthTitle = monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-primary p-6 rounded-3xl text-on-primary">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-lg-mobile">{monthTitle}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onPrevMonth} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={onNextMonth} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center font-label-sm opacity-70 mb-2">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center font-body-md">
        {cells.map((cell, idx) => {
          const isSelected = cell.inMonth && cell.dateKey === selectedDate;
          const bookingCount = cell.dateKey ? Number(bookingCountByDate[cell.dateKey] || 0) : 0;
          return (
            <button
              key={`${cell.day}-${idx}`}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.inMonth && onSelectDate(cell.dateKey)}
              className={`h-11 relative rounded-full transition-colors ${
                !cell.inMonth
                  ? 'opacity-30 cursor-default'
                  : isSelected
                    ? 'bg-inverse-surface text-inverse-on-surface'
                    : 'hover:bg-white/10'
              }`}
            >
              <span>{cell.day}</span>
              {cell.inMonth && bookingCount > 0 && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-semibold bg-white text-primary">
                  {bookingCount > 9 ? '9+' : bookingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
