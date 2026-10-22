import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Sliders, Activity, Shield, Download, CheckCircle2, Lock, Server } from 'lucide-react';

export const SuperadminSettingsView: React.FC = () => {
  const { auditLogs, settings, updateSettings } = useRBAC();
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [allowReg, setAllowReg] = useState(settings.allowCustomerRegistration);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeoutHours);
  const [saveAlert, setSaveAlert] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      maintenanceMode: maintenance,
      allowCustomerRegistration: allowReg,
      sessionTimeoutHours: sessionTimeout,
    });
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Security Audit Log</h1>
        <p className="text-xs text-slate-400 mt-1">
          Root security parameters, maintenance switch, and tamper-resistant audit logs
        </p>
      </div>

      {saveAlert && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>System configuration saved and synced across cluster.</span>
        </div>
      )}

      {/* Global Config Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-amber-400" />
          Global Security Controls (Kalam)
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">System Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Suspend customer access while preserving admin sessions</div>
              </div>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Public Customer Registration</div>
                <div className="text-[11px] text-slate-400">Permit new shoppers to register via /customer/signup</div>
              </div>
              <input
                type="checkbox"
                checked={allowReg}
                onChange={(e) => setAllowReg(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-white block mb-1">Session Inactivity Timeout (Hours)</label>
              <input
                type="number"
                min="1"
                max="72"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-white">Production Domain Mapping</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">https://yourdomain.com (Single Next.js Domain)</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Save System Controls
            </button>
          </div>
        </form>
      </div>

      {/* Security Audit Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Comprehensive Audit Trail
            </h3>
            <p className="text-xs text-slate-400">All administrative operations and permission updates are recorded</p>
          </div>

          <button
            onClick={() => alert('Exporting raw security audit logs...')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Download Log File
          </button>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[10px] bg-slate-950 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                    {log.target}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-slate-300 font-medium">
                  By: <strong className="text-amber-400">{log.actorName}</strong> ({log.actorRole})
                </div>
                <div className="text-slate-500 text-[10px] font-mono">
                  {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
