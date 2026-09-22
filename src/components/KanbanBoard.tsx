import React, { useMemo } from 'react';
import { AddressCard, KanbanStage } from '../types';
import {
  Search,
  Home,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';

interface KanbanBoardProps {
  cards: AddressCard[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCard: (card: AddressCard) => void;
}

export const STAGES: KanbanStage[] = [
  'Информирование о БД',
  'Информирование о собрании',
  'Собрание',
  'Доработка',
  'ОСС',
  'Монтаж',
  'Отказ',
];

export const getCardStage = (card: AddressCard): KanbanStage => {
  let currentStage: KanbanStage = 'Информирование о БД';

  if (card['Дата размещения РИМ презентация'] && card['Дата размещения РИМ презентация'] !== '') {
    currentStage = 'Информирование о собрании';
  }
  if (card['Дата презентации ПБД'] && card['Дата презентации ПБД'] !== '') {
    currentStage = 'Собрание';
  }

  const resPBD = card['Результат презентации ПБД'];

  if (resPBD === 'Отказ') {
    currentStage = 'Отказ';
  } else if (resPBD === 'Нет старшего') {
    currentStage = 'Доработка';
  } else {
    if (resPBD === 'Запуск ОСС') currentStage = 'ОСС';
    if (card['Дата проведения ОСС'] && card['Дата проведения ОСС'] !== '') currentStage = 'ОСС';
    if (card['Планируемая дата монтажа'] && card['Планируемая дата монтажа'] !== '') currentStage = 'Монтаж';
  }

  return currentStage;
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  searchQuery,
  onSearchChange,
  onOpenCard,
}) => {
  // Filtered cards based on search query
  const filteredCards = useMemo(() => {
    const normalize = (value: unknown) =>
      String(value ?? '')
        .toLocaleLowerCase('ru-RU')
        .replace(/[ё]/g, 'е')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
    const terms = normalize(searchQuery).split(/\s+/).filter(Boolean);
    if (!terms.length) return cards;

    return cards.filter(card => {
      const searchableText = normalize(Object.values(card).join(' '));
      const compactSearchableText = searchableText.replace(/\s/g, '');
      return terms.every(term => {
        const compactTerm = term.replace(/\s/g, '');
        return searchableText.includes(term) || compactSearchableText.includes(compactTerm);
      });
    });
  }, [cards, searchQuery]);

  // Group cards by stage
  const stageGroups = useMemo(() => {
    const map: Record<KanbanStage, AddressCard[]> = {
      'Информирование о БД': [],
      'Информирование о собрании': [],
      'Собрание': [],
      'Доработка': [],
      'ОСС': [],
      'Монтаж': [],
      'Отказ': [],
    };

    filteredCards.forEach(c => {
      const stage = getCardStage(c);
      if (map[stage]) {
        map[stage].push(c);
      } else {
        map['Информирование о БД'].push(c);
      }
    });

    return map;
  }, [filteredCards]);

  const getStageHeaderColor = (stage: KanbanStage) => {
    switch (stage) {
      case 'Информирование о БД':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Информирование о собрании':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Собрание':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Доработка':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'ОСС':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Монтаж':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Отказ':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStageBadgeColor = (stage: KanbanStage) => {
    switch (stage) {
      case 'Информирование о БД':
        return 'bg-indigo-600 text-white';
      case 'Информирование о собрании':
        return 'bg-blue-600 text-white';
      case 'Собрание':
        return 'bg-amber-600 text-white';
      case 'Доработка':
        return 'bg-orange-600 text-white';
      case 'ОСС':
        return 'bg-purple-600 text-white';
      case 'Монтаж':
        return 'bg-emerald-600 text-white';
      case 'Отказ':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Search Header Bar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Адрес, ФИО, телефон, УК..."
            aria-label="Поиск по объектам"
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end sm:self-center">
          <span>Найдено:</span>
          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 shadow-sm">
            {filteredCards.length} из {cards.length}
          </span>
        </div>
      </div>

      {/* Horizontal Scroll Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-3">
        <div className="flex gap-4 h-full min-w-max items-start">
          {STAGES.map(stage => {
            const stageCards = stageGroups[stage] || [];
            return (
              <div
                key={stage}
                className="w-[300px] lg:w-[320px] bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col max-h-full shrink-0 shadow-sm"
              >
                {/* Stage Header */}
                <div
                  className={`px-4 py-3 rounded-t-2xl border-b flex items-center justify-between font-bold text-xs uppercase tracking-wider ${getStageHeaderColor(
                    stage
                  )}`}
                >
                  <span className="truncate pr-2">{stage}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-sm ${getStageBadgeColor(
                      stage
                    )}`}
                  >
                    {stageCards.length}
                  </span>
                </div>

                {/* Cards List in Stage */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                  {stageCards.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
                      <p className="text-xs text-slate-400 font-medium">Нет объектов</p>
                    </div>
                  ) : (
                    stageCards.map(card => {
                      const apartments = card['Кол-во квартир'] || 0;
                      const strategy = card['Стратегия'] || '';
                      const senior = card['ФИО старшего'];
                      const phone = card['Контакты старшего'];
                      const resp =
                        card['ФИО ответственный ПБД'] ||
                        card['ФИО ответственный РИМ презентация'] ||
                        card['ФИО ответственный презентация ПБД'];

                      return (
                        <div
                          key={card.rowNumber}
                          onClick={() => onOpenCard(card)}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99] group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-blue-600 transition truncate-2-lines">
                              {card['Адрес'] || 'Адрес не указан'}
                            </h4>
                          </div>

                          {/* Details Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-2.5">
                            <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100 font-medium">
                              <Home className="w-3 h-3 text-slate-400" />
                              Кв: <strong className="text-slate-800">{apartments}</strong>
                            </span>

                            {strategy && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100/70 font-semibold text-[10px]">
                                {strategy}
                              </span>
                            )}

                            {card['Статус подъезда'] && (
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                                {card['Статус подъезда']}
                              </span>
                            )}
                          </div>

                          {/* Senior / Contact info if available */}
                          {senior && (
                            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                              <span className="truncate max-w-[170px]" title={senior}>
                                Старший: <strong className="text-slate-700">{senior}</strong>
                              </span>
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  onClick={e => e.stopPropagation()}
                                  title={phone}
                                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Responsible Employee Footer */}
                          {resp && (
                            <div className="mt-2 pt-1 text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                              <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate" title={resp}>
                                {resp}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
