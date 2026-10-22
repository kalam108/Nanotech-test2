import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Permission } from '../../../types/rbac';
import { ALL_PERMISSIONS } from '../../../data/rbacSeed';
import { KeyRound, Shield, Check, X, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

export const SuperadminPermissionsView: React.FC = () => {
  const { admins, updateAdminPermissions } = useRBAC();
  const [selectedAdminId, setSelectedAdminId] = useState<string>(admins[0]?.id || '');
  const [savedAlert, setSavedAlert] = useState(false);

  const selectedAdmin = admins.find((a) => a.id === selectedAdminId) || admins[0];

  const handleToggle = async (permId: Permission) => {
    if (!selectedAdmin) return;
    const currentPerms = selectedAdmin.permissions || [];
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter((p) => p !== permId)
      : [...currentPerms, permId];

    await updateAdminPermissions(selectedAdmin.id, newPerms);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RBAC Permissions Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure granular access limits per administrator. Changes take effect on the next API call or route transition.
          </p>
        </div>

        {/* Admin Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Configuring:</label>
          <select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {admins.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.name} ({adm.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {savedAlert && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Permissions envelope updated for {selectedAdmin?.name}. Enforced by server security middleware.</span>
        </div>
      )}

      {/* Permissions Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_PERMISSIONS.map((perm) => {
          const isAssigned = selectedAdmin?.permissions.includes(perm.id);
          const isRestrictedRoot = ['admins.manage', 'settings.manage'].includes(perm.id);

          return (
            <div
              key={perm.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                isAssigned
                  ? 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/5'
                  : 'bg-slate-900/60 border-slate-800 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {perm.id}
                  </span>
                  {isRestrictedRoot ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      Superadmin Only
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isAssigned
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                          : 'text-slate-500 bg-slate-950'
                      }`}
                    >
                      {isAssigned ? 'Granted' : 'Revoked'}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">{perm.label}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{perm.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isRestrictedRoot ? 'Exclusive to Kalam' : 'Configurable'}
                </span>

                <button
                  type="button"
                  disabled={isRestrictedRoot}
                  onClick={() => handleToggle(perm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isRestrictedRoot
                      ? 'bg-slate-950 text-slate-600 cursor-not-allowed'
                      : isAssigned
                      ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isRestrictedRoot ? (
                    'Locked'
                  ) : isAssigned ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Revoke
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Grant Permission
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
