import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { ProductQuickViewModal } from '../../common/ProductQuickViewModal';
import { Product } from '../../../types';
import { WhatsAppIcon } from '../../brand/WhatsAppIcon';
import { getProductWhatsAppUrl } from '../../../data/shopContact';
import {
  Search,
  ShoppingCart,
  Check,
  Star,
  ShieldCheck,
  Eye,
  Heart,
  Scale,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

export const CustomerProductsView: React.FC = () => {
  const { navigate } = useRBAC();
  const {
    products,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    setSelectedProductId,
    setCurrentView,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = [
    { label: 'All Hardware', value: 'all' },
    { label: 'Processors (CPUs)', value: 'cpu' },
    { label: 'Graphics Cards (GPUs)', value: 'gpu' },
    { label: 'Motherboards', value: 'motherboard' },
    { label: 'RAM Memory', value: 'ram' },
    { label: 'SSD & Storage', value: 'storage' },
    { label: 'Laptops', value: 'laptop' },
    { label: 'Desktop PCs', value: 'desktop' },
    { label: 'Monitors', value: 'monitor' },
    { label: 'Keyboards', value: 'keyboard' },
  ];

  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;

    const catKey = selectedCategory.toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const pSub = (p.subcategory || '').toLowerCase();
    const pTitle = (p.title || '').toLowerCase();

    return (
      pCat.includes(catKey) ||
      pSub.includes(catKey) ||
      pTitle.includes(catKey) ||
      (catKey === 'cpu' && (pCat.includes('processor') || pSub.includes('cpu'))) ||
      (catKey === 'gpu' && (pCat.includes('graphics') || pSub.includes('gpu'))) ||
      (catKey === 'storage' && (pCat.includes('ssd') || pSub.includes('ssd') || pSub.includes('hdd'))) ||
      (catKey === 'ram' && (pCat.includes('memory') || pSub.includes('ram')))
    );
  });

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProductId(product.id);
    navigate('/');
    setCurrentView('product_detail');
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Computer Hardware Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Genuine Hardware with Manufacturer Warranty in Nepal ({filteredProducts.length} items available)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search GPUs, CPUs, Laptops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => navigate('/customer/cart')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-md shadow-blue-600/20"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isAdded = !!addedIds[product.id];
            const isWishlisted = wishlist.includes(product.id);
            const isCompared = compareList.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition group shadow-lg"
              >
                {/* Image Stage */}
                <div
                  className="relative h-48 bg-slate-950 flex items-center justify-center p-3 overflow-hidden cursor-pointer"
                  onClick={() => handleViewDetail(product)}
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80'}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-blue-400 border border-slate-700">
                    {product.category}
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`p-1.5 rounded-lg border backdrop-blur-md transition cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-rose-400'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>

                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-blue-400 backdrop-blur-md transition cursor-pointer"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="text-blue-400 font-bold uppercase">{product.brand}</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                        {product.condition}
                      </span>
                    </div>

                    <h3
                      onClick={() => handleViewDetail(product)}
                      className="font-bold text-white text-sm line-clamp-2 mt-1.5 group-hover:text-cyan-400 transition cursor-pointer leading-snug"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official Warranty</span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> {product.sellerRating || 4.9}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-black text-white">
                          {formatPricePrimary(product.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(product.id);
                        }}
                        className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 transition cursor-pointer ${
                          isCompared
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Compare Specifications"
                      >
                        <Scale className="w-3 h-3" />
                        <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleViewDetail(product)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="View Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Details</span>
                      </button>

                      <a
                        href={getProductWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        title="Chat directly with Shop Owner on WhatsApp (9852055346)"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">No hardware matching your search criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

