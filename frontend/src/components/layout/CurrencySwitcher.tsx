import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Check, ArrowRightLeft, SlidersHorizontal, Globe } from 'lucide-react';
import { CurrencyCode, LanguageCode } from '../../types';

interface CurrencySwitcherProps {
  variant?: 'compact' | 'expanded' | 'banner';
  className?: string;
}

export function CurrencySwitcher({ variant = 'compact', className = '' }: CurrencySwitcherProps) {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    showDualCurrency,
    setShowDualCurrency,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(false);
  const [customRate, setCustomRate] = useState(exchangeRate.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRateSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
      setEditingRate(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-white hover:text-white/85 font-semibold transition-colors focus:outline-none cursor-pointer"
        title="Language & Currency: English (EN) / NPR"
      >
        <span className="font-bold text-white tracking-wide">{language === 'NP' ? 'ने' : language}</span>
        <span className="font-bold text-white">{currency}</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/90 stroke-[2.2]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 text-slate-800 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-indigo-600" /> Regional Preferences
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{language === 'NP' ? 'ने' : 'EN'} / {currency}</span>
          </div>

          {/* Section 1: Language */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              Language
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  language === 'EN'
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">English</span>
                  <span className="text-[10px] text-indigo-600 font-extrabold">(EN)</span>
                </div>
                {language === 'EN' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('NP')}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  language === 'NP'
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">नेपाली</span>
                  <span className="text-[10px] text-indigo-600 font-extrabold">(ने)</span>
                </div>
                {language === 'NP' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Section 2: Currency Options */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
              <span>Currency</span>
              <span className="text-[10px] text-slate-400 font-normal">1 USD = रु {exchangeRate}</span>
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setCurrency('NPR');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'NPR'
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    Nepali Rupee <span className="text-indigo-600 font-extrabold">(रु NPR)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Official Currency in Nepal</div>
                </div>
                {currency === 'NPR' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    US Dollar <span className="text-indigo-600 font-extrabold">($ USD)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">International Rate</div>
                </div>
                {currency === 'USD' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Dual Currency Display Toggle */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between text-[11px] text-slate-600 cursor-pointer">
              <span>Show dual price (रु + $)</span>
              <input
                type="checkbox"
                checked={showDualCurrency}
                onChange={e => setShowDualCurrency(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </label>
          </div>

          {/* Exchange Rate Summary & Quick Edit */}
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Rate: <strong>1 USD = रु {exchangeRate}</strong></span>
            <button
              type="button"
              onClick={() => setEditingRate(!editingRate)}
              className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <SlidersHorizontal className="w-2.5 h-2.5" /> {editingRate ? 'Close' : 'Adjust'}
            </button>
          </div>

          {editingRate && (
            <form onSubmit={handleRateSave} className="mt-2 flex gap-1.5">
              <input
                type="number"
                step="0.1"
                value={customRate}
                onChange={e => setCustomRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Rate (e.g. 135.5)"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
              >
                Set
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
