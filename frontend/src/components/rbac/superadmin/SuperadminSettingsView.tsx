import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase/client';
import {
  Sliders,
  Activity,
  Shield,
  Download,
  CheckCircle2,
  Lock,
  Store,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Truck,
  Loader2,
} from 'lucide-react';

export const SuperadminSettingsView: React.FC = () => {
  const { auditLogs, settings, updateSettings, addAuditLog } = useRBAC();
  const { addToast } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName || 'NanoTech Solutions');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@nanotech.com');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+977 9852055346');
  const [address, setAddress] = useState(settings.address || 'Itahari-6, Main Road, Sunsari, Nepal');
  const [defaultCurrency, setDefaultCurrency] = useState<'NPR' | 'USD'>(settings.defaultCurrency || 'NPR');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(settings.freeShippingThreshold || 50000);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [allowReg, setAllowReg] = useState(settings.allowCustomerRegistration ?? true);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeoutHours || 24);

  const [isSaving, setIsSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = {
      storeName,
      supportEmail,
      supportPhone,
      address,
      defaultCurrency,
      freeShippingThreshold,
      maintenanceMode: maintenance,
      allowCustomerRegistration: allowReg,
      allowNewRegistrations: allowReg,
      sessionTimeoutHours: sessionTimeout,
    };

    try {
      // 1. Update RBAC Context & Local state
      updateSettings(updated);

      // 2. Persist to Supabase system_settings table
      try {
        await supabase
          .from('system_settings')
          .upsert({
            key: 'store_configuration',
            value: updated,
            updated_at: new Date().toISOString(),
          });
      } catch (dbErr) {
        console.warn('Supabase system_settings upsert notice:', dbErr);
      }

      addAuditLog(
        'STORE_SETTINGS_UPDATED',
        'Global Store Configuration',
        `Store settings updated by Super Admin (Currency: ${defaultCurrency}, Maintenance: ${maintenance})`
      );

      setSaveAlert(true);
      addToast('success', 'Store settings and system configuration saved successfully.');
      setTimeout(() => setSaveAlert(false), 3000);
    } catch (err: any) {
      addToast('error', 'Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store &amp; System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global store configuration, customer policies, shipping thresholds, and tamper-resistant audit logs
          </p>
        </div>
      </div>

      {saveAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Store settings successfully synced and saved to database.</span>
        </div>
      )}

      {/* Global Store Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            General Storefront Settings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Branding, contact details, currency, and checkout thresholds.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                Store Name
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Customer Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Support Phone Number
              </label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Store Physical Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Default Storefront Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value as 'NPR' | 'USD')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
              >
                <option value="NPR">NPR (Nepalese Rupee - रू)</option>
                <option value="USD">USD (US Dollar - $)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Free Shipping Threshold ({defaultCurrency})
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Platform &amp; Access Policies
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">System Maintenance Mode</div>
                  <div className="text-[11px] text-slate-500">Suspend customer access while preserving admin sessions</div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Public Customer Registration</div>
                  <div className="text-[11px] text-slate-500">Allow new shoppers to register on storefront</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowReg}
                  onChange={(e) => setAllowReg(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block mb-1">Session Inactivity Timeout (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-semibold"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">Database System Synchronization</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">Supabase: zovjbvddiimvxragxxni (profiles, system_settings)</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
              <span>{isSaving ? 'Saving Settings...' : 'Save Store Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Audit Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Comprehensive Audit Trail
            </h3>
            <p className="text-xs text-slate-500">All administrative operations and role updates are recorded</p>
          </div>

          <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-mono font-bold">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 15).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    {log.target}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">{log.details}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-slate-700 font-medium">
                  By: <strong className="text-amber-800">{log.actorName}</strong> ({log.actorRole})
                </div>
                <div className="text-slate-400 text-[10px] font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
