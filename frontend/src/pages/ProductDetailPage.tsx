import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShareModal } from '../components/share/ShareModal';
import { ReportModal } from '../components/reports/ReportModal';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { WhatsAppIcon } from '../components/brand/WhatsAppIcon';
import { getProductWhatsAppUrl, SHOP_OWNER_DISPLAY_PHONE, SHOP_OWNER_PHONE } from '../data/shopContact';
import {
  ShoppingCart,
  MessageSquare,
  Heart,
  Share2,
  ShieldAlert,
  CheckCircle,
  MapPin,
  ChevronLeft,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Scale,
} from 'lucide-react';

export function ProductDetailPage() {
  const {
    selectedProductId,
    products,
    reviews,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    startConversation,
    setCurrentView,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    currency,
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!product) return null;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareList.includes(product.id);

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('products')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors group cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Hardware Catalog</span>
      </button>

      {/* Main Grid: Gallery + Core Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-xs group">
            <img
              src={product.images?.[activeImageIndex] || product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
              }}
            />

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-white/95 text-indigo-700 border border-indigo-200 text-xs font-black px-3.5 py-1 rounded-full shadow-xs">
                {product.condition} Condition
              </span>
              {product.isSponsored && (
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" /> Sponsored
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {(product.images?.length ?? 0) > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 cursor-pointer ${
                    activeImageIndex === idx ? 'border-indigo-600 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="lg:col-span-6 space-y-6 text-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-extrabold text-[#4f46e5] uppercase tracking-wider">{product.brand} • {product.category}</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {product.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.title}</h1>
          </div>

          {/* Pricing Box */}
          <div className="glossy-card p-6 rounded-3xl space-y-4 shadow-sm glossy-glass-shine">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatPricePrimary(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatPricePrimary(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent ? (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    -{product.discountPercent}% OFF
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>Stock: <strong className="text-emerald-700 font-bold">{product.stock} Units Ready to Ship</strong></span>
              <span>•</span>
              <span>Warranty: <strong className="text-slate-700">{product.warranty || '6 Months Nanotech Guarantee'}</strong></span>
            </div>
          </div>

          {/* Core Action CTA Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product, 1)}
                className="glossy-pill-btn text-white text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <a
                href={getProductWhatsAppUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                title="Chat directly with Shop Owner (+977 9852055346)"
              >
                <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                <span>Chat with Owner (9852055346)</span>
              </a>
            </div>

            {/* Supported Nepal Payment Methods Highlight */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100/80 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Supported Payment Channels in Nepal:</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Zero Fee
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-700">
                <span className="px-2 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg shadow-2xs flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-[#60bb46] text-white flex items-center justify-center text-[8px] font-black">e</span>
                  eSewa
                </span>
                <span className="px-2 py-1 bg-white border border-purple-200 text-purple-800 rounded-lg shadow-2xs flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-[#5c2d91] text-white flex items-center justify-center text-[8px] font-black">K</span>
                  Khalti
                </span>
                <span className="px-2 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg shadow-2xs flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white flex items-center justify-center text-[8px] font-black">F</span>
                  Fonepay
                </span>
                <span className="px-2 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg shadow-2xs">
                  🏛️ 20+ Nepal Banks
                </span>
                <span className="px-2 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg shadow-2xs">
                  💳 Debit / Credit Card
                </span>
                <span className="px-2 py-1 bg-white border border-amber-200 text-amber-800 rounded-lg shadow-2xs">
                  🚚 COD
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => toggleCompare(product.id)}
                className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Scale className={`w-4 h-4 ${isCompared ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-3 bg-white hover:bg-rose-50 border border-slate-200 text-rose-500 rounded-xl transition-colors cursor-pointer"
                title="Report Listing"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Seller Profile Box */}
          <div className="bg-white p-5 rounded-2xl space-y-3 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">{product.sellerName}</h3>
                  {product.sellerVerified && <CheckCircle className="w-4 h-4 text-indigo-600 fill-indigo-100" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.sellerRating}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-indigo-600 font-medium">Verified Hardware Reseller</span>
                </p>
              </div>

              <a
                href={getProductWhatsAppUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                title="Direct WhatsApp Chat with Shop Owner (9852055346)"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>WhatsApp Owner</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-black text-lg text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Technical Overview
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Specifications Table */}
        {(product.specifications?.length ?? 0) > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-black text-lg text-slate-900 mb-4">Hardware Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {product.specifications?.map((spec, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-500">{spec.key}</span>
                  <span className="text-slate-900 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900">Verified Customer Reviews</h3>
            <p className="text-xs text-slate-500">{productReviews.length} Ratings & Feedback for this hardware</p>
          </div>

          <button
            onClick={() => setIsReviewOpen(true)}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            + Write Review
          </button>
        </div>

        <div className="space-y-3">
          {productReviews.length > 0 ? (
            productReviews.map(rev => (
              <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.buyerName}</span>
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {rev.rating} / 5
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No reviews submitted yet for this hardware listing.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShareModal product={product} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <ReportModal product={product} isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <ReviewModal productId={product.id} productTitle={product.title} isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </div>
  );
}
