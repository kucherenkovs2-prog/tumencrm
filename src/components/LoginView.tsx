import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, KeyRound, User as UserIcon, Settings } from 'lucide-react';

interface LoginViewProps {
  onLogin: (login: string, pass: string, remember: boolean) => Promise<void>;
  loading: boolean;
  error?: string;
  onOpenSettings: () => void;
  isDemoMode: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  loading,
  error,
  onOpenSettings,
  isDemoMode,
}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) return;
    onLogin(login, password, remember);
  };

  const fillDemoAccount = (demoLogin: string, demoPass: string) => {
    setLogin(demoLogin);
    setPassword(demoPass);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-100 z-50 p-0 md:p-8 min-h-screen overflow-y-auto">
      <div className="flex flex-col md:flex-row w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-[2.5rem] overflow-hidden md:shadow-2xl md:min-h-[640px] border border-slate-100">
        
        {/* Left Brand Panel */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 md:p-14 md:w-1/2 flex flex-col justify-between items-center text-center text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="w-full flex justify-between items-center z-10">
            <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              CRM Управление адресами
            </span>
            <button
              onClick={onOpenSettings}
              title="Настройки интеграции"
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center my-8 md:my-auto z-10">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
              <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">БЕЗОПАСНОСТЬ</h2>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-wider text-blue-100 mb-4">
              XXI ВЕКА
            </h2>

            <div className="h-0.5 w-12 bg-blue-300/40 my-3"></div>

            <h1 className="text-xl md:text-2xl font-bold text-white">CRM Workspace</h1>
            <p className="text-blue-100/90 text-sm md:text-base mt-2 max-w-xs font-light">
              Единая корпоративная система управления адресной базой и воронкой ОСС
            </p>
          </div>

          <div className="text-xs text-blue-200/80 z-10 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            ></span>
            <span>
              {isDemoMode ? 'Режим: Автономный / Демо' : 'Подключение: Google Apps Script'}
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 md:p-14 md:w-1/2 flex flex-col justify-center bg-white flex-1 overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">
              Вход в систему
            </h2>
            <p className="text-sm md:text-base text-slate-500">
              Введите ваши корпоративные учетные данные
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5">
                Логин
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base text-slate-800"
                  placeholder="user@company.com или login"
                  required
                />
                <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base text-slate-800"
                  placeholder="••••••••"
                  required
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Запомнить меня</span>
              </label>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Настройки подключения
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 mt-2 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Авторизация...</span>
                </>
              ) : (
                <span>Войти в систему</span>
              )}
            </button>
          </form>

          {/* Demo account quick login helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Быстрый вход (демо-аккаунты):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition"
              >
                <div className="font-bold text-slate-800">Администратор</div>
                <div className="text-slate-500 font-mono text-[11px]">admin / admin</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ivanov', '123')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition"
              >
                <div className="font-bold text-slate-800">Пользователь</div>
                <div className="text-slate-500 font-mono text-[11px]">ivanov / 123</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
