import React, { useState, useMemo } from 'react';
import { AddressCard, CalendarStageMap } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DayScheduleModal } from './DayScheduleModal';

interface CalendarViewProps {
  cards: AddressCard[];
  onOpenCard: (card: AddressCard) => void;
}

const CALENDAR_STAGES: CalendarStageMap[] = [
  { stage: 'Информирование о БД', field: 'Дата информирования ПБД', color: 'bg-indigo-500 text-white', dotColor: 'bg-indigo-500' },
  { stage: 'Информирование о собрании', field: 'Дата размещения РИМ презентация', color: 'bg-blue-500 text-white', dotColor: 'bg-blue-500' },
  { stage: 'Собрание', field: 'Дата презентации ПБД', color: 'bg-amber-500 text-white', dotColor: 'bg-amber-500' },
  { stage: 'ОСС', field: 'Дата проведения ОСС', color: 'bg-purple-500 text-white', dotColor: 'bg-purple-500' },
  { stage: 'Монтаж', field: 'Планируемая дата монтажа', color: 'bg-emerald-500 text-white', dotColor: 'bg-emerald-500' },
];

export const CalendarView: React.FC<CalendarViewProps> = ({ cards, onOpenCard }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ stage: string; color: string; card: AddressCard }>
  >([]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = useMemo(() => {
    return currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Generate grid days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay();
    // In Russian calendar: Monday is 1, Sunday is 7
    startDayOfWeek = startDayOfWeek === 0 ? 7 : startDayOfWeek;

    const days: Array<{
      empty: boolean;
      dateStr?: string;
      dayNum?: number;
      isToday?: boolean;
    }> = [];

    // Empty slots before 1st of month
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push({ empty: true });
    }

    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1
    ).padStart(2, '0')}.${today.getFullYear()}`;

    // Fill actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayStr = String(d).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const dateString = `${dayStr}.${monthStr}.${year}`;
      days.push({
        empty: false,
        dateStr: dateString,
        dayNum: d,
        isToday: dateString === todayStr,
      });
    }

    return days;
  }, [currentDate]);

  // Compute events for each day
  const eventsByDate = useMemo(() => {
    const map: Record<
      string,
      {
        counts: Record<string, { count: number; color: string }>;
        cards: Array<{ stage: string; color: string; card: AddressCard }>;
      }
    > = {};

    cards.forEach(card => {
      CALENDAR_STAGES.forEach(st => {
        const val = card[st.field];
        if (val && typeof val === 'string' && val.trim() !== '') {
          const dateKey = val.trim();
          if (!map[dateKey]) {
            map[dateKey] = { counts: {}, cards: [] };
          }
          if (!map[dateKey].counts[st.stage]) {
            map[dateKey].counts[st.stage] = { count: 0, color: st.dotColor };
          }
          map[dateKey].counts[st.stage].count += 1;
          map[dateKey].cards.push({ stage: st.stage, color: st.dotColor, card });
        }
      });
    });

    return map;
  }, [cards]);

  const handleDayClick = (dateStr?: string) => {
    if (!dateStr) return;
    const dayData = eventsByDate[dateStr];
    setSelectedDayStr(dateStr);
    setSelectedItems(dayData ? dayData.cards : []);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Legend & Navigation Header */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/80 p-4 md:p-6 mb-4 shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white text-slate-700 rounded-lg transition"
                title="Предыдущий месяц"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={setToday}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition"
              >
                Сегодня
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white text-slate-700 rounded-lg transition"
                title="Следующий месяц"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize tracking-tight">
              {monthName}
            </h2>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {CALENDAR_STAGES.map(s => (
              <div
                key={s.stage}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor}`}></span>
                <span className="font-medium text-slate-600">{s.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex-1 flex flex-col min-h-[580px]">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center font-bold text-xs uppercase tracking-wider text-slate-400 py-3">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1 gap-px bg-slate-100">
          {calendarDays.map((day, idx) => {
            if (day.empty) {
              return <div key={idx} className="bg-slate-50/40 min-h-[90px] md:min-h-[120px]" />;
            }

            const dayEvents = day.dateStr ? eventsByDate[day.dateStr] : null;
            const hasEvents = dayEvents && dayEvents.cards.length > 0;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day.dateStr)}
                className={`bg-white min-h-[90px] md:min-h-[120px] p-2 md:p-3 transition-colors flex flex-col justify-between cursor-pointer hover:bg-blue-50/40 ${
                  day.isToday ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 flex items-center justify-center text-xs md:text-sm font-bold rounded-full ${
                      day.isToday
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-blue-600'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {hasEvents && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {dayEvents.cards.length}
                    </span>
                  )}
                </div>

                {/* Event badging */}
                <div className="mt-1 space-y-1 overflow-hidden flex-1">
                  {dayEvents &&
                    Object.entries(dayEvents.counts).map(([stage, info]) => (
                      <div
                        key={stage}
                        className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-700 font-medium"
                      >
                        <span className="truncate pr-1 hidden md:inline">{stage}</span>
                        <span
                          className={`w-4 h-4 rounded-full ${info.color} text-white flex items-center justify-center font-bold text-[9px] shrink-0 mx-auto md:mx-0`}
                        >
                          {info.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Schedule Modal */}
      {selectedDayStr && (
        <DayScheduleModal
          isOpen={Boolean(selectedDayStr)}
          onClose={() => setSelectedDayStr(null)}
          dateStr={selectedDayStr}
          items={selectedItems}
          onOpenCard={onOpenCard}
        />
      )}
    </div>
  );
};
