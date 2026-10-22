import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Cpu,
  Layers,
  Sparkles,
  Award,
  ThumbsUp,
  ThumbsDown,
  Building2,
} from 'lucide-react';

export function ComparePage() {
  const {
    compareList,
    toggleCompare,
    clearCompare,
    products,
    addToCart,
    openAddToCartModal,
    setCurrentView,
    formatPricePrimary,
    formatPriceSecondary,
    showDualCurrency,
  } = useApp();

  const comparedProducts = products.filter(p => compareList.includes(p.id));

  if (comparedProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
          <Scale className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-2xl font-black text-slate-900">No Products in Comparison</h2>
          <p className="text-sm text-slate-500">
            Add up to 4 laptops, processors, GPUs, or monitors from our catalog to compare Nepal pricing, distributor warranties, and specifications side-by-side.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('products')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <span>Explore Nepal Hardware Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Collect all unique specification keys across compared products
  const allSpecKeys: string[] = Array.from(
    new Set(
      comparedProducts.flatMap(p =>
        p.specifications ? p.specifications.map(s => s.key) : []
      )
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Nepal Hardware Comparison Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Compare Specs & Nepal Pricing ({comparedProducts.length}/4)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('products')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-sm"
          >
            + Add More Items
          </button>
          <button
            onClick={clearCompare}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto pb-6">
        <table className="w-full min-w-[700px] border-collapse text-left bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <thead>
            <tr>
              <th className="p-4 w-48 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                Specification
              </th>
              {comparedProducts.map(product => {
                const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800';
                return (
                  <th
                    key={product.id}
                    className="p-4 min-w-[260px] max-w-[300px] bg-white border-b border-l border-slate-200 align-top"
                  >
                    <div className="space-y-3 relative">
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className="absolute top-0 right-0 p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                        <img
                          src={displayImage}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                          {product.condition}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {product.brand} • {product.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                          {product.title}
                        </h3>
                      </div>

                      <div className="pt-1">
                        <div className="text-lg font-black text-slate-900">
                          {formatPricePrimary(product.price)}
                        </div>
                        {showDualCurrency && (
                          <div className="text-xs font-medium text-slate-500">
                            {formatPriceSecondary(product.price)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => openAddToCartModal(product, 1)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy with eSewa / Bank</span>
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Nepal Distributor */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Official Distributor (Nepal)</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-800 font-semibold">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{p.nepalOfficialDistributor || 'Authorized Nepal Importer'}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Nepal Price Verification */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Price Verification</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Nepal Price
                  </span>
                </td>
              ))}
            </tr>

            {/* Stock Status */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Stock Status</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200">
                  {p.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ({p.stock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Nepal Warranty */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Nepal Official Warranty</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-700">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{p.warranty || '1 Year Official Warranty'}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Best For / Use Cases */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Recommended For</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-700">
                  <div className="flex flex-wrap gap-1">
                    {p.useCases?.map((uc, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                        {uc}
                      </span>
                    )) || <span className="text-slate-500">General Computing & Gaming</span>}
                  </div>
                </td>
              ))}
            </tr>

            {/* Pros */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Key Advantages (Pros)</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-700">
                  <ul className="space-y-1 text-[11px]">
                    {p.pros?.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1 text-emerald-900">
                        <ThumbsUp className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    )) || <li>High reliability & verified performance</li>}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Cons */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50">Things to Note (Cons)</td>
              {comparedProducts.map(p => (
                <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-700">
                  <ul className="space-y-1 text-[11px]">
                    {p.cons?.map((con, i) => (
                      <li key={i} className="flex items-start gap-1 text-rose-900">
                        <ThumbsDown className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    )) || <li>Standard market configuration</li>}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Specs Breakdown */}
            {allSpecKeys.map(specKey => (
              <tr key={specKey}>
                <td className="p-4 font-bold text-slate-700 bg-slate-50 capitalize">
                  {specKey}
                </td>
                {comparedProducts.map(p => {
                  const specVal = p.specifications?.find(s => s.key.toLowerCase() === specKey.toLowerCase())?.value;
                  return (
                    <td key={p.id} className="p-4 bg-white border-l border-slate-200 text-slate-700">
                      {specVal ? (
                        <span className="font-semibold text-slate-900">{specVal}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
