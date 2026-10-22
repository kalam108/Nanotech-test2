import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderTrackingModal } from './OrderTrackingModal';
import { ReviewModal } from '../reviews/ReviewModal';
import { Order } from '../../types';
import { PackageCheck, Truck, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';

export function UserOrdersPage() {
  const { orders, currentUser, setCurrentView, formatPricePrimary, formatPriceSecondary, showDualCurrency } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewProduct, setReviewProduct] = useState<{ id: string; title: string } | null>(null);

  const myOrders = orders.filter(o => o.buyerId === currentUser.id || o.buyerEmail === currentUser.email);

  return (
    <div className="bg-[#fdfdfd] min-h-[calc(100vh-160px)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-indigo-600" />
            My Orders & Delivery History ({myOrders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track live shipments, view receipts, and submit verified seller reviews</p>
        </div>

      {myOrders.length > 0 ? (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">Order #{order.id}</span>
                  <p className="text-[11px] text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-indigo-600 font-black text-base">{formatPricePrimary(order.total)}</span>
                    {showDualCurrency && (
                      <div className="text-[10px] text-slate-500 font-semibold">
                        ≈ {formatPriceSecondary(order.total)}
                      </div>
                    )}
                  </div>
                  <span className="capitalize text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.productTitle}</h4>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {formatPricePrimary(item.price)}</p>
                      </div>
                    </div>

                    {order.status === 'delivered' && (
                      <button
                        onClick={() => setReviewProduct({ id: item.productId, title: item.productTitle })}
                        className="text-xs text-amber-500 hover:underline font-bold shrink-0 cursor-pointer"
                      >
                        ★ Rate Hardware
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Tracking Number: <strong className="text-indigo-600">{order.trackingNumber}</strong></span>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Track Package →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Purchase History Found</h3>
          <p className="text-xs text-slate-500">You have not placed any hardware orders yet.</p>
          <button
            onClick={() => setCurrentView('products')}
            className="inline-block bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
          >
            Start Shopping Hardware
          </button>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrder && (
        <OrderTrackingModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOpenReview={(id, title) => setReviewProduct({ id, title })}
        />
      )}

      {/* Review Modal */}
      {reviewProduct && (
        <ReviewModal
          productId={reviewProduct.id}
          productTitle={reviewProduct.title}
          isOpen={!!reviewProduct}
          onClose={() => setReviewProduct(null)}
        />
      )}
      </div>
    </div>
  );
}
