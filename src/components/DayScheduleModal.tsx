import React from 'react';
import { AddressCard } from '../types';
import { X, Calendar, MapPin, Building, ArrowRight } from 'lucide-react';

interface DayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  items: Array<{ stage: string; color: string; card: AddressCard }>;
  onOpenCard: (card: AddressCard) => void;
}

export const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  items,
  onOpenCard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col transform transition-all border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                События на дату
              </p>
              <h3 className="text-lg font-bold text-slate-900">{dateStr}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              На эту дату нет запланированных событий
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onClose();
                  onOpenCard(item.card);
                }}
                className="p-4 border border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer hover:bg-blue-50/40 active:scale-[0.99] transition bg-white shadow-sm flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`}></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {item.stage}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </div>

                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{item.card['Адрес'] || 'Адрес не указан'}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Квартир: {item.card['Кол-во квартир'] || 0}</span>
                  {item.card['Управляющая компания'] && (
                    <span className="truncate">УК: {item.card['Управляющая компания']}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
