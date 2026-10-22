import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n/useTranslation';
import { ProductQuickViewModal } from '../common/ProductQuickViewModal';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import { getProductWhatsAppUrl } from '../../data/shopContact';
import {
  Heart,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  Sparkles,
  MapPin,
  Star,
  Eye,
  Scale,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    setSelectedProductId,
    setCurrentView,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    startConversation,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    currency,
  } = useApp();
  const { t, isNepali } = useTranslation();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareList.includes(product.id);

  const getConditionBadgeStyle = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Refurbished':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Used':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getConditionLabel = (condition: string) => {
    if (condition === 'New') return t('conditionNew');
    if (condition === 'Refurbished') return t('conditionRefurbished');
    if (condition === 'Used') return t('conditionUsed');
    return condition;
  };

  const handleGoToDetails = () => {
    setSelectedProductId(product.id);
    setCurrentView('product_detail');
  };

  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="group relative glossy-card glossy-card-hover glossy-glass-shine rounded-2xl flex flex-col overflow-hidden transition-all duration-300">
        {/* Product Image Stage */}
        <div
          className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
          onClick={handleGoToDetails}
        >
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 relative z-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${getConditionBadgeStyle(product.condition)}`}>
              {getConditionLabel(product.condition)}
            </span>
            {product.isSponsored && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#4f46e5] text-white uppercase tracking-wider flex items-center gap-1 shadow-xs backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" /> {isNepali ? 'प्रायोजित' : 'Sponsored'}
              </span>
            )}
          </div>

          {/* Quick Action Floating Buttons (Wishlist, Quick View, Compare) */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                  : 'bg-white/90 text-slate-600 border-white/80 hover:text-rose-600 hover:border-rose-300 hover:bg-white shadow-xs'
              }`}
              title={t('wishlist')}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="p-2 rounded-xl bg-white/90 text-slate-600 border border-white/80 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white backdrop-blur-md transition-all shadow-xs cursor-pointer opacity-90 group-hover:opacity-100"
              title="Quick Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Compare Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                isCompared
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105'
                  : 'bg-white/90 text-slate-600 border-white/80 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white shadow-xs opacity-90 group-hover:opacity-100'
              }`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stock Badge if Low */}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-rose-100/95 backdrop-blur-md text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg shadow-xs">
              {isNepali ? `मात्र ${product.stock} बाँकी` : `Only ${product.stock} left`}
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-transparent">
          <div>
            {/* Brand & Location */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-[#4f46e5] uppercase tracking-wider text-[10px]">{product.brand}</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[90px]">{product.location}</span>
              </span>
            </div>

            {/* Title */}
            <h3
              onClick={handleGoToDetails}
              className="text-sm font-bold text-slate-900 group-hover:text-[#4f46e5] transition-colors line-clamp-2 cursor-pointer leading-snug"
              title={product.title}
            >
              {product.title}
            </h3>

            {/* Seller Tag */}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="truncate max-w-[130px] font-medium text-slate-700">{product.sellerName}</span>
              {product.sellerVerified && (
                <span className="inline-flex items-center text-indigo-600" title="Verified Seller">
                  <CheckCircle className="w-3.5 h-3.5 fill-indigo-100 text-indigo-600" />
                </span>
              )}
              <span className="text-[11px] text-amber-500 font-bold ml-auto flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {product.sellerRating}
              </span>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="pt-3 border-t border-slate-100/80">
            <div className="flex flex-col gap-0.5 mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {formatPricePrimary(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPricePrimary(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent ? (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md ml-auto">
                    -{product.discountPercent}% {isNepali ? 'छुट' : 'OFF'}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Button Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppChat}
                className="bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 flex items-center justify-center gap-1.5 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Chat directly with Shop Owner on WhatsApp (+977 9852055346)"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => addToCart(product, 1)}
                className="glossy-pill-btn text-white flex items-center justify-center gap-1.5 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
