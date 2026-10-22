import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n/useTranslation';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import {
  SHOP_OWNER_PHONE,
  SHOP_OWNER_FULL_PHONE,
  SHOP_OWNER_DISPLAY_PHONE,
  SHOP_OWNER_NAME,
  SHOP_LOCATION,
} from '../../data/shopContact';
import {
  X,
  Send,
  MessageCircle,
  Phone,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Store,
  CheckCircle,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

interface WhatsAppSellerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSellerChatModal: React.FC<WhatsAppSellerChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, selectedProductId, setSelectedProductId } = useApp();
  const { isNepali } = useTranslation();

  const [activeProductId, setActiveProductId] = useState<string | null>(selectedProductId);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Sync active product when modal opens or selectedProductId changes
  useEffect(() => {
    if (isOpen) {
      setActiveProductId(selectedProductId || (products.length > 0 ? products[0].id : null));
    }
  }, [isOpen, selectedProductId, products]);

  const selectedProduct = products.find(p => p.id === activeProductId) || products[0];

  // Official Shop Owner Contact: 9852055346
  const finalPhone = SHOP_OWNER_FULL_PHONE;
  const displayPhone = SHOP_OWNER_DISPLAY_PHONE;

  const [message, setMessage] = useState('');

  // Update default message when active product changes
  useEffect(() => {
    if (selectedProduct) {
      setMessage(
        `Hi NanoTech Shop Owner, I am interested in purchasing "${selectedProduct.title}" (NPR ${selectedProduct.price.toLocaleString()}). Is it available in stock in Itahari right now?`
      );
    } else {
      setMessage(`Hi NanoTech Shop Owner, I have an inquiry regarding hardware parts and availability.`);
    }
  }, [selectedProduct]);

  if (!isOpen) return null;

  const quickQuestions = [
    'Is this item available in stock in Itahari right now?',
    'What is your best final price with Nepal warranty?',
    'Can I arrange same-day delivery or store pickup in Itahari?',
    'Do you support eSewa, Khalti or Fonepay on delivery?',
  ];

  const handleSendWhatsApp = (customMsg?: string) => {
    const textToSend = customMsg || message;
    const encoded = encodeURIComponent(textToSend);
    const waUrl = `https://wa.me/${finalPhone}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(displayPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* WhatsApp Branded Header */}
        <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
              <WhatsAppIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base sm:text-lg leading-tight">
                  {selectedProduct?.sellerName || 'NanoTech Direct Store'}
                </h3>
                <CheckCircle className="w-4 h-4 text-white fill-white/20 shrink-0" />
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                <span>Verified Nepal Seller · Instant Reply</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto bg-slate-50/50">
          {/* Seller Direct Phone Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Shop Owner Direct Contact</span>
                <span className="text-xs font-black text-slate-900">{displayPhone}</span>
              </div>
            </div>
            <button
              onClick={handleCopyPhone}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-emerald-600" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Active Product Highlight Card with Switcher */}
          {selectedProduct && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  Referenced Hardware Listing
                </span>
                {products.length > 1 && (
                  <select
                    value={selectedProduct.id}
                    onChange={(e) => {
                      setActiveProductId(e.target.value);
                      setSelectedProductId(e.target.value);
                    }}
                    className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none"
                  >
                    {products.slice(0, 10).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title.length > 25 ? `${p.title.slice(0, 25)}...` : p.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200'}
                  alt={selectedProduct.title}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedProduct.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-black text-slate-900">
                      NPR {selectedProduct.price.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{selectedProduct.stock} in stock</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Inquiry Prompts */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Quick Questions (Click to Fill):
            </label>
            <div className="space-y-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(q);
                  }}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    message === q
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{q}</span>
                  <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Your Message to Seller:
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the seller..."
              className="w-full text-xs p-3 rounded-2xl bg-white border border-slate-300 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition resize-none text-slate-900"
            />
          </div>

          {/* Direct WhatsApp Call to Action */}
          <button
            type="button"
            onClick={() => handleSendWhatsApp()}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
            <span>Chat on WhatsApp Directly</span>
          </button>

          {/* Seller Verified & Trust Notice */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Storefront</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Itahari, Sunsari, Nepal</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
