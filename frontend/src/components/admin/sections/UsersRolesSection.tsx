import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  Shield,
  UserCheck,
  Plus,
  Mail,
  Lock,
  Trash2,
  Edit2,
  CheckCircle2,
  User,
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../../types/admin';

export function UsersRolesSection() {
  const { currentAdmin, adminUsers, logAdminAction } = useAdmin();
  const { addToast } = useApp();

  const [users, setUsers] = useState<AdminUser[]>(
    adminUsers && adminUsers.length > 0
      ? adminUsers
      : [
          {
            id: 'adm_1',
            name: 'Admin User',
            email: 'admin@gmail.com',
            role: 'super_admin',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            lastLogin: 'Just now',
            status: 'active',
            permissions: ['all'],
            createdAt: '2026-01-01',
          },
          {
            id: 'adm_2',
            name: 'John Inventory Lead',
            email: 'john.inventory@gmail.com',
            role: 'manager',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            lastLogin: '2 hours ago',
            status: 'active',
            permissions: ['products', 'orders', 'inventory'],
            createdAt: '2026-02-10',
          },
          {
            id: 'adm_3',
            name: 'Sara Finance Officer',
            email: 'sara.finance@gmail.com',
            role: 'accountant',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            lastLogin: 'Yesterday',
            status: 'active',
            permissions: ['accounting', 'budget', 'excel'],
            createdAt: '2026-03-15',
          },
        ]
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('manager');

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    const newEntry: AdminUser = {
      id: `adm_${Date.now()}`,
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      role: newAdminRole,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      lastLogin: 'Never',
      status: 'active',
      permissions: ['all'],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers([...users, newEntry]);
    setIsAddModalOpen(false);
    setNewAdminName('');
    setNewAdminEmail('');
    logAdminAction('Added Admin User', 'auth', `Created new user ${newEntry.email} with role ${newEntry.role}`);
    addToast('success', `Administrator account ${newEntry.name} created.`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (id === currentAdmin?.id) {
      addToast('error', 'Cannot delete active logged-in super admin account.');
      return;
    }
    setUsers(users.filter((u) => u.id !== id));
    logAdminAction('Deleted Admin User', 'auth', `Removed user ${name}`);
    addToast('info', `Admin user ${name} deleted.`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Admin Users &amp; Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized staff accounts, role permissions, and access privileges.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#FDD835] hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-300"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold capitalize border border-amber-300/60">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{u.lastLogin || 'Recent'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Provision Admin Account</h3>

            <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="alex@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="manager">Manager (Inventory &amp; Orders)</option>
                  <option value="accountant">Accountant (Ledger &amp; Budgets)</option>
                  <option value="content_manager">Content Manager (Storefront &amp; Banners)</option>
                  <option value="super_admin">Super Admin (Full Platform Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FDD835] hover:bg-amber-400 text-slate-950 font-bold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
