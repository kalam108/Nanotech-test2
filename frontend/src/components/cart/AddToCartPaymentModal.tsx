import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { NEPAL_BANKS, NepalBank } from '../../data/nepalBanks';
import { PaymentMethodType } from '../payment/NepalesePaymentGateway';
import {
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
  CreditCard,
  Truck,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface AddToCartPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantity?: number;
  onProceedToCheckout: (method?: PaymentMethodType, bank?: NepalBank) => void;
}

export function AddToCartPaymentModal({
  isOpen,
  onClose,
  product,
  quantity = 1,
  onProceedToCheckout,
}: AddToCartPaymentModalProps) {
  const {
    cart,
    setCurrentView,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    exchangeRate,
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('esewa');
  const [selectedBank, setSelectedBank] = useState<NepalBank>(NEPAL_BANKS[0]);

  if (!isOpen || !product) return null;

  const itemTotalUSD = product.price * quantity;
  const itemTotalNPR = Math.round(itemTotalUSD * exchangeRate);

  const handlePayNow = () => {
    onClose();
    onProceedToCheckout(selectedMethod, selectedBank);
  };

  const handleGoToCart = () => {
    onClose();
    setCurrentView('cart');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto glossy-glass-shine">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Header Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Item Added to Cart</span>
              <Sparkles className="w-3 h-3 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">Ready for Instant Payment?</h3>
          </div>
        </div>

        {/* Added Product Card Summary */}
        <div className="glossy-card rounded-2xl p-4 flex items-center gap-4 border border-slate-200 shadow-xs mb-5">
          <img
            src={product?.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
            alt={product?.title || 'Product'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
            }}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                {product.condition}
              </span>
              <span className="text-[10px] text-slate-500">Qty: {quantity}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
              {product.title}
            </h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-black text-indigo-600">
                {formatPricePrimary(itemTotalUSD)}
              </span>
              {showDualCurrency && (
                <span className="text-[11px] text-slate-500">
                  ≈ {formatPriceSecondary(itemTotalUSD)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instant Payment Method Selector */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Choose Payment Method:
            </label>
            <span className="text-[10px] text-slate-500 font-semibold">Nepal & International</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* eSewa */}
            <div
              onClick={() => setSelectedMethod('esewa')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'esewa'
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50/80 border-[#60bb46] ring-2 ring-[#60bb46]/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-[#60bb46] text-white flex items-center justify-center font-black text-xs">
                  e
                </span>
                {selectedMethod === 'esewa' && <CheckCircle2 className="w-3.5 h-3.5 text-[#60bb46]" />}
              </div>
              <div className="mt-2">
                <div className="text-xs font-black text-slate-900">eSewa</div>
                <div className="text-[9px] text-emerald-700 font-bold">2% Cashback</div>
              </div>
            </div>

            {/* Multiple Banks */}
            <div
              onClick={() => setSelectedMethod('bank_transfer')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'bank_transfer'
                  ? 'bg-gradient-to-br from-indigo-50 to-blue-50/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                {selectedMethod === 'bank_transfer' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <div className="mt-2">
                <div className="text-xs font-black text-slate-900">Bank Transfer</div>
                <div className="text-[9px] text-indigo-700 font-bold">16+ Nepal Banks</div>
              </div>
            </div>

            {/* Khalti */}
            <div
              onClick={() => setSelectedMethod('khalti')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'khalti'
                  ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50/80 border-[#5c2d91] ring-2 ring-[#5c2d91]/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-[#5c2d91] text-white flex items-center justify-center font-black text-xs">
                  K
                </span>
                {selectedMethod === 'khalti' && <CheckCircle2 className="w-3.5 h-3.5 text-[#5c2d91]" />}
              </div>
              <div className="mt-2">
                <div className="text-xs font-black text-slate-900">Khalti</div>
                <div className="text-[9px] text-purple-700 font-bold">Instant Pay</div>
              </div>
            </div>

            {/* Fonepay */}
            <div
              onClick={() => setSelectedMethod('fonepay')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'fonepay'
                  ? 'bg-gradient-to-br from-rose-50 to-red-50/80 border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  FP
                </span>
                {selectedMethod === 'fonepay' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
              </div>
              <div className="mt-2">
                <div className="text-xs font-black text-slate-900">Fonepay QR</div>
                <div className="text-[9px] text-rose-700 font-bold">Mobile Banking</div>
              </div>
            </div>

            {/* Card */}
            <div
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'card'
                  ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-400 ring-2 ring-indigo-500/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${selectedMethod === 'card' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-white'}`}>
                  <CreditCard className="w-3.5 h-3.5" />
                </span>
                {selectedMethod === 'card' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div className="mt-2">
                <div className={`text-xs font-black ${selectedMethod === 'card' ? 'text-white' : 'text-slate-900'}`}>Visa / MC</div>
                <div className={`text-[9px] font-bold ${selectedMethod === 'card' ? 'text-indigo-200' : 'text-slate-500'}`}>Card Online</div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setSelectedMethod('cod')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedMethod === 'cod'
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  <Truck className="w-3.5 h-3.5" />
                </span>
                {selectedMethod === 'cod' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </div>
              <div className="mt-2">
                <div className="text-xs font-black text-slate-900">COD</div>
                <div className="text-[9px] text-amber-700 font-bold">Doorstep Pay</div>
              </div>
            </div>
          </div>

          {/* Quick Info based on selected payment method */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {selectedMethod === 'esewa' && 'Pay directly via eSewa ID 9801234567 or QR Scan with 2% cashback.'}
              {selectedMethod === 'bank_transfer' && 'Transfer through Nabil, NIC Asia, Global IME, Himalayan, Prabhu, or 16+ banks.'}
              {selectedMethod === 'khalti' && 'Direct authorization through Khalti Mobile ID and OTP.'}
              {selectedMethod === 'fonepay' && 'Universal scan from any Nepali mobile banking application.'}
              {selectedMethod === 'card' && 'Encrypted international & domestic Visa/Mastercard processing.'}
              {selectedMethod === 'cod' && 'Pay in cash or mobile QR upon receiving hardware at your doorstep.'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handlePayNow}
            className="w-full glossy-pill-btn text-white text-xs font-bold py-3.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Checkout with {selectedMethod === 'esewa' ? 'eSewa' : selectedMethod === 'bank_transfer' ? 'Bank Transfer' : selectedMethod === 'khalti' ? 'Khalti' : selectedMethod === 'fonepay' ? 'Fonepay' : selectedMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleGoToCart}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Cart ({cart.length})</span>
            </button>

            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
