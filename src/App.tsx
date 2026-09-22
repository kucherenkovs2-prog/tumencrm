import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AddressCard, Dictionaries, ToastState, UKItem, User } from './types';
import { GasApiService } from './services/gasApi';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { UKDirectoryView } from './components/UKDirectoryView';
import { AddressModal } from './components/AddressModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { RefreshCw, Settings, Shield } from 'lucide-react';

const AUTH_STORAGE_KEY = 'crmAuthData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'kanban' | 'calendar' | 'ukDirectory'>('kanban');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [cards, setCards] = useState<AddressCard[]>([]);
  const [dictionaries, setDictionaries] = useState<Dictionaries>({});
  const [ukDirectory, setUkDirectory] = useState<UKItem[]>([]);

  const [kanbanSearch, setKanbanSearch] = useState('');
  const [activeCard, setActiveCard] = useState<AddressCard | null>(null);

  const [isPolling, setIsPolling] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(GasApiService.isDemoMode());

  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const cardsRef = useRef<AddressCard[]>([]);
  cardsRef.current = cards;

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Auto-hide toast after 4s
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission();
      } catch {}
    }
  }, []);

  // Send native desktop notification
  const sendNativeNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {}
    }
  }, []);

  // Compare old cards with new cards to trigger diff notifications
  const compareAndNotify = useCallback(
    (oldCards: AddressCard[], newCards: AddressCard[]) => {
      if (oldCards.length === 0) return;

      let added = 0;
      let changed = 0;

      newCards.forEach(nc => {
        const oc = oldCards.find(c => c.rowNumber === nc.rowNumber);
        if (!oc) {
          added++;
        } else {
          let isDifferent = false;
          for (const key in nc) {
            if (nc[key] !== oc[key] && key !== 'rowNumber') {
              isDifferent = true;
              break;
            }
          }
          if (isDifferent) changed++;
        }
      });

      if (added > 0) {
        showToast(`Вам назначено новых объектов: ${added}`, 'success');
        sendNativeNotification('Новые объекты в CRM', `Вам назначено ${added} новых объектов.`);
      } else if (changed > 0) {
        showToast(`Изменены данные по ${changed} объектам`, 'info');
      }
    },
    [showToast, sendNativeNotification]
  );

  // Fetch all data
  const fetchData = useCallback(
    async (currentUser: User, silent: boolean = false) => {
      if (!silent) setLoading(true);
      setIsPolling(true);

      try {
        const [dictRes, cardsRes, ukRes] = await Promise.all([
          GasApiService.getDictionaries(),
          GasApiService.getAddressData(currentUser.role, currentUser.fio),
          GasApiService.getUKDirectory(),
        ]);

        if (dictRes) setDictionaries(dictRes);

        if (Array.isArray(cardsRes)) {
          if (silent) {
            compareAndNotify(cardsRef.current, cardsRes);
          }
          setCards(cardsRes);
        }

        if (Array.isArray(ukRes)) {
          setUkDirectory(ukRes);
        }
      } catch (err: any) {
        console.error('Data fetch error:', err);
        if (!silent) {
          showToast('Ошибка загрузки данных: ' + (err.message || 'Сбой соединения'), 'error');
        }
      } finally {
        if (!silent) setLoading(false);
        setIsPolling(false);
      }
    },
    [compareAndNotify, showToast]
  );

  // Handle Login
  const handleLogin = useCallback(
    async (login: string, pass: string, remember: boolean) => {
      setLoading(true);
      setAuthError('');
      try {
        const res = await GasApiService.login(login, pass);
        if (res.success && res.user) {
          setUser(res.user);

          if (remember) {
            localStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({ login, password: pass })
            );
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }

          requestNotificationPermission();
          await fetchData(res.user);
          showToast(`Добро пожаловать, ${res.user.fio}!`, 'success');
        } else {
          setAuthError(res.message || 'Неверный логин или пароль');
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (err: any) {
        setAuthError('Ошибка авторизации: ' + (err.message || 'Сбой соединения'));
      } finally {
        setLoading(false);
      }
    },
    [fetchData, requestNotificationPermission, showToast]
  );

  // Auto-login from saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const { login, password } = JSON.parse(saved);
        if (login && password) {
          handleLogin(login, password, true);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [handleLogin]);

  // Polling interval (60 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchData(user, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  // Logout
  const handleLogout = useCallback(() => {
    setUser(null);
    setCards([]);
    setUkDirectory([]);
    setActiveTab('kanban');
    setIsSidebarOpen(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('Вы вышли из системы', 'info');
  }, [showToast]);

  const handleManualRefresh = useCallback(() => {
    if (user) {
      fetchData(user, false);
      showToast('Синхронизация данных...', 'info');
    }
  }, [user, fetchData, showToast]);

  // Keep track of demo mode state changes
  const handleSettingsSaved = useCallback(() => {
    setIsDemoMode(GasApiService.isDemoMode());
    if (user) {
      fetchData(user, false);
    }
  }, [user, fetchData]);

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden font-sans text-slate-800 antialiased">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Login Screen if not authenticated */}
      {!user ? (
        <LoginView
          onLogin={handleLogin}
          loading={loading}
          error={authError}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDemoMode={isDemoMode}
        />
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRefresh={handleManualRefresh}
            isPolling={isPolling}
            isDemoMode={isDemoMode}
            objectCount={cards.length}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50/60 pb-[76px] md:pb-0">
            {/* Mobile Top Header */}
            <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleManualRefresh}
                  disabled={isPolling}
                  className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 rounded-xl disabled:opacity-50"
                  aria-label="Обновить данные"
                >
                  <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 rounded-xl"
                  aria-label="Настройки интеграции"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <span className="font-bold text-base text-slate-800 block leading-tight">
                  {activeTab === 'kanban'
                    ? 'Воронка (Канбан)'
                    : activeTab === 'calendar'
                    ? 'Календарь'
                    : 'Справочник УК'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {cards.length} объектов
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {user.fio ? user.fio.charAt(0) : 'U'}
              </div>
            </header>

            {/* Desktop Top Header */}
            <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 items-center justify-between z-20 shrink-0">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                  {activeTab === 'kanban'
                    ? 'Воронка объектов (Канбан)'
                    : activeTab === 'calendar'
                    ? 'Календарь выездов и событий'
                    : 'Справочник управляющих компаний'}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Безопасность XXI Века · Управление адресной базой и ОСС
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition"
                  title="Нажмите для настройки подключения"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPolling
                        ? 'bg-blue-500 animate-spin'
                        : isDemoMode
                        ? 'bg-amber-500'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  ></span>
                  <span className="text-xs font-bold text-slate-700">
                    {isDemoMode ? 'Демо-режим' : 'Сервер'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({cards.length} объектов)</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isPolling}
                  className="p-2.5 text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
                  title="Обновить данные"
                >
                  <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-blue-600' : ''}`} />
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2.5 text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm active:scale-95"
                  title="Настройки интеграции"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 overflow-hidden relative">
              {loading && !cards.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-20">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30 animate-pulse">
                    <Shield className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Загрузка данных CRM...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Синхронизация адресной базы и справочников
                  </p>
                </div>
              ) : null}

              {activeTab === 'kanban' && (
                <KanbanBoard
                  cards={cards}
                  searchQuery={kanbanSearch}
                  onSearchChange={setKanbanSearch}
                  onOpenCard={card => setActiveCard(card)}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarView cards={cards} onOpenCard={card => setActiveCard(card)} />
              )}

              {activeTab === 'ukDirectory' && <UKDirectoryView ukDirectory={ukDirectory} />}
            </main>
          </div>

          {/* Detailed Address Card Modal */}
          {activeCard && (
            <AddressModal
              card={activeCard}
              isOpen={Boolean(activeCard)}
              onClose={() => setActiveCard(null)}
              onSaved={() => {
                if (user) fetchData(user, false);
              }}
              user={user}
              dictionaries={dictionaries}
              onShowToast={showToast}
            />
          )}

          {/* Integration Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSaved={handleSettingsSaved}
            onShowToast={showToast}
          />
        </>
      )}
    </div>
  );
}
