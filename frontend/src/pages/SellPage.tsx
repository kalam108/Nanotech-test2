import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Bot, Sparkles, Image as ImageIcon, MapPin, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProductStatus } from '../types';

export function SellPage() {
  const {
    addProduct,
    categories,
    setCurrentView,
    addToast,
    currency,
    exchangeRate,
  } = useApp();

  const [inputCurrency, setInputCurrency] = useState<'NPR' | 'USD'>(currency);
  const [displayPrice, setDisplayPrice] = useState('299.99');
  const [displayOriginalPrice, setDisplayOriginalPrice] = useState('399.99');

  const [form, setForm] = useState({
    title: '',
    category: 'Graphics Cards (GPUs)',
    brand: 'NVIDIA',
    condition: 'Used' as 'New' | 'Used' | 'Refurbished',
    price: 299.99,
    originalPrice: 399.99,
    stock: 1,
    description: '',
    warranty: '3 Months Seller Warranty',
    location: 'Kathmandu, Nepal',
    deliveryOptions: 'Local Pickup & Courier Delivery',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'],
    status: 'published' as ProductStatus,
    isFeatured: false,
  });

  const [imageUrlInput, setImageUrlInput] = useState(form.images?.[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const handleAiDesc = async () => {
    if (!form.title) {
      addToast('error', 'Enter a product title first!');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, description: data.description }));
        addToast('success', 'AI hardware description created!');
      } else {
        setForm(prev => ({
          ...prev,
          description: `Excellent condition ${form.condition} ${form.title} by ${form.brand}. Fully stress-tested for hardware stability and temperature benchmarks. Comes with ${form.warranty} and quick insured shipping.`,
        }));
      }
    } catch (e) {
      setForm(prev => ({
        ...prev,
        description: `Verified ${form.condition} ${form.title}. Pristine working condition, clean thermals, and original accessories.`,
      }));
    } finally {
      setGeneratingAi(false);
    }
  };

  const handlePriceChange = (valStr: string) => {
    setDisplayPrice(valStr);
    const num = parseFloat(valStr) || 0;
    if (inputCurrency === 'NPR') {
      // Convert NPR to USD base
      setForm(prev => ({ ...prev, price: num / exchangeRate }));
    } else {
      setForm(prev => ({ ...prev, price: num }));
    }
  };

  const handleOriginalPriceChange = (valStr: string) => {
    setDisplayOriginalPrice(valStr);
    const num = parseFloat(valStr) || 0;
    if (inputCurrency === 'NPR') {
      setForm(prev => ({ ...prev, originalPrice: num / exchangeRate }));
    } else {
      setForm(prev => ({ ...prev, originalPrice: num }));
    }
  };

  const handleCurrencyToggle = (newCurr: 'NPR' | 'USD') => {
    if (newCurr === inputCurrency) return;
    setInputCurrency(newCurr);
    if (newCurr === 'NPR') {
      // Switching from USD to NPR display
      const nprPrice = (form.price * exchangeRate).toFixed(0);
      const nprOrig = (form.originalPrice * exchangeRate).toFixed(0);
      setDisplayPrice(nprPrice);
      setDisplayOriginalPrice(nprOrig);
    } else {
      // Switching from NPR to USD display
      setDisplayPrice(form.price.toFixed(2));
      setDisplayOriginalPrice(form.originalPrice.toFixed(2));
    }
  };

  const handlePublishWithStatus = (targetStatus: ProductStatus) => {
    if (!form.title.trim()) {
      addToast('error', 'Please enter a product listing title.');
      return;
    }

    setIsSubmitting(true);
    const finalImages = imageUrlInput.trim() 
      ? [imageUrlInput.trim()] 
      : ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'];

    const newProd = addProduct({
      ...form,
      images: finalImages,
      status: targetStatus,
      discountPercent: form.originalPrice > form.price 
        ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
        : 0,
    });

    setIsSubmitting(false);

    if (targetStatus === 'published') {
      addToast('success', `Product "${newProd.title}" successfully published to Marketplace!`);
      setCurrentView('products');
    } else {
      addToast('info', `Product "${newProd.title}" saved as Draft.`);
      setCurrentView('products');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePublishWithStatus(form.status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="glossy-card rounded-3xl p-6 sm:p-8 shadow-sm glossy-glass-shine">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Hardware Marketplace</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">List Computer Hardware & Accessories</h1>
            <p className="text-xs text-slate-500">Publish verified listings directly to thousands of Nanotech buyers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs">Product Listing Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Corsair Vengeance RGB DDR5 RAM 32GB (2x16GB) 6000MHz CL30"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map(c => <option key={c.id} value={c.name} className="bg-white">{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm({ ...form, condition: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="New" className="bg-white">New (Sealed Box)</option>
                <option value="Used" className="bg-white">Used (Tested Working)</option>
                <option value="Refurbished" className="bg-white">Refurbished Grade A+</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">Brand Manufacturer</label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Currency Choice & Pricing */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs">Set Listing Price Currency</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleCurrencyToggle('NPR')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    inputCurrency === 'NPR' ? 'bg-[#4f46e5] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇳🇵 रु NPR
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyToggle('USD')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    inputCurrency === 'USD' ? 'bg-[#4f46e5] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇺🇸 $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Selling Price ({inputCurrency === 'NPR' ? 'रु NPR' : '$ USD'})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={displayPrice}
                  onChange={e => handlePriceChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Original MSRP ({inputCurrency === 'NPR' ? 'रु NPR' : '$ USD'})
                </label>
                <input
                  type="number"
                  step="any"
                  value={displayOriginalPrice}
                  onChange={e => handleOriginalPriceChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">Stock Units Ready</label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>
            </div>

            {/* Live Dual Currency Conversion Preview */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-indigo-700 font-medium">
              <span>
                Calculated Price: <strong>रु {(form.price * exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })} NPR</strong> ≈ <strong>${form.price.toFixed(2)} USD</strong>
              </span>
              <span className="text-slate-500 text-[10px]">Exchange: 1$ = रु {exchangeRate}</span>
            </div>
          </div>

          {/* Product Image URL & Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Product Image URL</span>
              </label>
              <span className="text-[11px] text-slate-500">Supports direct image links</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
              {imageUrlInput && (
                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 self-center sm:self-auto">
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location, Warranty & Delivery Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-1.5 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Seller Location</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Kathmandu / Lalitpur"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Warranty Coverage</span>
              </label>
              <input
                type="text"
                value={form.warranty}
                onChange={e => setForm({ ...form, warranty: e.target.value })}
                placeholder="e.g. 6 Months Seller Warranty"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 text-xs flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Delivery Option</span>
              </label>
              <input
                type="text"
                value={form.deliveryOptions}
                onChange={e => setForm({ ...form, deliveryOptions: e.target.value })}
                placeholder="e.g. Local Pickup & Courier"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-slate-700 text-xs">Technical Description & Condition Notes</label>
              <button
                type="button"
                onClick={handleAiDesc}
                disabled={generatingAi}
                className="text-[11px] text-indigo-700 font-bold flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>{generatingAi ? 'AI Generating...' : 'Generate AI Copy'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Detail hardware specifications, benchmark thermals, overclocking status, or included power cables..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Publishing Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 text-xs block">Listing Status</span>
                <span className="text-[11px] text-slate-500">
                  Select whether to publish directly to the live marketplace or keep as a draft
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'published' })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    form.status === 'published'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Published (Live)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'draft' })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.status === 'draft'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Draft</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
                <span>Feature this listing on marketplace spotlight</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePublishWithStatus('draft')}
              className="w-full sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-2xl border border-slate-200 transition-all cursor-pointer text-center"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-2/3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing to Marketplace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
