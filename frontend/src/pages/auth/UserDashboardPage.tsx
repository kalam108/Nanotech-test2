import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  Package,
  Heart,
  Store,
  MapPin,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  LogOut,
  ShoppingBag,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smile,
  Star,
  XCircle,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Product, Order } from '../../types';

interface UserDashboardPageProps {
  onNavigate?: (view: string) => void;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  itemTitle: string;
  reason: string;
  status: 'Under Review' | 'Approved' | 'Pickup Scheduled' | 'Refunded';
  refundAmount: number;
  refundMethod: string;
  date: string;
}

interface FollowedStore {
  id: string;
  name: string;
  badge: string;
  followers: number;
  rating: number;
  isFollowing: boolean;
  offer: string;
  logoUrl?: string;
}

export function UserDashboardPage({ onNavigate }: UserDashboardPageProps) {
  const {
    currentUser,
    setCurrentUserRole,
    orders,
    wishlist,
    products,
    setCurrentView,
    sellerProfile,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
    addToast,
    customerDashboardTab,
    setCustomerDashboardTab,
    addToCart,
    toggleWishlist,
    addReview,
    reviews: allReviews,
  } = useApp();

  // Active tab state, synced with AppContext's customerDashboardTab
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns' | 'security'>(
    customerDashboardTab || 'profile'
  );

  useEffect(() => {
    if (customerDashboardTab) {
      setActiveTab(customerDashboardTab);
    }
  }, [customerDashboardTab]);

  const handleTabChange = (tab: 'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns' | 'security') => {
    setActiveTab(tab);
    if (setCustomerDashboardTab && tab !== 'security') {
      setCustomerDashboardTab(tab);
    }
  };

  // Editable Profile state
  const [editName, setEditName] = useState(currentUser.name || 'Alex Rivera');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '+977 9812345678');
  const [editAddress, setEditAddress] = useState('Ward-6, Main Road');
  const [editCity, setEditCity] = useState('Itahari, Sunsari, Koshi Province');
  const [editDeliveryNote, setEditDeliveryNote] = useState('Call before courier dispatch');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Orders and Tracking modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Wishlist & Stores sub-tab
  const [wishlistSubTab, setWishlistSubTab] = useState<'items' | 'stores'>('items');
  const [followedStores, setFollowedStores] = useState<FollowedStore[]>([
    {
      id: 'st-1',
      name: 'NanoTech Official Flagship Store',
      badge: 'Verified Official Hub',
      followers: 1240,
      rating: 4.9,
      isFollowing: true,
      offer: 'Free Courier Delivery on orders above NPR 25,000',
    },
    {
      id: 'st-2',
      name: 'ASUS ROG Nepal Experience Center',
      badge: 'Authorized Distributor',
      followers: 980,
      rating: 4.8,
      isFollowing: true,
      offer: 'Extra 3-Year Official Nepal Local Warranty',
    },
    {
      id: 'st-3',
      name: 'MSI Gaming Hub Biratnagar',
      badge: 'Certified Partner',
      followers: 840,
      rating: 4.9,
      isFollowing: false,
      offer: '5% Instant Cash Voucher on Motherboards',
    },
    {
      id: 'st-4',
      name: 'Kingston Memory Official Nepal',
      badge: 'Official Flagship',
      followers: 430,
      rating: 4.9,
      isFollowing: false,
      offer: 'Genuine Hologram Sticker Verified Parts',
    },
  ]);

  // Review submission state
  const [selectedReviewProductId, setSelectedReviewProductId] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [newReviewTitle, setNewReviewTitle] = useState<string>('');

  // Returns and Cancellations state
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([
    {
      id: 'RET-1082',
      orderId: 'ORD-9021',
      itemTitle: 'MSI MAG B650 TOMAHAWK WIFI Motherboard',
      reason: 'Ordered wrong socket type (requested replacement)',
      status: 'Under Review',
      refundAmount: 50000,
      refundMethod: 'eSewa Wallet (9812345678)',
      date: 'Oct 18, 2026',
    },
    {
      id: 'CAN-8742',
      orderId: 'ORD-8742',
      itemTitle: 'Kingston FURY Beast 32GB DDR5',
      reason: 'Cancelled before dispatch',
      status: 'Refunded',
      refundAmount: 18500,
      refundMethod: 'Khalti ID / Bank Transfer',
      date: 'Aug 19, 2026',
    },
  ]);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('ORD-9021');
  const [returnItemTitle, setReturnItemTitle] = useState('AMD Ryzen 7 7800X3D');
  const [returnReason, setReturnReason] = useState('Hardware Defective / DOA');
  const [returnPayoutMethod, setReturnPayoutMethod] = useState('eSewa');
  const [returnPayoutAccount, setReturnPayoutAccount] = useState('9812345678');

  // Filter orders matching this customer
  const userOrders = orders.filter(
    o => o.buyerId === currentUser.id || o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Reviews by user
  const userReviews = (allReviews || []).filter(
    r => r.buyerId === currentUser.id || r.buyerName?.toLowerCase() === currentUser.name?.toLowerCase()
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = editName;
    currentUser.phone = editPhone;
    try {
      localStorage.setItem('nanotech_current_user', JSON.stringify(currentUser));
      localStorage.setItem('nanotech_user', JSON.stringify(currentUser));
    } catch {
      // ignore
    }
    setIsProfileSaved(true);
    addToast('success', 'Profile and delivery address updated successfully!');
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleToggleStoreFollow = (storeId: string) => {
    setFollowedStores(prev =>
      prev.map(st => {
        if (st.id === storeId) {
          const newFollowing = !st.isFollowing;
          addToast(
            'info',
            newFollowing ? `You are now following ${st.name}` : `Unfollowed ${st.name}`
          );
          return {
            ...st,
            isFollowing: newFollowing,
            followers: newFollowing ? st.followers + 1 : st.followers - 1,
          };
        }
        return st;
      })
    );
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      addToast('warning', 'Please provide a written review comment.');
      return;
    }
    const targetProduct = products.find(p => p.id === selectedReviewProductId) || products[0];
    addReview(targetProduct.id, newRating, newReviewComment);
    addToast('success', `Review submitted for ${targetProduct.title}! Thank you for your feedback.`);
    setNewReviewComment('');
    setNewReviewTitle('');
  };

  const handleSubmitReturnRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ReturnRequest = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: returnOrderId,
      itemTitle: returnItemTitle,
      reason: returnReason,
      status: 'Under Review',
      refundAmount: 68500,
      refundMethod: `${returnPayoutMethod} (${returnPayoutAccount})`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setReturnRequests(prev => [newReq, ...prev]);
    setIsReturnModalOpen(false);
    addToast('success', `Return request #${newReq.id} submitted! Our team will contact you within 24 hours.`);
  };

  const handleLogout = () => {
    setCurrentUserRole('customer');
    try {
      localStorage.removeItem('nanotech_current_user');
      localStorage.removeItem('nanotech_user');
      localStorage.removeItem('nanotech_session_token');
    } catch {
      // ignore
    }
    addToast('info', 'Logged out of account session.');
    setCurrentView('home');
  };

  return (
    <div className="relative min-h-[calc(100vh-160px)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Customer Profile Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.05)] p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            {/* Customer Identity */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0d6e66] to-[#047857] flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md shadow-teal-900/10 shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                    {currentUser.name || 'Store Customer'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0d6e66] border border-teal-200 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#0d6e66]" />
                    Verified Customer
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-600 font-mono">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    {currentUser.email}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    450 NanoPoints
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('products')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                <span>Shop Catalog</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>

          {/* Customer Navigation Tabs (Matches image_833d7959.png functions) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'profile', label: 'Manage My Account', icon: Smile },
                { id: 'orders', label: `My Orders (${userOrders.length})`, icon: Package },
                { id: 'wishlist', label: `My Wishlist & Followed Stores (${wishlistProducts.length})`, icon: Heart },
                { id: 'reviews', label: `My Reviews (${userReviews.length})`, icon: Star },
                { id: 'returns', label: `My Returns & Cancellations (${returnRequests.length})`, icon: XCircle },
                { id: 'security', label: 'Security', icon: ShieldCheck },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#0d6e66] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 bg-white border border-slate-200/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1. MANAGE MY ACCOUNT TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Smile className="w-5 h-5 text-[#0d6e66]" />
                    Manage My Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your profile, primary contact number, and courier shipping addresses in Nepal
                  </p>
                </div>
              </div>

              {isProfileSaved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Changes saved successfully! Your customer details are now up to date.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0d6e66] transition"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email (Account ID)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Nepal)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0d6e66] transition"
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City &amp; Province</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={editCity}
                        onChange={e => setEditCity(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0d6e66] transition"
                        placeholder="e.g. Itahari, Sunsari"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address / Delivery Landmark
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0d6e66] transition"
                    placeholder="Ward number, building name, near landmark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Courier Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={editDeliveryNote}
                    onChange={e => setEditDeliveryNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#0d6e66] transition"
                    placeholder="e.g. Deliver between 10am-4pm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Loyalty & Account Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  NanoTech Member Benefits
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Reward Tier</span>
                    <span className="font-bold text-[#0d6e66]">Silver Club</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Active Orders</span>
                    <span className="font-bold text-slate-900">{userOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Saved Items</span>
                    <span className="font-bold text-slate-900">{wishlistProducts.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Warranty Claims</span>
                    <span className="font-bold text-emerald-600">0 Active Claims</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-6 text-white space-y-3 shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                  Store Customer Helpline
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Need assistance with your components, tracking, or warranty support in Nepal?
                </p>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+977 9812345678 (8 AM – 7 PM)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0d6e66]" />
                  My Orders &amp; Delivery History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track live hardware shipments, courier status, and download invoices
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('products')}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Browse Store Catalog
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 mx-auto flex items-center justify-center text-[#0d6e66]">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Orders Placed Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you purchase PCs, processors, graphics cards, or accessories, your order tracking will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('products')}
                  className="px-5 py-2.5 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Start Shopping →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-teal-200 transition bg-slate-50/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 text-sm">Order #{order.id}</span>
                        <p className="text-[11px] text-slate-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} · Courier: AirCargo Nepal
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="capitalize text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {order.status || 'Processing'}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">
                            {formatPricePrimary(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.productImage || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
                              alt={item.productTitle}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block truncate">{item.productTitle}</span>
                              <span className="text-[11px] text-slate-500">
                                Qty: {item.quantity} × {formatPricePrimary(item.price)}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800 shrink-0">
                            {formatPricePrimary(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Tracking ID: <strong className="font-mono text-slate-800">NT-EXP-{order.id.slice(-4)}-NP</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTrackingOrder(order)}
                          className="px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#0d6e66] font-bold text-xs transition cursor-pointer border border-teal-200"
                        >
                          Track Package
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReturnOrderId(order.id);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer border border-slate-200"
                        >
                          Return / Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MY WISHLIST & FOLLOWED STORES TAB */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#0d6e66]" />
                  My Wishlist &amp; Followed Stores
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved hardware items and followed official brands with member discounts
                </p>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setWishlistSubTab('items')}
                  className={`px-4 py-1.5 rounded-full font-bold transition cursor-pointer ${
                    wishlistSubTab === 'items'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Saved Items ({wishlistProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWishlistSubTab('stores')}
                  className={`px-4 py-1.5 rounded-full font-bold transition cursor-pointer ${
                    wishlistSubTab === 'stores'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Followed Stores ({followedStores.filter(s => s.isFollowing).length})
                </button>
              </div>
            </div>

            {/* Sub-view: Wishlist Items */}
            {wishlistSubTab === 'items' && (
              <>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 mx-auto flex items-center justify-center text-[#0d6e66]">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Your Wishlist is Empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Explore CPUs, GPUs, motherboards, or custom rigs and tap the heart icon to save them.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentView('products')}
                      className="px-5 py-2.5 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map(p => (
                      <div
                        key={p.id}
                        className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3 bg-slate-50/50 hover:border-teal-200 transition"
                      >
                        <div className="flex gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
                            alt={p.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{p.title}</h4>
                            <span className="text-sm font-black text-[#0d6e66] mt-1 block">
                              {formatPricePrimary(p.price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(p, 1);
                              addToast('success', `Added ${p.title} to shopping cart`);
                            }}
                            className="flex-1 py-1.5 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs transition cursor-pointer text-center"
                          >
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(p.id)}
                            className="px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Sub-view: Followed Stores */}
            {wishlistSubTab === 'stores' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followedStores.map(store => (
                  <div
                    key={store.id}
                    className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/60 hover:border-teal-200 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-[#0d6e66] flex items-center justify-center font-black">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{store.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {store.badge} · {store.followers} followers
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStoreFollow(store.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          store.isFollowing
                            ? 'bg-teal-50 text-[#0d6e66] border border-teal-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            : 'bg-[#0d6e66] text-white hover:bg-[#0a5852]'
                        }`}
                      >
                        {store.isFollowing ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{store.offer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. MY REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-[#0d6e66]" />
                My Reviews &amp; Product Ratings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your verified performance ratings and feedback on PC hardware you purchased
              </p>
            </div>

            {/* Write a New Review Card */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Write a Verified Product Review
              </h4>

              <form onSubmit={handleCreateReview} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Purchased Product</label>
                    <select
                      value={selectedReviewProductId}
                      onChange={e => setSelectedReviewProductId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0d6e66]"
                    >
                      {products.slice(0, 8).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating</label>
                    <div className="flex items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{newRating} of 5 Stars</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Detailed Experience</label>
                  <textarea
                    rows={3}
                    value={newReviewComment}
                    onChange={e => setNewReviewComment(e.target.value)}
                    placeholder="Describe thermal performance, frame rates, packaging, and courier delivery experience..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0d6e66]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            </div>

            {/* User Submitted Reviews */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-sm">Past Reviews Submitted by You</h4>
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      AMD Ryzen 7 7800X3D Desktop Processor
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    "Exceptional gaming processor in Nepal! Runs incredibly cool with 240mm AIO, solid 240+ FPS in CS2 and Valorant. AirCargo Nepal delivery in Itahari was swift and safe."
                  </p>
                  <span className="text-[10px] text-slate-400 block font-medium">Reviewed on Sep 14, 2026 · Verified Purchase</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. MY RETURNS & CANCELLATIONS TAB */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-[#0d6e66]" />
                  My Returns &amp; Cancellations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track return items, refund statuses to eSewa / Khalti, and file cancellation requests
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReturnModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Return / Cancellation</span>
              </button>
            </div>

            {/* 7-Day Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-[#0d6e66] shrink-0" />
              <div>
                <span className="font-bold block">7-Day Free Return &amp; Replacement Policy</span>
                <span className="text-[11px] text-teal-800">
                  Defective or wrong items are eligible for doorstep courier pickup and 100% refund across Nepal.
                </span>
              </div>
            </div>

            {/* List of Return Requests */}
            <div className="space-y-3">
              {returnRequests.map(req => (
                <div
                  key={req.id}
                  className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{req.id}</span>
                      <span className="text-slate-500 ml-2">For {req.orderId} · {req.date}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        req.status === 'Refunded'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">{req.itemTitle}</span>
                    <p className="text-slate-600">Reason: {req.reason}</p>
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
                      <span>Refund Destination: <strong className="text-slate-800">{req.refundMethod}</strong></span>
                      <span className="text-slate-900 font-bold">Amount: NPR {req.refundAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Account Security &amp; Login Protection
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">6-Digit Email OTP Verification</span>
                  <p className="text-slate-500 text-[11px]">
                    All sensitive account actions and logins are verified with expiring 6-digit numeric OTP codes sent to your inbox.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Request Return / Order Cancellation</h3>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturnRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Order ID</label>
                <select
                  value={returnOrderId}
                  onChange={e => setReturnOrderId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="ORD-9021">Order #ORD-9021 (AMD Ryzen 7 7800X3D + MSI B650)</option>
                  <option value="ORD-8742">Order #ORD-8742 (Kingston FURY Beast 32GB RAM)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item to Return or Cancel</label>
                <input
                  type="text"
                  value={returnItemTitle}
                  onChange={e => setReturnItemTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Hardware Defective / DOA">Hardware Defective / DOA (Dead on Arrival)</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                  <option value="Packaging Damaged by Courier">Packaging Damaged by Courier</option>
                  <option value="Order Cancelled Before Shipping">Cancel Order Before Shipping</option>
                  <option value="Change of Mind (Sealed Box)">Change of Mind (Sealed &amp; Unopened)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refund Method</label>
                  <select
                    value={returnPayoutMethod}
                    onChange={e => setReturnPayoutMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="eSewa">eSewa Wallet</option>
                    <option value="Khalti">Khalti Wallet</option>
                    <option value="Bank Transfer">Bank Transfer (Nepal)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number / Phone</label>
                  <input
                    type="text"
                    value={returnPayoutAccount}
                    onChange={e => setReturnPayoutAccount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold cursor-pointer"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Tracking Timeline Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tracking Order #{trackingOrder.id}</h3>
                <span className="text-[11px] text-slate-500 font-mono">AirCargo Nepal · NT-EXP-{trackingOrder.id.slice(-4)}-NP</span>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Order Confirmed &amp; Invoiced</span>
                  <span className="text-slate-500 text-[11px]">NanoTech Itahari Warehouse</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Bench Tested &amp; Anti-Static Packaged</span>
                  <span className="text-slate-500 text-[11px]">Quality Inspection Passed</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-teal-800 block">Out for Delivery</span>
                  <span className="text-slate-500 text-[11px]">Handed to Courier Express Driver in Itahari</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
