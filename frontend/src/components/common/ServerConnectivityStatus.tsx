import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { useApp } from '../../context/AppContext';
import {
  Server,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Radio,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { EndpointTestResult } from '../../lib/serverClient';

export const ServerConnectivityBadge: React.FC<{
  variant?: 'compact' | 'full' | 'header';
  className?: string;
}> = ({ variant = 'compact', className = '' }) => {
  const { serverOnline, serverLatency, openDiagnosticsModal, isChecking } = useServer();

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={openDiagnosticsModal}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] transition-all cursor-pointer border ${
          serverOnline
            ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-rose-500/15 text-rose-200 border-rose-500/30 hover:bg-rose-500/25'
        } ${className}`}
        title="View Backend Server Connectivity & API Diagnostics"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            serverOnline
              ? isChecking
                ? 'bg-amber-400 animate-spin'
                : 'bg-emerald-400 animate-pulse'
              : 'bg-rose-400'
          }`}
        />
        <span className="font-mono">{serverOnline ? `Backend ${serverLatency}ms` : 'Server Offline'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openDiagnosticsModal}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
        serverOnline
          ? 'bg-slate-900/90 text-slate-200 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800'
          : 'bg-rose-950/80 text-rose-200 border-rose-500/40 hover:bg-rose-900'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`w-2 h-2 rounded-full ${
            serverOnline ? 'bg-emerald-400' : 'bg-rose-500'
          }`}
        />
        {serverOnline && (
          <span className="absolute w-3 h-3 rounded-full bg-emerald-400/40 animate-ping" />
        )}
      </div>
      <span className="font-medium text-[11px]">
        {serverOnline ? 'Express Server Online' : 'Connecting to Server...'}
      </span>
      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-300">
        {serverLatency}ms
      </span>
    </button>
  );
};

export const ServerDiagnosticsModal: React.FC = () => {
  const {
    serverOnline,
    serverLatency,
    serverDetails,
    isChecking,
    isSyncing,
    pingServerNow,
    refreshServerStatus,
    testEndpointsNow,
    syncWithBackend,
    closeDiagnosticsModal,
    isDiagnosticsOpen,
  } = useServer();

  const { products, orders, addToast } = useApp();

  const [endpointResults, setEndpointResults] = useState<EndpointTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  if (!isDiagnosticsOpen) return null;

  const handleTestEndpoints = async () => {
    setIsRunningTests(true);
    try {
      const results = await testEndpointsNow();
      setEndpointResults(results);
      addToast('info', 'All backend endpoints verified!');
    } catch {
      addToast('error', 'Endpoint test error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleManualSync = async () => {
    addToast('info', 'Syncing catalog & orders with backend server...');
    const ok = await syncWithBackend(products, orders);
    if (ok) {
      addToast('success', 'Frontend state successfully synced with Express backend!');
    } else {
      addToast('error', 'Sync request failed. Verify server is listening.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Full-Stack Server Connectivity</h3>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    serverOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  {serverOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Express.js Backend &amp; Vite SPA on Port 3000 (Single-Domain Architecture)
              </p>
            </div>
          </div>
          <button
            onClick={closeDiagnosticsModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Latency</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {serverLatency} ms
              </div>
              <span className="text-[10px] text-slate-500">Round-trip ping</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Port</span>
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">3000</div>
              <span className="text-[10px] text-slate-500">Reverse proxy ingress</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Server Catalog</span>
                <Database className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {serverDetails?.productsCount ?? products.length} items
              </div>
              <span className="text-[10px] text-slate-500">Synced hardware</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>RBAC Authority</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white truncate">Kalam</div>
              <span className="text-[10px] text-slate-500">Superadmin root</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => pingServerNow()}
              disabled={isChecking}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Ping Server Now</span>
            </button>

            <button
              onClick={handleTestEndpoints}
              disabled={isRunningTests}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>Test API Endpoints</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Database className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Client & Server'}</span>
            </button>
          </div>

          {/* Endpoint Tests Matrix */}
          {endpointResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>Live Endpoints Verification Results</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ({endpointResults.filter((r) => r.ok).length}/{endpointResults.length} Passed)
                </span>
              </h4>
              <div className="space-y-1.5 bg-slate-950/80 rounded-2xl p-3 border border-slate-800">
                {endpointResults.map((test) => (
                  <div
                    key={test.endpoint}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                        {test.method}
                      </span>
                      <span className="font-mono text-white font-medium truncate">{test.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[10px] text-slate-400">{test.latencyMs}ms</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          test.ok
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Server Architecture Details */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Connectivity Architecture &amp; Integration
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Unified Dev &amp; Prod Serving:</strong> Vite runs as
                  native Express middleware in development; in production, Express serves compiled
                  static assets with SPA fallback.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Durable Session Rehydration:</strong> Authentication
                  tokens remain valid across server restarts with automatic session restoration for
                  Superadmin Kalam, Admins, and Customers.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Resilient AI Engine Fallback:</strong> The Hardware
                  AI advisor and copywriter provide uninterrupted local market intelligence even when
                  external keys or networks are offline.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Express v4.21 · Node {serverDetails?.nodeVersion || 'v20+'} · Port 3000
          </span>
          <button
            onClick={closeDiagnosticsModal}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
