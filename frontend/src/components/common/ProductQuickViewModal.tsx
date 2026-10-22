import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n/useTranslation';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import { getProductWhatsAppUrl } from '../../data/shopContact';
import {
  X,
  ShoppingCart,
  Heart,
  Scale,
  MessageSquare,
  CheckCircle,
  Sparkles,
  MapPin,
  Star,
  ExternalLink,
  ShieldCheck,
  Check,
  Package,
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    startConversation,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    setSelectedProductId,
    setCurrentView,
  } = useApp();
  const { t, isNepali } = useTranslation();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!isOpen || !product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareList.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  const handleGoToFullDetails = () => {
    setSelectedProductId(product.id);
    setCurrentView('product_detail');
    onClose();
  };

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {product.category || 'Hardware'}
            </span>
            <span className="text-xs font-bold text-slate-500">•</span>
            <span className="text-xs font-bold text-slate-700">{product.brand}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close Quick View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
                  }}
                />

                {/* Condition Badge */}
                <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-xs backdrop-blur-md">
                  {product.condition} Condition
                </span>

                {product.isSponsored && (
                  <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" /> Sponsored
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        activeImageIdx === idx ? 'border-indigo-600 scale-105 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Price Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  {product.title}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{product.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{product.sellerRating}</span>
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">{product.sellerName}</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 space-y-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-900">
                    {formatPricePrimary(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPricePrimary(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercent ? (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md ml-auto">
                      -{product.discountPercent}% OFF
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stock: <strong className="text-slate-800">{product.stock} units</strong> available in Nepal</span>
                </div>
              </div>

              {/* Brief specs / summary */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700 block">Key Specifications:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {product.specifications.slice(0, 4).map((spec, i) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block font-semibold">{spec.key}</span>
                        <span className="font-bold text-slate-800 truncate block text-[11px]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-slate-600">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-black text-slate-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full glossy-pill-btn text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add {quantity} to Cart</span>
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Chat with Shop Owner */}
                <button
                  onClick={() => {
                    window.open(getProductWhatsAppUrl(product), '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-emerald-600/20"
                  title="Direct WhatsApp Chat with Shop Owner (9852055346)"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Chat with Shop Owner directly on WhatsApp (9852055346)</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isWishlisted
                        ? 'bg-rose-50 text-rose-600 border-rose-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => toggleCompare(product.id)}
                    className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isCompared
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title="Compare"
                  >
                    <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => {
                      startConversation(product, `Hello! Is "${product.title}" available in Itahari?`);
                      onClose();
                    }}
                    className="py-2 rounded-xl border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </div>
              </div>

              {/* View Full Page Link */}
              <button
                onClick={handleGoToFullDetails}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-1 cursor-pointer"
              >
                <span>View Full Hardware Page & Specifications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
