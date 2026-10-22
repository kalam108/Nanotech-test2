import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';

export function WishlistPage() {
  const { wishlist, products, setCurrentView } = useApp();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Personal Collection</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-3">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
          Saved Hardware Wishlist ({wishlistedProducts.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Your saved computer accessories, GPUs, and custom rig listings</p>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glossy-card rounded-3xl p-12 text-center text-slate-500 space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the heart button on any graphics card, keyboard, or PC system to save it to your wishlist.
          </p>
          <button
            onClick={() => setCurrentView('products')}
            className="glossy-pill-btn text-white text-xs font-bold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Hardware Catalog</span>
          </button>
        </div>
      )}
    </div>
  );
}
