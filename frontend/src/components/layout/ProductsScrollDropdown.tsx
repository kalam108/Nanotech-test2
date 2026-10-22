import React, { useEffect } from 'react';
import { Product } from '../../types';
import { HARDWARE_TAXONOMY } from '../../data/hardwareTaxonomy';

interface ProductsScrollDropdownProps {
  products?: Product[];
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string;
  onSelectCategory: (category: string) => void;
  onViewAllProducts?: () => void;
  formatPricePrimary?: (usdAmount: number) => string;
}

export function ProductsScrollDropdown({
  isOpen,
  onClose,
  activeCategory = 'all',
  onSelectCategory,
}: ProductsScrollDropdownProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryClick = (catName: string) => {
    onSelectCategory(catName);
    onClose();
  };

  return (
    <div
      className="absolute -left-2 sm:left-0 top-full mt-2 w-64 sm:w-72 z-50 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/90 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 select-none"
      role="region"
      aria-label="Product Categories"
      onClick={e => e.stopPropagation()}
    >
      {/* Vertically scrollable category list */}
      <div
        className="max-h-[360px] overflow-y-auto overscroll-contain px-1.5 space-y-0.5 no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {HARDWARE_TAXONOMY.map(cat => {
          const IconComp = cat.icon;
          const isSelected =
            activeCategory.toLowerCase() === cat.name.toLowerCase() ||
            (activeCategory === 'components' && cat.id === 'components') ||
            (activeCategory === 'laptops' && cat.id === 'laptops_computers');

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer text-left group ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>

              <span className="truncate flex-1 font-medium group-hover:font-semibold">
                {cat.name}
              </span>

              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
