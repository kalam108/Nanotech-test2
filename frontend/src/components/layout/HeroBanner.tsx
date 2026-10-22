import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n/useTranslation';
import {
  ChevronLeft,
  ChevronRight,
  Ticket,
  CheckCircle2,
  Box,
  Truck,
  Shield,
  Zap,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export interface BannerSlide {
  id: string;
  brand: string;
  subBrand: string;
  title1: string;
  title1Np?: string;
  title2?: string;
  titleColor?: string;
  subtitle: string;
  subtitleNp?: string;
  buttonText: string;
  buttonTextNp?: string;
  targetView: 'products' | 'pc_builder' | 'compare' | 'price_tracker' | 'stores';
  categoryFilter?: string;
  badge?: {
    type: 'discount' | 'custom' | 'tags';
    discount?: string;
    subtext?: string;
  };
  hasNewTag?: boolean;
  bgStyle: string;
}

export function HeroBanner() {
  const { setCurrentView, setFilters } = useApp();
  const { t, isNepali } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  // 5 exact slides corresponding to user's uploaded banner images
  const slidesData: BannerSlide[] = [
    {
      id: 'slide-gpus-cpus',
      brand: 'NenoTech',
      subBrand: isNepali ? 'कम्प्युटर अनलाइन पसल' : 'computer online shop',
      title1: 'EXTREME POWER UPGRADE',
      title1Np: 'अद्वितीय पावर अपग्रेड',
      subtitle: 'Next-Gen GPUs & CPUs',
      subtitleNp: 'नवीनतम पुस्ताका GPU र CPU हरू',
      buttonText: 'Shop Now',
      buttonTextNp: 'अहिले खरिद गर्नुहोस्',
      targetView: 'products',
      categoryFilter: 'Graphics Cards (GPUs)',
      hasNewTag: true,
      bgStyle:
        'radial-gradient(ellipse at 80% 50%, #7c2d12 0%, #351004 40%, #0d0603 75%, #050302 100%)',
    },
    {
      id: 'slide-keyboards-mice',
      brand: 'NenoTech',
      subBrand: isNepali ? 'कम्प्युटर अनलाइन पसल' : 'computer online shop',
      title1: 'LEVEL UP YOUR CONTROL',
      title1Np: 'गेमिङ नियन्त्रण नयाँ उचाइमा',
      subtitle: 'Mechanical Keyboards & Precision Mice',
      subtitleNp: 'मेकानिकल किबोर्ड र उच्च शुद्धता माउस',
      buttonText: 'Shop Now',
      buttonTextNp: 'अहिले खरिद गर्नुहोस्',
      targetView: 'products',
      categoryFilter: 'Keyboards',
      badge: {
        type: 'discount',
        discount: '50%',
        subtext: 'UP TO',
      },
      bgStyle:
        'radial-gradient(ellipse at 80% 45%, #6b21a8 0%, #3e1272 45%, #220845 80%, #15042d 100%)',
    },
    {
      id: 'slide-monitors',
      brand: 'NenoTech',
      subBrand: isNepali ? 'कम्प्युटर अनलाइन पसल' : 'computer online shop',
      title1: 'CRYSTAL CLEAR VIEWS',
      title1Np: 'अत्यन्तै स्पष्ट डिस्प्ले',
      subtitle: 'Gaming & Professional Monitors',
      subtitleNp: 'गेमिङ तथा व्यावसायिक मनिटरहरू',
      buttonText: 'Shop Now',
      buttonTextNp: 'अहिले खरिद गर्नुहोस्',
      targetView: 'products',
      categoryFilter: 'Monitors',
      badge: {
        type: 'discount',
        discount: '50%',
        subtext: 'UP TO',
      },
      bgStyle:
        'radial-gradient(ellipse at 75% 50%, #581c87 0%, #370d66 45%, #1f063d 85%, #130328 100%)',
    },
    {
      id: 'slide-dream-rig',
      brand: 'NenoTech',
      subBrand: isNepali ? 'कम्प्युटर अनलाइन पसल' : 'computer online shop',
      title1: 'BUILD YOUR DREAM RIG',
      title1Np: 'आफ्नो सपनाको कम्प्युटर निर्माण गर्नुहोस्',
      subtitle: 'Expert Assembled • 1 Year Warranty',
      subtitleNp: 'विशेषज्ञद्वारा एसेम्बल • १ वर्षको वारेन्टी',
      buttonText: 'Configure Now',
      buttonTextNp: 'अहिले बनाउनुहोस्',
      targetView: 'pc_builder',
      categoryFilter: 'Desktop PCs',
      hasNewTag: true,
      bgStyle:
        'radial-gradient(ellipse at 75% 50%, #0f524e 0%, #093937 40%, #042221 75%, #021413 100%)',
    },
    {
      id: 'slide-laptops',
      brand: 'NenoTech Mall',
      subBrand: isNepali ? 'कम्प्युटर अनलाइन पसल' : 'computer online shop',
      title1: 'LAPTOP MEGA SALE',
      title1Np: 'ल्यापटप महासेल',
      subtitle: 'Power & Performance',
      subtitleNp: 'शक्तिशाली कार्यसम्पादन',
      buttonText: 'Shop Now',
      buttonTextNp: 'अहिले खरिद गर्नुहोस्',
      targetView: 'products',
      categoryFilter: 'Laptops',
      badge: {
        type: 'discount',
        discount: '40%',
        subtext: 'UP TO',
      },
      hasNewTag: true,
      bgStyle:
        'linear-gradient(108deg, #0d1224 0%, #0f1630 45%, #1e3a8a 52%, #93c5fd 62%, #bfdbfe 80%, #dbeafe 100%)',
    },
  ];

  // Auto-advance every 6.5s unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const handleNext = () => {
    setDirection('left');
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const handlePrev = () => {
    setDirection('right');
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setDirection(idx > currentSlide ? 'left' : 'right');
    setCurrentSlide(idx);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const current = slidesData[currentSlide];

  const handleCtaClick = () => {
    if (current.targetView === 'pc_builder') {
      setCurrentView('pc_builder');
      return;
    }
    if (current.categoryFilter) {
      setFilters((prev) => ({
        ...prev,
        category: current.categoryFilter || 'all',
        condition: 'all',
      }));
    }
    setCurrentView(current.targetView);
  };

  return (
    <section className="w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-3 select-none">
      {/* 260px Container (Increased by 130 from 130px) */}
      <div
        ref={slideContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[260px] rounded-none overflow-hidden shadow-xl transition-all duration-500 group border border-slate-800/40 flex items-center"
        style={{
          background: current.bgStyle,
          height: '260px',
        }}
      >
        {/* Animated Slide Transition Row */}
        <div
          key={current.id}
          className={`w-full h-full flex items-center justify-between px-3 xs:px-6 sm:px-14 lg:px-20 py-3 relative z-10 transition-all duration-500 ease-out transform ${
            direction === 'left' ? 'animate-slow-slide-left' : 'animate-slow-slide-right'
          }`}
        >
          {/* Left: Brand & Main Title */}
          <div className="flex flex-col justify-center min-w-0 pr-2 xs:pr-4 z-20 space-y-1 sm:space-y-2">
            {/* Brand and Sub-brand */}
            <div className="flex items-center gap-1.5 xs:gap-2 leading-none">
              <span className="text-xs xs:text-sm sm:text-base font-black text-white tracking-tight">
                {current.brand}
              </span>
              <span className="inline-block text-[10px] xs:text-xs sm:text-sm text-slate-300/80 font-medium truncate max-w-[120px] xs:max-w-none">
                • {current.subBrand}
              </span>
            </div>

            {/* Slide Title */}
            <div className="flex flex-col items-start gap-0.5 sm:gap-1">
              <h2
                className={`text-base xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-tight leading-tight ${
                  current.id === 'slide-keyboards-mice' ||
                  current.id === 'slide-monitors' ||
                  current.id === 'slide-dream-rig'
                    ? 'text-orange-500'
                    : 'text-white'
                }`}
              >
                {isNepali && current.title1Np ? current.title1Np : current.title1}
              </h2>

              {current.subtitle && (
                <span className="text-[10px] xs:text-xs sm:text-sm lg:text-base font-semibold text-slate-200/90 tracking-wide line-clamp-1">
                  — {isNepali && current.subtitleNp ? current.subtitleNp : current.subtitle}
                </span>
              )}
            </div>

            {/* Action CTA Button ("Shop Now") positioned left-down with icon inside condenser */}
            <div className="pt-2 sm:pt-3">
              <button
                id={`hero-cta-btn-${current.id}`}
                onClick={handleCtaClick}
                className="px-4 xs:px-6 sm:px-8 py-2 sm:py-2.5 rounded-full bg-[#ff7a00] hover:bg-[#ff8a1a] active:bg-[#e66e00] text-white font-black text-xs xs:text-sm sm:text-base tracking-wide shadow-[0_4px_16px_rgba(255,122,0,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>{isNepali && current.buttonTextNp ? current.buttonTextNp : current.buttonText}</span>
              </button>
            </div>
          </div>

          {/* Right Side: Badges & Product Imagery */}
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-6 flex-shrink-0 z-20">
            {/* Discount / Special Badge - Visible on Mobile & Desktop */}
            {current.badge?.discount && (
              <div className="flex flex-col items-center justify-center w-11 h-11 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl border-2 border-white/20 flex-shrink-0">
                <span className="text-[7px] xs:text-[9px] sm:text-xs font-black uppercase leading-none text-white/90">
                  {isNepali ? 'अधिकतम' : (current.badge.subtext || 'UP TO')}
                </span>
                <span className="text-xs xs:text-base sm:text-2xl font-black leading-none my-0.5">{current.badge.discount}</span>
                <span className="text-[7px] xs:text-[9px] sm:text-xs font-black uppercase leading-none text-white/90">
                  {isNepali ? 'छुट' : 'OFF'}
                </span>
              </div>
            )}

            {current.id === 'slide-keyboards-mice' && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/60 border border-purple-500/80 shadow">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 animate-spin" />
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300">
                  RGB
                </span>
              </div>
            )}

            {current.id === 'slide-monitors' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-white text-slate-900 shadow text-[10px] sm:text-xs font-extrabold text-orange-600">
                <Ticket className="w-3.5 h-3.5 text-orange-500" />
                <span>{isNepali ? 'भाउचर' : 'Vouchers'}</span>
              </div>
            )}

            {/* Product Picture Set Showcase (Natural floating hardware sets, no rigid rectangular boxes) */}
            <div className="flex items-center justify-center h-[125px] xs:h-[165px] sm:h-[215px] w-28 xs:w-40 sm:w-60 lg:w-72 relative shrink-0">
              {current.id === 'slide-gpus-cpus' && (
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-0 bg-radial from-red-500/20 via-amber-500/10 to-transparent blur-xl pointer-events-none" />
                  <div className="relative flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80"
                      alt="RTX GPU Flagship"
                      referrerPolicy="no-referrer"
                      className="h-[105px] xs:h-[145px] sm:h-[195px] w-auto max-w-[180px] xs:max-w-[240px] sm:max-w-[300px] object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Companion Next-Gen Processor Chip */}
                    <img
                      src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300&auto=format&fit=crop&q=80"
                      alt="Processor Chip"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 xs:w-11 xs:h-11 sm:w-14 sm:h-14 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] absolute -bottom-1 -left-2 sm:-left-3 rotate-[8deg] rounded-md"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[8px] xs:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{isNepali ? 'नयाँ' : 'NEW'}</span>
                  </div>
                </div>
              )}

              {current.id === 'slide-keyboards-mice' && (
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-0 bg-radial from-purple-500/25 via-pink-500/10 to-transparent blur-xl pointer-events-none" />
                  <div className="relative flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80"
                      alt="RGB Keyboard"
                      referrerPolicy="no-referrer"
                      className="h-[95px] xs:h-[135px] sm:h-[185px] w-auto max-w-[170px] xs:max-w-[230px] sm:max-w-[280px] object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Companion Wireless Gaming Mouse */}
                    <img
                      src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80"
                      alt="RGB Gaming Mouse"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 xs:w-12 xs:h-12 sm:w-15 sm:h-15 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] absolute -bottom-2 -right-1 sm:-right-3 rotate-[-10deg] rounded-full"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[8px] xs:text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <span>RGB COMBO</span>
                  </div>
                </div>
              )}

              {current.id === 'slide-monitors' && (
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-0 bg-radial from-sky-500/20 via-indigo-500/10 to-transparent blur-xl pointer-events-none" />
                  <div className="relative flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80"
                      alt="Curved Gaming Monitor"
                      referrerPolicy="no-referrer"
                      className="h-[100px] xs:h-[145px] sm:h-[195px] w-auto max-w-[190px] xs:max-w-[260px] sm:max-w-[320px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 text-[8px] xs:text-[10px] font-black text-amber-300 bg-slate-950/85 border border-amber-400/40 px-2 py-0.5 rounded-full shadow-lg">
                    4K 240Hz
                  </span>
                </div>
              )}

              {current.id === 'slide-dream-rig' && (
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-0 bg-radial from-teal-500/25 via-cyan-500/10 to-transparent blur-xl pointer-events-none" />
                  <div className="relative flex items-center justify-center group">
                    <Zap className="w-5 h-5 text-cyan-400 absolute -top-2 -left-2 animate-bounce z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80"
                      alt="Custom Gaming Rig"
                      referrerPolicy="no-referrer"
                      className="h-[105px] xs:h-[150px] sm:h-[200px] w-auto max-w-[170px] xs:max-w-[230px] sm:max-w-[280px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[8px] xs:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{isNepali ? 'नयाँ' : 'NEW'}</span>
                  </div>
                </div>
              )}

              {current.id === 'slide-laptops' && (
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-0 bg-radial from-indigo-500/25 via-purple-500/10 to-transparent blur-xl pointer-events-none" />
                  {/* Laptop Picture Set with Companion Mouse, no box or rectangle borders */}
                  <div className="relative flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80"
                      alt="Gaming Laptop"
                      referrerPolicy="no-referrer"
                      className="h-[105px] xs:h-[150px] sm:h-[195px] w-auto max-w-[190px] xs:max-w-[260px] sm:max-w-[320px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Companion Wireless Gaming Mouse floating beside the laptop */}
                    <img
                      src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80"
                      alt="Companion Mouse"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 xs:w-11 xs:h-11 sm:w-14 sm:h-14 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] absolute -bottom-1 -right-2 sm:-right-3 rotate-[-12deg] rounded-full"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8px] xs:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{isNepali ? 'नयाँ' : 'NEW'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Arrow */}
        <button
          id="hero-slide-prev-btn"
          onClick={handlePrev}
          aria-label="Previous Slide"
          title="Previous Slide"
          className="absolute left-1 xs:left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition active:scale-95 cursor-pointer backdrop-blur-sm shadow-md"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Right Arrow */}
        <button
          id="hero-slide-next-btn"
          onClick={handleNext}
          aria-label="Next Slide"
          title="Next Slide"
          className="absolute right-1 xs:right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition active:scale-95 cursor-pointer backdrop-blur-sm shadow-md"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* 5 Pagination Dots */}
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-30 pointer-events-auto">
          {slidesData.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={s.id}
                id={`hero-pagination-dot-${idx}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                title={`Slide ${idx + 1}: ${s.title1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-6 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                    : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
