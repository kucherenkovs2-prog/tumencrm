import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteDocModalProps {
  isOpen: boolean;
  docType: string;
  onCancel: () => void;
  onConfirm: () => void;
  processing: boolean;
}

export const DeleteDocModal: React.FC<DeleteDocModalProps> = ({
  isOpen,
  docType,
  onCancel,
  onConfirm,
  processing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all border border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1.5">Удалить документ?</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Вы действительно хотите удалить сгенерированный файл{' '}
          <strong className="text-slate-800 font-semibold">{docType}</strong>? Он будет
          перемещен в корзину Google Диска.
        </p>

        <div className="flex justify-end gap-3 w-full">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};
