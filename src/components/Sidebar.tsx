import React from 'react';
import { User } from '../types';
import {
  Kanban,
  CalendarDays,
  Building2,
  LogOut,
  Settings,
  Shield,
  X,
  RefreshCw,
  Database,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: 'kanban' | 'calendar' | 'ukDirectory';
  onSelectTab: (tab: 'kanban' | 'calendar' | 'ukDirectory') => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isPolling: boolean;
  isDemoMode: boolean;
  objectCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout,
  onOpenSettings,
  onRefresh,
  isPolling,
  isDemoMode,
  objectCount,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 md:w-64 bg-white border-r border-slate-100 z-50 transition-transform duration-300 md:translate-x-0 flex flex-col h-full shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 leading-tight block">
                БЕЗОПАСНОСТЬ
              </span>
              <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase block">
                XXI ВЕКА · CRM
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync / Database Status Pill */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition truncate"
            title="Нажмите для настроек подключения"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isDemoMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
              }`}
            ></span>
            <span className="font-medium truncate">
              {isDemoMode ? 'Демо-база данных' : 'Google Apps Script'}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              disabled={isPolling}
              title="Синхронизировать сейчас"
              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200/60 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              onClick={onOpenSettings}
              title="Настройки интеграции"
              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200/60 transition"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => {
              onSelectTab('kanban');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'kanban'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <Kanban className="w-5 h-5 text-current" />
              <span>Воронка (Канбан)</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'kanban' ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {objectCount}
            </span>
          </button>

          <button
            onClick={() => {
              onSelectTab('calendar');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <CalendarDays className="w-5 h-5 text-current" />
            <span>Календарь</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('ukDirectory');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'ukDirectory'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <Building2 className="w-5 h-5 text-current" />
            <span>Справочник УК</span>
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 px-1 mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-inner">
              {user.fio ? user.fio.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate" title={user.fio}>
                {user.fio}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    user.role === 'Администратор'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-[11px] text-slate-400 truncate">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Интеграция</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50/70 hover:bg-red-100/70 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
