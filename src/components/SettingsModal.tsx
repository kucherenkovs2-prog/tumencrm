import React, { useState } from 'react';
import { GasApiService } from '../services/gasApi';
import {
  X,
  Database,
  Link,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  onShowToast,
}) => {
  const [gasUrl, setGasUrl] = useState(GasApiService.getGasUrl());
  const [isDemo, setIsDemo] = useState(GasApiService.isDemoMode());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    spreadsheet?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      GasApiService.setGasUrl(gasUrl);
      GasApiService.setDemoMode(isDemo);
      const res = await GasApiService.ping();
      if (res.success) {
        setTestResult({
          success: true,
          spreadsheet: res.spreadsheet || 'Соединение успешно установлено',
        });
        onShowToast('Соединение проверено: успешно!', 'success');
      } else {
        setTestResult({
          success: false,
          error: res.error || 'Не удалось связаться с сервером',
        });
        onShowToast('Ошибка связи: ' + (res.error || 'Недоступен'), 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Ошибка соединения с прокси',
      });
      onShowToast('Сбой проверки: ' + err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    GasApiService.setGasUrl(gasUrl);
    GasApiService.setDemoMode(isDemo);
    onShowToast('Настройки интеграции сохранены', 'success');
    onSaved();
    onClose();
  };

  const handleResetDemo = () => {
    GasApiService.resetDemoData();
    onShowToast('Демо-данные сброшены к начальным значениям', 'info');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all border border-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Интеграция с Google Таблицами</h2>
              <p className="text-xs text-slate-500">Google Apps Script Web App Backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Mode Switcher */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Источник данных
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDemo(false)}
                className={`p-3 rounded-xl border text-left transition ${
                  !isDemo
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-sm">Google Apps Script</div>
                <div
                  className={`text-xs mt-0.5 ${!isDemo ? 'text-blue-100' : 'text-slate-400'}`}
                >
                  Боевая Google Таблица
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsDemo(true)}
                className={`p-3 rounded-xl border text-left transition ${
                  isDemo
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-sm">Демо-режим</div>
                <div
                  className={`text-xs mt-0.5 ${isDemo ? 'text-blue-100' : 'text-slate-400'}`}
                >
                  Автономное тестирование
                </div>
              </button>
            </div>
          </div>

          {/* Web App URL Input */}
          {!isDemo && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                URL веб-приложения Google Apps Script (/exec)
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={gasUrl}
                  onChange={e => setGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Заканчивается на <code className="text-blue-600 font-bold">/exec</code>. Доступ
                должен быть настроен для «Все» (Anyone).
              </p>
            </div>
          )}

          {/* Test connection & result */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || (!isDemo && !gasUrl)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 self-start"
            >
              {testing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-700" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Проверка связи (Ping)...</span>
                </>
              ) : (
                <span>Проверить соединение (Ping)</span>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>
                  {testResult.success
                    ? `Подключено к таблице: ${testResult.spreadsheet}`
                    : `Ошибка: ${testResult.error}`}
                </span>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          {isDemo && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Сбросить локальные изменения объектов к исходным
              </span>
              <button
                type="button"
                onClick={handleResetDemo}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить данные</span>
              </button>
            </div>
          )}

          {/* Instructions accordion */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Инструкция по подключению Google Таблицы:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-600 pl-1">
              <li>
                Откройте Google Таблицу с вкладками{' '}
                <strong className="text-slate-800 font-semibold">
                  "Сотрудники", "Справочник", "Адресная база", "Справочник УК"
                </strong>
                .
              </li>
              <li>
                В верхнем меню выберите:{' '}
                <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">
                  Расширения -&gt; Apps Script
                </code>
                .
              </li>
              <li>Вставьте ваш код Google Apps Script в редактор и сохраните.</li>
              <li>
                Нажмите:{' '}
                <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">
                  Развернуть -&gt; Новое развертывание -&gt; Веб-приложение
                </code>
                .
              </li>
              <li>
                «Выполнять от имени»: <strong>От моего имени (Me)</strong>, «У кого есть доступ»:
                <strong> Все (Anyone)</strong>.
              </li>
              <li>Скопируйте полученный URL (заканчивается на /exec) и вставьте в поле выше!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition shadow-md"
          >
            Применить настройки
          </button>
        </div>
      </div>
    </div>
  );
};
