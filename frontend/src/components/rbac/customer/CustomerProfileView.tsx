import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { User, Phone, MapPin, Mail, Shield, CheckCircle2, Award } from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { currentUser } = useRBAC();
  const [name, setName] = useState(currentUser?.name || 'Sita Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '+977 9812345678');
  const [address, setAddress] = useState('National Galli, Ward-6');
  const [city, setCity] = useState('Itahari, Sunsari');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage delivery address and contact details</p>
      </div>

      {isSaved && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile and delivery address updated successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{currentUser?.email || 'customer@nanotech.com'}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                Customer Account
              </span>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" />
                450 Points
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Account ID)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || 'customer@nanotech.com'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Nepal)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address for Courier Delivery</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
