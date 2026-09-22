import React from 'react';
import { ToastState } from '../types';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast.visible) return null;

  const getBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-100" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 shrink-0 text-red-100" />;
      case 'info':
        return <Info className="w-5 h-5 shrink-0 text-blue-100" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 w-[92%] sm:w-auto sm:min-w-[340px] max-w-lg shadow-2xl">
      <div
        className={`${getBg()} px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-sm font-medium border border-white/10 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="leading-tight">{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 hover:bg-white/15 rounded-lg transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
