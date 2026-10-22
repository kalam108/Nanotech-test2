import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/products/ProductCard';
import { HeroBanner } from '../components/layout/HeroBanner';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onOpenAiAdvisor: () => void;
}

export function HomePage({ onOpenAiAdvisor: _onOpenAiAdvisor }: HomePageProps) {
  const {
    products,
    setCurrentView,
    setFilters,
  } = useApp();

  const featuredProducts = products.filter(p => p.isFeatured || p.isSponsored).slice(0, 4);
  const trendingProducts = products.slice(4, 8);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO CAROUSEL BANNER SECTION ("Build Your Dream PC with Nanotech") */}
      <HeroBanner />

      {/* 2. FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">
                Handpicked Specials
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Featured Products</h2>
          </div>

          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: 'all', condition: 'all' }));
              setCurrentView('products');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRENDING HARDWARE SHOWCASE */}
      <section className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">
                Top Rated Gear
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Trending Components & Rigs</h2>
          </div>

          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: 'all', condition: 'all' }));
              setCurrentView('products');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingProducts.map(product => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

