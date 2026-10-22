import React, { useState } from 'react';
import { NEPAL_STORES_DIRECTORY } from '../../../data/nepalStoresData';
import { NepalSellerStore } from '../../../types';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  Store,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Star,
  Building2,
  Clock,
} from 'lucide-react';

export function StoresAdminSection() {
  const { logAdminAction } = useAdmin();
  const { addToast } = useApp();
  const [stores, setStores] = useState<NepalSellerStore[]>(NEPAL_STORES_DIRECTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<NepalSellerStore | null>(null);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [storeHub, setStoreHub] = useState<NepalSellerStore['hub']>('Putalisadak');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [storeBrands, setStoreBrands] = useState('');
  const [storeWarranty, setStoreWarranty] = useState('');

  const hubs = ['All', 'Itahari', 'Putalisadak', 'New Road', 'Kamaladi', 'Pokhara', 'Chitwan', 'Banepa', 'Biratnagar'];

  const filteredStores = stores.filter((s) => {
    const matchesHub = selectedHub === 'All' || s.hub === selectedHub;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.authorizedBrands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesHub && matchesSearch;
  });

  const handleToggleVerify = (storeId: string) => {
    setStores(
      stores.map((s) => {
        if (s.id === storeId) {
          const newStatus = !s.isAuthorized;
          logAdminAction(
            'Updated Store Verification',
            'seller',
            `Changed verification status of ${s.name} to ${newStatus ? 'Verified' : 'Unverified'}`
          );
          addToast('info', `Store ${s.name} is now ${newStatus ? 'Verified' : 'Unverified'}.`);
          return { ...s, isAuthorized: newStatus };
        }
        return s;
      })
    );
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    if (window.confirm(`Are you sure you want to remove ${storeName}?`)) {
      setStores(stores.filter((s) => s.id !== storeId));
      logAdminAction('Deleted Physical Store', 'seller', `Removed ${storeName} from physical store directory.`);
      addToast('success', `Removed ${storeName} from directory.`);
    }
  };

  const handleAddOrEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeAddress.trim()) return;

    const brandArray = storeBrands
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    if (editingStore) {
      // Edit existing
      setStores(
        stores.map((s) =>
          s.id === editingStore.id
            ? {
                ...s,
                name: storeName.trim(),
                hub: storeHub,
                address: storeAddress.trim(),
                phone: storePhone.trim() || s.phone,
                whatsapp: storeWhatsapp.trim() || s.whatsapp,
                website: storeWebsite.trim() || s.website,
                authorizedBrands: brandArray.length > 0 ? brandArray : s.authorizedBrands,
                warrantyPolicy: storeWarranty.trim() || s.warrantyPolicy,
              }
            : s
        )
      );
      logAdminAction('Updated Store Details', 'seller', `Updated details for store ${storeName}`);
      addToast('success', `Store ${storeName} updated successfully.`);
    } else {
      // Add new
      const newStore: NepalSellerStore = {
        id: `store_${Date.now()}`,
        name: storeName.trim(),
        hub: storeHub,
        address: storeAddress.trim(),
        phone: storePhone.trim() || '+977 1-4245000',
        whatsapp: storeWhatsapp.trim() || '9851000000',
        website: storeWebsite.trim() || 'https://nanotech.com.np',
        isAuthorized: true,
        authorizedBrands: brandArray.length > 0 ? brandArray : ['ASUS', 'Lenovo', 'AMD', 'NVIDIA'],
        rating: 4.8,
        reviewsCount: 12,
        warrantyPolicy: storeWarranty.trim() || 'Official Nepal Distributor Warranty with instant RMA desk support.',
        openingHours: 'Sun - Fri: 10:00 AM - 7:00 PM',
        establishedYear: 2020,
      };
      setStores([newStore, ...stores]);
      logAdminAction('Added Physical Store', 'seller', `Registered new physical store ${storeName}`);
      addToast('success', `Physical store ${storeName} added to directory.`);
    }

    setIsAddModalOpen(false);
    setEditingStore(null);
    setStoreName('');
    setStoreAddress('');
    setStorePhone('');
    setStoreWhatsapp('');
    setStoreWebsite('');
    setStoreBrands('');
    setStoreWarranty('');
  };

  const handleOpenEdit = (store: NepalSellerStore) => {
    setEditingStore(store);
    setStoreName(store.name);
    setStoreHub(store.hub);
    setStoreAddress(store.address);
    setStorePhone(store.phone);
    setStoreWhatsapp(store.whatsapp);
    setStoreWebsite(store.website || '');
    setStoreBrands(store.authorizedBrands.join(', '));
    setStoreWarranty(store.warrantyPolicy || '');
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5" />
              Kathmandu & Nationwide Tech Store Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Physical Tech Stores Management
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
              Manage authorized hardware shops in Putalisadak (Star Mall, Triveni Complex), New Road (CTC Mall), Kamaladi, Pokhara, and regional hubs with direct WhatsApp links and verification badges.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingStore(null);
              setStoreName('');
              setStoreAddress('');
              setStorePhone('');
              setStoreWhatsapp('');
              setStoreWebsite('');
              setStoreBrands('');
              setStoreWarranty('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Physical Store</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Stores</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stores.length} Hubs</div>
          <span className="text-[11px] text-indigo-600 font-medium">Nationwide directory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Putalisadak & New Road</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stores.filter((s) => s.hub === 'Putalisadak' || s.hub === 'New Road').length} Stores
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Kathmandu Tech Core</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Verified Partner Shops</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stores.filter((s) => s.isAuthorized).length} Verified
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Official distributor warranty</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Active WhatsApp Channels</span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stores.filter((s) => s.whatsapp).length} Live</div>
          <span className="text-[11px] text-slate-500 font-medium">Instant quotation desk</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search store name, street, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {hubs.map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedHub === hub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  {store.hub}
                </span>
                <button
                  onClick={() => handleToggleVerify(store.id)}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    store.isAuthorized
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {store.isAuthorized ? 'Verified Partner' : 'Standard Store'}
                </button>
              </div>

              <h3 className="font-black text-slate-900 text-base">{store.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {store.authorizedBrands.slice(0, 4).map((brand) => (
                  <span
                    key={brand}
                    className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded"
                  >
                    {brand}
                  </span>
                ))}
                {store.authorizedBrands.length > 4 && (
                  <span className="text-[10px] text-slate-400 px-1 py-0.5">
                    +{store.authorizedBrands.length - 4} more
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone:
                  </span>
                  <span className="font-bold text-slate-800">{store.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp:
                  </span>
                  <span className="font-bold text-emerald-600">{store.whatsapp}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {store.rating} ({store.reviewsCount} reviews)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(store)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                  title="Edit Store"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id, store.name)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                  title="Delete Store"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              {editingStore ? 'Edit Physical Tech Store' : 'Register New Physical Tech Store'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Provide physical store details in Kathmandu, Pokhara, or nationwide hubs.
            </p>

            <form onSubmit={handleAddOrEditStore} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Store / Shop Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Tech Solutions Star Mall"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hub / City *</label>
                  <select
                    value={storeHub}
                    onChange={(e) => setStoreHub(e.target.value as NepalSellerStore['hub'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Itahari">Itahari</option>
                    <option value="Putalisadak">Putalisadak</option>
                    <option value="New Road">New Road</option>
                    <option value="Kamaladi">Kamaladi</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Banepa">Banepa</option>
                    <option value="Biratnagar">Biratnagar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+977 1-4245678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Physical Address *</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="e.g. Shop 104, Star Mall 1st Floor, Putalisadak, Kathmandu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">WhatsApp Direct (98XXXXXXXX)</label>
                  <input
                    type="text"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="9851098765"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Website (Optional)</label>
                  <input
                    type="url"
                    value={storeWebsite}
                    onChange={(e) => setStoreWebsite(e.target.value)}
                    placeholder="https://apextech.com.np"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Authorized Brands (Comma Separated)</label>
                <input
                  type="text"
                  value={storeBrands}
                  onChange={(e) => setStoreBrands(e.target.value)}
                  placeholder="ASUS, Acer, Lenovo, Corsair, DeepCool"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Warranty & RMA Policy</label>
                <input
                  type="text"
                  value={storeWarranty}
                  onChange={(e) => setStoreWarranty(e.target.value)}
                  placeholder="Official 1-3 year importer warranty with free in-store diagnostics."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingStore ? 'Update Store' : 'Save Store Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoresAdminSection;
