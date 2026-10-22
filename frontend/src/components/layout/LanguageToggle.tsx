import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface LanguageToggleProps {
  className?: string;
  variant?: 'header' | 'footer' | 'pill' | 'mobile';
  showLabel?: boolean;
}

export function LanguageToggle({
  className = '',
  variant = 'header',
  showLabel = false,
}: LanguageToggleProps) {
  const { language, setLanguage, isNepali, isEnglish } = useTranslation();

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">
            {isNepali ? 'भाषा छनौट (Language)' : 'Language (भाषा)'}
          </span>
        </div>
        <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
          <button
            type="button"
            onClick={() => setLanguage('EN')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isEnglish
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('NP')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isNepali
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ने
          </button>
        </div>
      </div>
    );
  }

  // Header, footer, and pill variant
  const isFooter = variant === 'footer';

  return (
    <div
      className={`inline-flex items-center gap-1 p-0.5 rounded-full backdrop-blur-md shadow-xs transition-all select-none ${
        isFooter
          ? 'bg-slate-200/70 border border-slate-300'
          : 'bg-black/20 hover:bg-black/30 border border-white/25'
      } ${className}`}
      role="group"
      aria-label="Language selection: English or Nepali"
    >
      <button
        type="button"
        onClick={() => setLanguage('EN')}
        className={`h-6 px-2 sm:px-2.5 flex items-center gap-1 text-[11px] sm:text-xs font-black tracking-tight rounded-full transition-all duration-200 cursor-pointer ${
          isEnglish
            ? isFooter
              ? 'bg-white text-slate-900 shadow-xs'
              : 'bg-white text-indigo-900 shadow-xs'
            : isFooter
            ? 'text-slate-600 hover:text-slate-900'
            : 'text-white/80 hover:text-white'
        }`}
        aria-pressed={isEnglish}
        title="Switch to English"
      >
        <span>EN</span>
        {showLabel && <span className="text-[10px] opacity-80 font-normal">English</span>}
      </button>

      <button
        type="button"
        onClick={() => setLanguage('NP')}
        className={`h-6 px-2 sm:px-2.5 flex items-center gap-1 text-[11px] sm:text-xs font-black tracking-tight rounded-full transition-all duration-200 cursor-pointer ${
          isNepali
            ? isFooter
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-amber-400 text-slate-950 shadow-xs'
            : isFooter
            ? 'text-slate-600 hover:text-slate-900'
            : 'text-white/80 hover:text-white'
        }`}
        aria-pressed={isNepali}
        title="Switch to Nepali (ने)"
      >
        <span className="font-extrabold">ने</span>
      </button>
    </div>
  );
}

export default LanguageToggle;
