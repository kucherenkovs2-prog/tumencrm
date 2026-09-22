import React, { useState, useMemo } from 'react';
import { UKItem } from '../types';
import {
  Search,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  UserCheck,
  FileText,
} from 'lucide-react';

interface UKDirectoryViewProps {
  ukDirectory: UKItem[];
}

export const UKDirectoryView: React.FC<UKDirectoryViewProps> = ({ ukDirectory }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const normalize = (value: unknown) =>
      String(value ?? '')
        .toLocaleLowerCase('ru-RU')
        .replace(/[ё]/g, 'е')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
    const terms = normalize(searchQuery).split(/\s+/).filter(Boolean);
    if (!terms.length) return ukDirectory;

    return ukDirectory.filter(uk => {
      const searchableText = normalize(Object.values(uk).join(' '));
      const compactSearchableText = searchableText.replace(/\s/g, '');
      return terms.every(term => {
        const compactTerm = term.replace(/\s/g, '');
        return searchableText.includes(term) || compactSearchableText.includes(compactTerm);
      });
    });
  }, [ukDirectory, searchQuery]);

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Название, ИНН, ОГРН, адрес, телефон..."
            aria-label="Поиск по справочнику управляющих компаний"
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          Количество УК в базе: <strong className="text-slate-800">{filtered.length}</strong>
        </div>
      </div>

      {/* Grid of UK cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Управляющая компания не найдена</h3>
          <p className="text-slate-500 text-sm mt-1">Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((uk, index) => {
            const website = uk['Сайт'];
            const siteUrl = website
              ? website.startsWith('http')
                ? website
                : `http://${website}`
              : null;

            return (
              <div
                key={index}
                className="bg-white p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top info */}
                  <div className="border-b border-slate-100 pb-3 mb-3">
                    <h3 className="font-bold text-base text-slate-800 leading-snug mb-1">
                      {uk['Полное название'] || 'Без названия'}
                    </h3>
                    {uk['Сокращенное название'] && (
                      <p className="text-xs font-bold text-blue-600">
                        {uk['Сокращенное название']}
                      </p>
                    )}
                  </div>

                  {/* Key props */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Субъект РФ
                      </p>
                      <p className="font-semibold text-slate-700 truncate">
                        {uk['Субъект РФ'] || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Ответственное лицо
                      </p>
                      <p className="font-semibold text-slate-700 leading-tight">
                        {uk['Ответственное лицо'] || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Requisites Block */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        ИНН
                      </span>
                      <strong className="text-slate-800">{uk['ИНН'] || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        ОГРН
                      </span>
                      <strong className="text-slate-800">{uk['ОГРН'] || '—'}</strong>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {uk['Телефон'] && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${uk['Телефон']}`}
                          className="hover:text-blue-600 transition truncate"
                        >
                          {uk['Телефон']}
                        </a>
                      </div>
                    )}

                    {uk['email'] && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${uk['email']}`}
                          className="hover:text-blue-600 transition truncate"
                        >
                          {uk['email']}
                        </a>
                      </div>
                    )}

                    {siteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={siteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Addresses Footer */}
                <div className="border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl md:rounded-b-3xl">
                  {uk['Юридический адрес'] && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight truncate-2-lines">
                        <strong className="text-slate-600">Юр. адрес:</strong>{' '}
                        {uk['Юридический адрес']}
                      </span>
                    </div>
                  )}
                  {uk['Фактический адрес'] && uk['Фактический адрес'] !== uk['Юридический адрес'] && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight truncate-2-lines">
                        <strong className="text-slate-600">Факт. адрес:</strong>{' '}
                        {uk['Фактический адрес']}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
