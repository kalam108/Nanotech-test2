import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PromotionType } from '../../types';
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  DollarSign,
  Sparkles,
  Eye,
  MousePointer,
  CheckCircle2,
  X,
  Truck,
  Image as ImageIcon,
  Bot,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function SellerDashboard() {
  const {
    currentUser,
    sellerProfile,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    promotions,
    createPromotion,
    categories,
    addToast,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'promotions' | 'analytics'>('listings');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for New/Edit Product
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Graphics Cards (GPUs)',
    brand: 'NVIDIA',
    condition: 'Refurbished' as Product['condition'],
    price: 499.99,
    originalPrice: 599.99,
    stock: 5,
    description: '',
    warranty: '1 Year Seller Warranty',
    location: 'San Jose, CA',
    deliveryOptions: 'Express Courier & Local Pickup',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'],
  });

  const [generatingAiDesc, setGeneratingAiDesc] = useState(false);

  // Form State for Promotion
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    productId: products[0]?.id || '',
    type: 'homepage_boost' as PromotionType,
    budget: 50,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  // Filter seller specific products & orders
  const sellerId = sellerProfile ? sellerProfile.id : 'seller-1';
  const myProducts = products.filter(p => p.sellerId === sellerId);
  const myOrders = orders.filter(o => o.items.some(i => i.sellerId === sellerId));
  const myPromotions = promotions.filter(p => p.sellerId === sellerId);

  const totalRevenue = myOrders.reduce((sum, o) => sum + o.total, 0);
  const totalViews = myProducts.reduce((sum, p) => sum + p.viewsCount, 0);

  // Analytics graph mock dataset
  const analyticsData = [
    { day: 'Mon', views: 240, clicks: 65, orders: 4 },
    { day: 'Tue', views: 380, clicks: 110, orders: 8 },
    { day: 'Wed', views: 520, clicks: 145, orders: 12 },
    { day: 'Thu', views: 410, clicks: 95, orders: 7 },
    { day: 'Fri', views: 680, clicks: 210, orders: 18 },
    { day: 'Sat', views: 890, clicks: 290, orders: 25 },
    { day: 'Sun', views: 750, clicks: 230, orders: 19 },
  ];

  const handleGenerateAiDescription = async () => {
    if (!productForm.title) {
      addToast('error', 'Please enter a product title first');
      return;
    }

    setGeneratingAiDesc(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productForm.title,
          category: productForm.category,
          condition: productForm.condition,
          brand: productForm.brand,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProductForm(prev => ({ ...prev, description: data.description }));
        addToast('success', 'AI Product description generated!');
      } else {
        setProductForm(prev => ({
          ...prev,
          description: `Pristine ${productForm.condition} ${productForm.title} by ${productForm.brand}. High-performance hardware rigorously tested for peak stability. Includes ${productForm.warranty} and fast insured shipping.`,
        }));
        addToast('info', 'Generated hardware listing copy');
      }
    } catch (e) {
      setProductForm(prev => ({
        ...prev,
        description: `Verified ${productForm.condition} ${productForm.title}. Tested in pristine condition, ideal for high-end workstation or gaming setups.`,
      }));
    } finally {
      setGeneratingAiDesc(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        discountPercent: Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100),
      });
      setEditingProduct(null);
    } else {
      addProduct({
        ...productForm,
        discountPercent: Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100),
      });
    }

    setIsAddProductOpen(false);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    createPromotion(promoForm.productId, promoForm.type, promoForm.budget, promoForm.startDate, promoForm.endDate);
    setIsPromoModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Seller Studio Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{sellerProfile?.storeName || 'Apex Tech Solutions'}</h1>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Location: {sellerProfile?.location || 'San Jose, CA'} • Rating: ★ {sellerProfile?.rating || 4.9} ({sellerProfile?.reviewCount || 128} Reviews)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsAddProductOpen(true);
          }}
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product Listing</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">My Listings</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{myProducts.length} Products</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Sales Revenue</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{formatPricePrimary(totalRevenue)}</span>
          {showDualCurrency && (
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">≈ {formatPriceSecondary(totalRevenue)}</span>
          )}
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Listing Views</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalViews} Views</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Promotions</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{myPromotions.length} Campaigns</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'listings' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Inventory ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Orders & Fulfillment ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'promotions' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Promotions & Boosting ({myPromotions.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Performance Analytics
        </button>
      </div>

      {/* Tab 1: Product Inventory */}
      {activeTab === 'listings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Active Product Inventory</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Views</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-3">
                      <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'} alt={product.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                      <span className="truncate max-w-xs">{product.title}</span>
                    </td>
                    <td className="p-3 text-slate-600">{product.category}</td>
                    <td className="p-3">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-semibold">{product.condition}</span>
                    </td>
                    <td className="p-3 font-bold text-indigo-600">
                      <div>{formatPricePrimary(product.price)}</div>
                      {showDualCurrency && (
                        <div className="text-[10px] text-slate-500 font-normal">≈ {formatPriceSecondary(product.price)}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">{product.stock}</td>
                    <td className="p-3 text-slate-500">{product.viewsCount}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            title: product.title,
                            category: product.category,
                            brand: product.brand,
                            condition: product.condition,
                            price: product.price,
                            originalPrice: product.originalPrice || product.price,
                            stock: product.stock,
                            description: product.description,
                            warranty: product.warranty || '',
                            location: product.location,
                            deliveryOptions: product.deliveryOptions,
                            images: product.images,
                          });
                          setIsAddProductOpen(true);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-xl transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Seller Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900">Buyer Orders to Fulfill</h3>
          <div className="space-y-4">
            {myOrders.map(order => (
              <div key={order.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs border-b border-slate-200 pb-2 gap-2">
                  <span className="font-bold text-slate-900">Order #{order.id}</span>
                  <span className="text-slate-600">Buyer: <strong className="text-slate-900">{order.buyerName}</strong> ({order.buyerEmail})</span>
                  <div className="text-right">
                    <span className="text-indigo-600 font-extrabold text-sm">{formatPricePrimary(order.total)}</span>
                    {showDualCurrency && (
                      <span className="text-[10px] text-slate-500 font-semibold block">≈ {formatPriceSecondary(order.total)}</span>
                    )}
                  </div>
                  <span className="capitalize font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <img src={item.productImage} alt={item.productTitle} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                      <span className="font-bold text-slate-900 truncate flex-1">{item.productTitle}</span>
                      <span className="text-slate-500">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Status Updater */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500">Ship to: {order.shippingAddress.address}, {order.shippingAddress.city}</span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs"
                      >
                        Confirm Order
                      </button>
                    )}
                    {(order.status === 'confirmed' || order.status === 'processing') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Promotions & Boosts */}
      {activeTab === 'promotions' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Promotions & Boost Campaigns</h3>
              <p className="text-xs text-slate-500">Boost product visibility in homepage, category, and search results</p>
            </div>

            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Create Boost Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPromotions.map(promo => (
              <div key={promo.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                <img src={promo.productImage} alt={promo.productTitle} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200" />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200">
                    {promo.type.replace('_', ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{promo.productTitle}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span>Budget: <strong className="text-indigo-600">${promo.budget}</strong></span>
                    <span>Views: <strong className="text-slate-900">{promo.impressions}</strong></span>
                    <span>Clicks: <strong className="text-slate-900">{promo.clicks}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Performance Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900">Weekly Store Traffic & Conversion Chart</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="views" stroke="#4f46e5" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddProductOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-900 text-lg mb-4">
              {editingProduct ? 'Edit Product Listing' : 'List Computer Accessory / Part'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GeForce RTX 4080 Super 16GB OC Edition"
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Condition</label>
                  <select
                    value={productForm.condition}
                    onChange={e => setProductForm({ ...productForm, condition: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-600">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={generatingAiDesc}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{generatingAiDesc ? 'Generating AI Copy...' : 'AI Auto-Generate Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-3 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Product Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Promotion */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative">
            <button onClick={() => setIsPromoModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-900 text-base mb-4">Create Boost Campaign</h3>

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Select Product</label>
                <select
                  value={promoForm.productId}
                  onChange={e => setPromoForm({ ...promoForm, productId: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                >
                  {myProducts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Promotion Type</label>
                <select
                  value={promoForm.type}
                  onChange={e => setPromoForm({ ...promoForm, type: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                >
                  <option value="homepage_boost">Homepage Promotional Banner</option>
                  <option value="featured">Featured Product Carousel</option>
                  <option value="sponsored">Sponsored Badge in Search</option>
                  <option value="category_boost">Category Header Boost</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Budget ($)</label>
                <input
                  type="number"
                  required
                  value={promoForm.budget}
                  onChange={e => setPromoForm({ ...promoForm, budget: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-xs mt-2 cursor-pointer"
              >
                Launch Boost Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
