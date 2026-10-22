import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50 backdrop-blur-md'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-700/50 backdrop-blur-md'
              : 'bg-slate-900/90 text-slate-100 border-slate-700/50 backdrop-blur-md'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <span>{toast.message}</span>
          </div>
            <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
