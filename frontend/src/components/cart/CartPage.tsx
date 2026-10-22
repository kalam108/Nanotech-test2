import React from 'react';
import { useApp } from '../../context/AppContext';
import { NEPAL_BANKS } from '../../data/nepalBanks';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Wallet,
  CreditCard,
  Truck,
  QrCode,
} from 'lucide-react';

export function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setCurrentView,
    setSelectedProductId,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    openCheckoutModalWithPayment,
  } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 200 || cart.length === 0 ? 0 : 15;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Order Review</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            Shopping Cart ({cart.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Review your selected hardware & computer components before checkout</p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition-colors bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Item List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div
                key={item.product.id}
                className="glossy-card rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
              >
                <div
                  className="flex items-center gap-4 min-w-0 cursor-pointer w-full sm:w-auto"
                  onClick={() => {
                    setSelectedProductId(item.product.id);
                    setCurrentView('product_detail');
                  }}
                >
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
                    }}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      {item.product.condition}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate mt-1.5">
                      {item.product.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Seller: {item.product.sellerName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Control */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-slate-900 px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">
                      {formatPricePrimary(item.product.price * item.quantity)}
                    </div>
                    {showDualCurrency && (
                      <div className="text-[10px] text-indigo-600 font-semibold">
                        ≈ {formatPriceSecondary(item.product.price * item.quantity)}
                      </div>
                    )}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[11px] text-rose-500 hover:underline mt-0.5 font-semibold block ml-auto cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-1">
            <div className="glossy-card rounded-3xl p-6 text-slate-800 space-y-5 sticky top-24 shadow-xs">
              <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3.5">Order Summary</h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Hardware Subtotal</span>
                  <span className="text-slate-900 font-bold">{formatPricePrimary(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Insured Shipping</span>
                  <span className="text-slate-900 font-bold">
                    {deliveryFee === 0 ? <span className="text-emerald-700 font-extrabold">FREE</span> : formatPricePrimary(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Add {formatPricePrimary(200 - subtotal)} more for FREE shipping!
                  </p>
                )}
                <div className="pt-3.5 border-t border-slate-100 flex justify-between items-baseline text-lg font-black text-slate-900">
                  <span>Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#4f46e5]">{formatPricePrimary(total)}</span>
                    {showDualCurrency && (
                      <div className="text-xs text-indigo-600 font-bold">
                        ≈ {formatPriceSecondary(total)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Checkout Button */}
              <button
                onClick={() => openCheckoutModalWithPayment('esewa')}
                className="w-full glossy-pill-btn text-white font-black text-sm py-4 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {/* Express Nepali Payment Gateways */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Express 1-Click Pay:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => openCheckoutModalWithPayment('esewa')}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="w-4 h-4 rounded bg-[#60bb46] text-white flex items-center justify-center text-[9px]">e</span>
                    <span>eSewa</span>
                  </button>

                  <button
                    onClick={() => openCheckoutModalWithPayment('bank_transfer', NEPAL_BANKS[0])}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Banks</span>
                  </button>

                  <button
                    onClick={() => openCheckoutModalWithPayment('khalti')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="w-4 h-4 rounded bg-[#5c2d91] text-white flex items-center justify-center text-[9px]">K</span>
                    <span>Khalti</span>
                  </button>

                  <button
                    onClick={() => openCheckoutModalWithPayment('fonepay')}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-rose-600" />
                    <span>Fonepay</span>
                  </button>

                  <button
                    onClick={() => openCheckoutModalWithPayment('card')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Card</span>
                  </button>

                  <button
                    onClick={() => openCheckoutModalWithPayment('cod')}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>COD</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Protected by Nanotech Buyer Guarantee & 30-Day Policy</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="glossy-card rounded-3xl p-16 text-center text-slate-500 space-y-4 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">Explore verified computer accessories, gaming gear, and pre-owned PC parts.</p>
          <button
            onClick={() => setCurrentView('products')}
            className="glossy-pill-btn text-white text-xs font-black px-7 py-3.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Shopping Hardware</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
