import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NanoTech ErrorBoundary Caught]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('nanotech_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unknown render error occurred.';

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">NanoTech Solution</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Safe Mode
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Application Recovery System
                </h1>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Issue Detected</p>
              <p className="text-sm sm:text-base text-rose-300 font-mono break-words">
                {errorMsg}
              </p>
            </div>

            <p className="text-sm text-slate-300">
              The application encountered a client-side exception. You can quickly reload, reset cached data, or jump straight to the Storefront or Admin dashboard below.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleClearCache}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear Local Cache & Reset</span>
              </button>
            </div>

            {/* Navigation Shortcuts */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <a
                href="/"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-indigo-400" />
                <span>Storefront Home</span>
              </a>

              <a
                href="/admin"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Dashboard</span>
              </a>

              <a
                href="/superadmin"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Superadmin Portal</span>
              </a>
            </div>

            {/* Technical details accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
              >
                <span>Technical Stack Trace</span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-black/60 border border-slate-800 rounded-lg max-h-60 overflow-y-auto text-xs font-mono text-slate-400 whitespace-pre-wrap">
                  {this.state.error?.stack || 'No stack trace available.'}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-slate-500">
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
