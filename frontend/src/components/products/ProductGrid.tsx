import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { Pagination } from '../common/Pagination';
import { matchProductToCategory } from '../../data/hardwareTaxonomy';
import {
  Search,
  FilterX,
  Cpu,
  Sparkles,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Check,
  ShieldCheck,
  Zap,
  MessageCircle,
  RotateCcw,
  PackageSearch,
} from 'lucide-react';

export function ProductGrid() {
  const { products, filters, setFilters, resetFilters, setCurrentView } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Read page and pageSize from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const p = urlParams.get('page');
      const size = urlParams.get('pageSize');
      if (p) setCurrentPage(Math.max(1, parseInt(p, 10) || 1));
      if (size) setPageSize(Math.max(4, parseInt(size, 10) || 12));
    }
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchQuery, filters.category, filters.condition, filters.brand, filters.location, filters.maxPrice, filters.sortBy]);

  // Update URL query params when page or pageSize changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', newPage.toString());
      window.history.pushState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('pageSize', newSize.toString());
      url.searchParams.set('page', '1');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Apply filters
  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    if (product.status && product.status !== 'published') return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = (product.title || '').toLowerCase().includes(q);
      const matchBrand = (product.brand || '').toLowerCase().includes(q);
      const matchCategory = (product.category || '').toLowerCase().includes(q);
      const matchDesc = (product.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchCategory && !matchDesc) return false;
    }

    if (filters.category && filters.category !== 'all') {
      if (!matchProductToCategory(product, filters.category)) {
        return false;
      }
    }

    if (filters.condition && filters.condition !== 'all' && (product.condition || '').toLowerCase() !== filters.condition.toLowerCase()) {
      return false;
    }

    if (product.price != null && filters.maxPrice != null && product.price > filters.maxPrice) {
      return false;
    }

    if (filters.brand && filters.brand !== 'all' && (product.brand || '').toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    if (filters.location && filters.location !== 'all' && (product.location || '').toLowerCase() !== filters.location.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'price_low') {
      return a.price - b.price;
    }
    if (filters.sortBy === 'price_high') {
      return b.price - a.price;
    }
    if (filters.sortBy === 'rating') {
      return b.sellerRating - a.sellerRating;
    }
    const aWeight = (a.isSponsored ? 100 : 0) + (a.isFeatured ? 50 : 0);
    const bWeight = (b.isSponsored ? 100 : 0) + (b.isFeatured ? 50 : 0);
    return bWeight - aWeight;
  });

  // Paginated slice
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-6">
      {/* 1. Title, Stats & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            Computer Accessories, Systems & Components
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <span className="font-bold text-slate-900">{sortedProducts.length}</span> verified hardware listings
            {filters.category !== 'all' && <span> in <strong className="text-indigo-600">{filters.category}</strong></span>}
            {filters.condition !== 'all' && <span> ({filters.condition})</span>}
          </p>
        </div>

        {/* View Mode & Secondary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('pc_builder')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Open PC Builder</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View (3 Columns)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'compact' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact View (Dense)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Active Filter Chips Bar */}
      {(filters.category !== 'all' || filters.condition !== 'all' || filters.brand !== 'all' || filters.location !== 'all' || filters.searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs">
          <span className="font-bold text-indigo-950">Active Filters:</span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full font-semibold shadow-2xs">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full font-semibold shadow-2xs">
              Category: {filters.category}
              <button
                onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.condition !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full font-semibold shadow-2xs">
              Condition: {filters.condition}
              <button
                onClick={() => setFilters(prev => ({ ...prev, condition: 'all' }))}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.brand !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full font-semibold shadow-2xs">
              Brand: {filters.brand}
              <button
                onClick={() => setFilters(prev => ({ ...prev, brand: 'all' }))}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.location !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full font-semibold shadow-2xs">
              Region: {filters.location}
              <button
                onClick={() => setFilters(prev => ({ ...prev, location: 'all' }))}
                className="hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-auto cursor-pointer underline underline-offset-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 4. Filters & Products Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>

        {/* Products Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          {paginatedProducts.length > 0 ? (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {paginatedProducts.map(product => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalRecords={sortedProducts.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[12, 24, 36, 48]}
                itemLabel="products"
              />
            </>
          ) : (
            <div className="glossy-card rounded-3xl p-10 sm:p-14 text-center text-slate-500 space-y-4 shadow-xs border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-2xs">
                {filters.category !== 'all' ? (
                  <PackageSearch className="w-8 h-8" />
                ) : (
                  <FilterX className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {filters.category !== 'all'
                    ? `No Products In Stock Under "${filters.category}"`
                    : 'No Matching Hardware Found'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  {filters.category !== 'all'
                    ? `We regularly restock items in "${filters.category}" every Tuesday and Friday at our Itahari store. Contact us directly to reserve or request a custom order!`
                    : "We couldn't find any hardware matching your active filter criteria. Try adjusting your max price or resetting filters."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All Products</span>
                </button>

                {filters.category !== 'all' && (
                  <a
                    href={`https://wa.me/9779852055346?text=${encodeURIComponent(
                      `Hi NanoTech Solutions! I am inquiring about availability or placing a custom order for items in: ${filters.category}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Inquire on WhatsApp (9852055346)</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
