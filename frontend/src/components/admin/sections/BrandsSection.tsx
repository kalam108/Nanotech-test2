import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { NEPAL_BRANDS_DATABASE } from '../../../data/nepalBrandsData';
import {
  Bookmark,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Package,
  Building2,
  ShieldCheck,
  MapPin,
  Star,
} from 'lucide-react';

interface BrandItem {
  id: string;
  name: string;
  logo: string;
  origin: string;
  website: string;
  productCount: number;
  featured: boolean;
  authorizedDistributor?: string;
  warrantyTerms?: string;
}

const INITIAL_BRANDS: BrandItem[] = [
  {
    id: 'b1',
    name: 'ASUS / ROG',
    logo: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&auto=format&fit=crop&q=80',
    origin: 'Taiwan',
    website: 'https://rog.asus.com',
    productCount: 48,
    featured: true,
    authorizedDistributor: 'Nagmani International Pvt. Ltd. (Triveni Complex, Putalisadak)',
    warrantyTerms: '2 Years Global + 1 Year Free Accidental Damage Protection on ROG/TUF',
  },
  {
    id: 'b2',
    name: 'Lenovo',
    logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&auto=format&fit=crop&q=80',
    origin: 'Hong Kong / Global',
    website: 'https://lenovo.com',
    productCount: 42,
    featured: true,
    authorizedDistributor: 'Megatech Trade Group Nepal (Putalisadak & Regional)',
    warrantyTerms: '2 Years Official Warranty on Legion, Yoga, and ThinkPad',
  },
  {
    id: 'b3',
    name: 'Acer',
    logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&auto=format&fit=crop&q=80',
    origin: 'Taiwan',
    website: 'https://acer.com',
    productCount: 38,
    featured: true,
    authorizedDistributor: 'Ocean Computers Pvt. Ltd. (Kamaladi)',
    warrantyTerms: '2 Years Comprehensive Warranty with genuine parts replacement',
  },
  {
    id: 'b4',
    name: 'NVIDIA',
    logo: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100&auto=format&fit=crop&q=80',
    origin: 'USA',
    website: 'https://nvidia.com',
    productCount: 36,
    featured: true,
    authorizedDistributor: 'Official AIB Partners (ASUS, MSI, ZOTAC)',
    warrantyTerms: '3 Years Official Warranty on RTX 4000 Series',
  },
  {
    id: 'b5',
    name: 'AMD',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    origin: 'USA',
    website: 'https://amd.com',
    productCount: 32,
    featured: true,
    authorizedDistributor: 'Authorized Nepal Component Distributors',
    warrantyTerms: '3 Years Warranty on Box Processors (Ryzen 7000/9000)',
  },
  {
    id: 'b6',
    name: 'Corsair',
    logo: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&auto=format&fit=crop&q=80',
    origin: 'USA',
    website: 'https://corsair.com',
    productCount: 52,
    featured: true,
    authorizedDistributor: 'Neoteric Nepal Pvt. Ltd.',
    warrantyTerms: '5 - 10 Years Warranty on PSUs, Lifetime on DRAM',
  },
  {
    id: 'b7',
    name: 'Apple',
    logo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&auto=format&fit=crop&q=80',
    origin: 'USA',
    website: 'https://apple.com',
    productCount: 26,
    featured: true,
    authorizedDistributor: 'Generation Next Communications (GenNext)',
    warrantyTerms: '1 Year Apple International Warranty (MDAC/VAT Bill verified)',
  },
];

export function BrandsSection() {
  const { logAdminAction } = useAdmin();
  const { addToast } = useApp();
  const [brands, setBrands] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandOrigin, setNewBrandOrigin] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [newDistributor, setNewDistributor] = useState('');
  const [newWarranty, setNewWarranty] = useState('');

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.origin.toLowerCase().includes(search.toLowerCase()) ||
    (b.authorizedDistributor && b.authorizedDistributor.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const newBrand: BrandItem = {
      id: `b_${Date.now()}`,
      name: newBrandName.trim(),
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      origin: newBrandOrigin.trim() || 'Global',
      website: newBrandWebsite.trim() || 'https://example.com',
      productCount: 0,
      featured: true,
      authorizedDistributor: newDistributor.trim() || 'Authorized Nepal Importer',
      warrantyTerms: newWarranty.trim() || 'Official Nepal Warranty Policy',
    };

    setBrands([newBrand, ...brands]);
    setIsAddModalOpen(false);
    setNewBrandName('');
    setNewBrandOrigin('');
    setNewBrandWebsite('');
    setNewDistributor('');
    setNewWarranty('');
    logAdminAction('Added Partner Brand', 'brand', `Created brand entry for ${newBrand.name}`);
    addToast('success', `Brand ${newBrand.name} registered successfully.`);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    setBrands(brands.filter((b) => b.id !== id));
    logAdminAction('Deleted Brand', 'brand', `Removed brand entry for ${name}`);
    addToast('info', `Brand ${name} deleted.`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Bookmark className="w-3.5 h-3.5" />
              Nepal Official Hardware Brands & Importers
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hardware Brands & Importers Management
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
              Manage authorized OEMs, Nepal exclusive national distributors (Nagmani, Megatech, Ocean, Neoteric, GenNext), warranty agreements, and official service center directories.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand / Importer</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands, country, distributor..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold self-end sm:self-auto">
          Showing {filteredBrands.length} of {brands.length} Brands
        </span>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{brand.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Origin: {brand.origin}</p>
                  </div>
                </div>

                {brand.featured && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                    Official
                  </span>
                )}
              </div>

              {brand.authorizedDistributor && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{brand.authorizedDistributor}</span>
                  </div>
                  {brand.warrantyTerms && (
                    <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{brand.warrantyTerms}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>{brand.productCount} SKUs</span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDeleteBrand(brand.id, brand.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register Partner Brand & Importer</h3>

            <form onSubmit={handleAddBrand} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Brand / OEM Name *</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. ASUS / DeepCool"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Origin Country</label>
                <input
                  type="text"
                  value={newBrandOrigin}
                  onChange={(e) => setNewBrandOrigin(e.target.value)}
                  placeholder="e.g. Taiwan, USA, Japan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Official Nepal Importer / Distributor</label>
                <input
                  type="text"
                  value={newDistributor}
                  onChange={(e) => setNewDistributor(e.target.value)}
                  placeholder="e.g. Nagmani International Pvt. Ltd."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Warranty & RMA Policy</label>
                <input
                  type="text"
                  value={newWarranty}
                  onChange={(e) => setNewWarranty(e.target.value)}
                  placeholder="e.g. 2-Year Official Importer Warranty"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Official Website</label>
                <input
                  type="url"
                  value={newBrandWebsite}
                  onChange={(e) => setNewBrandWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandsSection;
