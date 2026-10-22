import React from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { PackageCheck, Truck, CheckCircle2, Clock, X, MapPin, CreditCard, RotateCcw } from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOpenReview?: (productId: string, productTitle: string) => void;
}

export function OrderTrackingModal({ order, isOpen, onClose, onOpenReview }: OrderTrackingModalProps) {
  const { updateOrderStatus, formatPricePrimary, formatPriceSecondary, showDualCurrency } = useApp();

  if (!isOpen) return null;

  const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* Order Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Order #{order.id}</h3>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} • Tracking: <strong className="text-indigo-600">{order.trackingNumber}</strong>
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Delivery Status Timeline</h4>
          <div className="flex items-center justify-between relative">
            {/* Timeline Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

            {statuses.map((st, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={st} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      isCurrent
                        ? 'bg-[#4f46e5] text-white border-indigo-600 ring-4 ring-indigo-500/20'
                        : isDone
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] capitalize font-semibold mt-2 ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ordered Accessories</h4>
          {order.items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{item.productTitle}</h5>
                  <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {formatPricePrimary(item.price)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-indigo-600">{formatPricePrimary(item.price * item.quantity)}</span>
                {order.status === 'delivered' && onOpenReview && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReview(item.productId, item.productTitle);
                    }}
                    className="block text-[10px] text-amber-500 hover:underline font-bold mt-1 cursor-pointer"
                  >
                    ★ Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Address & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
          <div>
            <span className="font-bold text-slate-700 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Shipping Address
            </span>
            <p className="text-slate-900 font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-slate-500">{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
            <p className="text-slate-500">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div>
            <span className="font-bold text-slate-700 flex items-center gap-1 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Payment & Summary
            </span>
            <p className="text-slate-700">Method: <strong className="text-slate-900">{order.paymentMethod}</strong></p>
            <p className="text-slate-700">
              Total Paid: <strong className="text-indigo-600">{formatPricePrimary(order.total)}</strong>
              {showDualCurrency && (
                <span className="text-[10px] text-slate-500 ml-1.5 font-semibold">
                  (≈ {formatPriceSecondary(order.total)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Order Actions */}
        <div className="flex gap-3">
          {order.status === 'pending' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          )}

          {order.status === 'delivered' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'returned')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Request Return
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
