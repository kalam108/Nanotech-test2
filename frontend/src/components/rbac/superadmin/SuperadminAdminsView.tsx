import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Permission, RBACUser } from '../../../types/rbac';
import { ALL_PERMISSIONS } from '../../../data/rbacSeed';
import { UserCheck, Plus, Power, ShieldAlert, Mail, Phone, Lock, Check, X, Shield, AlertTriangle } from 'lucide-react';

export const SuperadminAdminsView: React.FC = () => {
  const { admins, addAdmin, toggleAdminStatus } = useRBAC();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Hardware Logistics');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([
    'products.view',
    'products.create',
    'orders.view',
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const togglePerm = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please provide full name, email address, and temporary password.');
      return;
    }

    const res = await addAdmin({
      name,
      email,
      password,
      phone,
      department,
      permissions: selectedPermissions,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create administrator');
    } else {
      setSuccessMessage(`Administrator "${name}" successfully provisioned by Kalam.`);
      setIsCreateOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSelectedPermissions(['products.view', 'products.create', 'orders.view']);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Administrator Accounts & Authority</h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin master console: Provision, suspend, and configure permission envelopes for staff administrators.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Provision New Admin
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Administrator</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Assigned Permissions</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Master Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {admins.map((adm) => {
                const isActive = adm.status === 'active';
                return (
                  <tr key={adm.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                          {adm.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{adm.name}</div>
                          <div className="text-[11px] text-slate-400">Created: {new Date(adm.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-white font-medium">{adm.email}</div>
                      <div className="text-[11px] text-slate-400">{adm.phone || 'No phone set'}</div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {adm.permissions.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono"
                          >
                            {p}
                          </span>
                        ))}
                        {adm.permissions.length > 3 && (
                          <span className="bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            +{adm.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        {isActive ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleAdminStatus(adm.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          isActive
                            ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                        }`}
                        title={isActive ? 'Disable Admin Account' : 'Reactivate Admin Account'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {isActive ? 'Disable Admin' : 'Activate Admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Admin Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Provision New Administrator</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {errorMessage && (
              <div className="bg-red-950/70 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bijay Adhikari"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email (Admin Login)</label>
                  <input
                    type="email"
                    required
                    placeholder="bijay.admin@nanotech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Granular Permission Checklist */}
              <div>
                <label className="block text-slate-200 font-bold mb-2">
                  Assign Granular Permissions (Authorized by Kalam)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {ALL_PERMISSIONS.filter((p) => !['admins.manage', 'settings.manage'].includes(p.id)).map((p) => {
                    const isChecked = selectedPermissions.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-purple-950/40 border border-purple-800/60' : 'hover:bg-slate-900 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePerm(p.id)}
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="text-white font-semibold text-[11px]">{p.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl"
                >
                  Authorize & Provision Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
