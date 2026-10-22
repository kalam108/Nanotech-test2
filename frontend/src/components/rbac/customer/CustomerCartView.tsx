import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle } from 'lucide-react';

export const CustomerCartView: React.FC = () => {
  const { navigate, currentUser } = useRBAC();
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 500;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderSuccess(true);
      clearCart();
    }, 1200);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
        <p className="text-xs text-slate-400 mt-2">
          Thank you, {currentUser?.name}. Your order has been placed with NanoTech Solution Itahari. Tracking details have been assigned.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => navigate('/customer/orders')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 rounded-xl transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/customer/products')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-slate-400 mt-1">Review items before placing your order</p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Explore our cutting-edge GPUs, Ryzen/Intel CPUs, and gaming laptops to build your dream rig.
          </p>
          <button
            onClick={() => navigate('/customer/products')}
            className="mt-5 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            Browse Products
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&q=80'}
                    alt={item.product.title}
                    className="w-16 h-16 object-contain rounded-lg bg-slate-950 p-1 border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[10px] text-blue-400 font-semibold uppercase">{item.product.brand}</span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.product.title}</h4>
                    <span className="text-xs font-semibold text-slate-300">
                      NPR {item.product.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Order Summary</h3>

            <div className="space-y-2 text-xs text-slate-300 divide-y divide-slate-800">
              <div className="flex justify-between pt-2">
                <span>Subtotal</span>
                <span className="font-semibold text-white">NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-400">
                  {shipping === 0 ? 'FREE (Over 50k)' : `NPR ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Taxes & VAT</span>
                <span className="text-slate-400">Included (13%)</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black text-white">
                <span>Total Amount</span>
                <span className="text-cyan-400">NPR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official NanoTech Itahari warranty & fast courier delivery across Nepal.</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              {isOrdering ? 'Processing Order...' : 'Place Order Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
