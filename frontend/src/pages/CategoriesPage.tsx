import React from 'react';
import { useApp } from '../context/AppContext';
import { HARDWARE_TAXONOMY, matchProductToCategory } from '../data/hardwareTaxonomy';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Layers,
} from 'lucide-react';

export function CategoriesPage() {
  const { products, setFilters, setCurrentView } = useApp();

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 space-y-8">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              Master Hardware Directory
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            12 Hardware & Accessory Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse complete computer systems, custom PC components, gaming gear, and enterprise hardware verified in Nepal
          </p>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, category: 'all', condition: 'all' }));
            setCurrentView('products');
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>View All 74+ Products</span>
        </button>
      </div>

      {/* 12 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HARDWARE_TAXONOMY.map(cat => {
          const IconComp = cat.icon;
          const matchingProducts = (products || []).filter(p => matchProductToCategory(p, cat.name));

          return (
            <div
              key={cat.id}
              className="glossy-card glossy-card-hover glossy-glass-shine rounded-3xl p-6 group space-y-4 shadow-xs border border-slate-200/90 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Icon, Number, Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-all shadow-xs ${cat.color}`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 block">
                        Category #{cat.number}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cat.badgeBg}`}>
                    {matchingProducts.length} In Stock
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategories List (All user provided items) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {cat.subcategories.length} Subcategories Included:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, category: sub.name, condition: 'all' }));
                          setCurrentView('products');
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                        title={`Filter by ${sub.name}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: cat.name, condition: 'all' }));
                  setCurrentView('products');
                }}
                className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
              >
                <span>Browse {cat.name} Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
