import React from 'react';
import { Product } from '../../types';
import { X, Share2, Copy, Check, MessageCircle, Facebook } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ product, isOpen, onClose }: ShareModalProps) {
  const { addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const currentUrl = `${window.location.origin}/products/${product.id}`;
  const shareText = `Check out this ${product.condition} ${product.title} for $${product.price} on NanoTech Marketplace! ${currentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    addToast('success', 'Product link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/${product.sellerWhatsapp || ''}?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Share Hardware Listing</h3>
            <p className="text-xs text-slate-500">Share with friends or contact seller directly</p>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3 mb-6">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
            alt={product.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
            <span className="text-indigo-600 font-bold text-xs">
              ${(typeof product.price === 'number' ? product.price : 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={handleFacebook}
            className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook Share</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Direct Web Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2.5 flex-1 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
