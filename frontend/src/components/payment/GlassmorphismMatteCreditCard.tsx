import React, { useState, useRef } from 'react';
import { Wifi, Sparkles, ShieldCheck, RefreshCw, Eye, EyeOff, Lock } from 'lucide-react';

export interface CardDetails {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  theme?: 'aurora' | 'cyberCyan' | 'solarFlare' | 'emeraldFlux' | 'deepObsidian';
}

interface GlassmorphismMatteCreditCardProps {
  cardDetails?: CardDetails;
  onChange?: (details: CardDetails) => void;
  interactive?: boolean;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
  showControls?: boolean;
}

export function GlassmorphismMatteCreditCard({
  cardDetails = {
    number: '4829 7492 1083 9541',
    holder: 'ALEXANDER VANCE',
    expiry: '08/29',
    cvv: '842',
    theme: 'aurora',
  },
  onChange,
  interactive = true,
  flipped: controlledFlipped,
  onFlip,
  className = '',
  showControls = false,
}: GlassmorphismMatteCreditCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleToggleFlip = () => {
    const next = !isFlipped;
    if (onFlip) onFlip(next);
    else setInternalFlipped(next);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt max 12deg
    const rotateY = ((x - centerX) / centerX) * 14;

    setMousePos({ x, y, rotateX, rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  };

  const currentTheme = cardDetails.theme || 'aurora';

  // Theme palettes with realistic multi-layered liquid gradients
  const themeGradients = {
    aurora: {
      liquid1: 'radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.75) 0%, transparent 60%)',
      liquid2: 'radial-gradient(ellipse at 80% 30%, rgba(168, 85, 247, 0.8) 0%, transparent 65%)',
      liquid3: 'radial-gradient(circle at 40% 90%, rgba(236, 72, 153, 0.7) 0%, transparent 60%)',
      liquid4: 'radial-gradient(circle at 75% 85%, rgba(99, 102, 241, 0.75) 0%, transparent 55%)',
      baseBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.82) 0%, rgba(30, 27, 75, 0.88) 50%, rgba(15, 12, 35, 0.92) 100%)',
      accentGlow: 'rgba(168, 85, 247, 0.4)',
      chipTone: 'gold',
    },
    cyberCyan: {
      liquid1: 'radial-gradient(ellipse at 15% 25%, rgba(6, 182, 212, 0.85) 0%, transparent 60%)',
      liquid2: 'radial-gradient(ellipse at 85% 20%, rgba(59, 130, 246, 0.8) 0%, transparent 60%)',
      liquid3: 'radial-gradient(circle at 50% 85%, rgba(16, 185, 129, 0.65) 0%, transparent 55%)',
      liquid4: 'radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.7) 0%, transparent 50%)',
      baseBg: 'linear-gradient(135deg, rgba(8, 20, 38, 0.85) 0%, rgba(6, 35, 56, 0.88) 50%, rgba(5, 15, 30, 0.92) 100%)',
      accentGlow: 'rgba(6, 182, 212, 0.4)',
      chipTone: 'silver',
    },
    solarFlare: {
      liquid1: 'radial-gradient(ellipse at 20% 25%, rgba(249, 115, 22, 0.8) 0%, transparent 60%)',
      liquid2: 'radial-gradient(ellipse at 80% 20%, rgba(236, 72, 153, 0.8) 0%, transparent 65%)',
      liquid3: 'radial-gradient(circle at 45% 90%, rgba(234, 179, 8, 0.75) 0%, transparent 55%)',
      liquid4: 'radial-gradient(circle at 85% 85%, rgba(225, 29, 72, 0.7) 0%, transparent 55%)',
      baseBg: 'linear-gradient(135deg, rgba(35, 12, 20, 0.85) 0%, rgba(45, 15, 30, 0.88) 50%, rgba(20, 8, 15, 0.92) 100%)',
      accentGlow: 'rgba(249, 115, 22, 0.4)',
      chipTone: 'gold',
    },
    emeraldFlux: {
      liquid1: 'radial-gradient(ellipse at 25% 20%, rgba(16, 185, 129, 0.8) 0%, transparent 60%)',
      liquid2: 'radial-gradient(ellipse at 85% 35%, rgba(6, 182, 212, 0.75) 0%, transparent 60%)',
      liquid3: 'radial-gradient(circle at 35% 85%, rgba(5, 150, 105, 0.7) 0%, transparent 55%)',
      liquid4: 'radial-gradient(circle at 75% 80%, rgba(132, 204, 22, 0.6) 0%, transparent 50%)',
      baseBg: 'linear-gradient(135deg, rgba(6, 30, 22, 0.85) 0%, rgba(4, 25, 25, 0.88) 50%, rgba(4, 18, 14, 0.92) 100%)',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      chipTone: 'gold',
    },
    deepObsidian: {
      liquid1: 'radial-gradient(ellipse at 30% 25%, rgba(148, 163, 184, 0.35) 0%, transparent 60%)',
      liquid2: 'radial-gradient(ellipse at 80% 30%, rgba(99, 102, 241, 0.5) 0%, transparent 60%)',
      liquid3: 'radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.4) 0%, transparent 55%)',
      liquid4: 'radial-gradient(circle at 85% 85%, rgba(216, 180, 254, 0.35) 0%, transparent 50%)',
      baseBg: 'linear-gradient(135deg, rgba(15, 17, 23, 0.9) 0%, rgba(24, 24, 37, 0.92) 50%, rgba(10, 10, 15, 0.95) 100%)',
      accentGlow: 'rgba(148, 163, 184, 0.25)',
      chipTone: 'platinum',
    },
  };

  const palette = themeGradients[currentTheme] || themeGradients.aurora;

  // Format card number with chunks of 4
  const formattedNumber = (cardDetails.number || '•••• •••• •••• ••••')
    .replace(/\s+/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Perspective Canvas */}
      <div
        className="w-full max-w-[380px] sm:max-w-[420px] aspect-[1.586/1] relative cursor-pointer"
        style={{ perspective: '1200px' }}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleFlip}
        title="Click to flip card"
      >
        {/* Card Rotator */}
        <div
          className="w-full h-full relative transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${isHovered ? mousePos.rotateX : 0}deg) rotateY(${
              (isHovered ? mousePos.rotateY : 0) + (isFlipped ? 180 : 0)
            }deg)`,
          }}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] p-6 sm:p-7 overflow-hidden border border-white/25 shadow-2xl backdrop-blur-2xl transition-all duration-300"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: palette.baseBg,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -5px ${palette.accentGlow}`,
            }}
          >
            {/* REALISTIC LIQUID SHAPES (Morphing animated organic layers) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]">
              {/* Liquid Blob 1 - Top Left Floating Fluid */}
              <div
                className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[32px] opacity-75 animate-pulse"
                style={{
                  background: palette.liquid1,
                  animationDuration: '6s',
                }}
              />

              {/* Liquid Blob 2 - Top Right Liquid Flow */}
              <div
                className="absolute -top-8 -right-8 w-60 h-60 rounded-full blur-[35px] opacity-80"
                style={{
                  background: palette.liquid2,
                }}
              />

              {/* Liquid Blob 3 - Bottom Left Radiant Ripple */}
              <div
                className="absolute -bottom-10 left-1/4 w-56 h-56 rounded-full blur-[30px] opacity-70"
                style={{
                  background: palette.liquid3,
                }}
              />

              {/* Liquid Blob 4 - Bottom Right Dynamic Glow */}
              <div
                className="absolute -bottom-8 -right-6 w-52 h-52 rounded-full blur-[28px] opacity-75"
                style={{
                  background: palette.liquid4,
                }}
              />

              {/* Organic Liquid SVG Wave Path (Smooth refractive caustics) */}
              <svg
                className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay pointer-events-none"
                viewBox="0 0 420 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M-20 60 C80 120, 160 20, 260 80 C360 140, 390 40, 440 90 L440 280 L-20 280 Z"
                  fill="url(#liquidGradient1)"
                />
                <path
                  d="M-20 160 C90 100, 180 220, 280 150 C380 80, 410 190, 440 160 L440 280 L-20 280 Z"
                  fill="url(#liquidGradient2)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="liquidGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                  <linearGradient id="liquidGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Ultra-fine Matte Frosted Finish Grain */}
              <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150" />

              {/* Specular Edge Highlight Overlay */}
              <div className="absolute inset-0 rounded-[22px] border border-white/20 bg-gradient-to-tr from-transparent via-white/[0.08] to-white/20 pointer-events-none" />

              {/* Interactive Dynamic Glare Reflection */}
              {isHovered && (
                <div
                  className="absolute w-72 h-72 rounded-full pointer-events-none mix-blend-soft-light transition-opacity duration-200"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 65%)',
                    left: `${mousePos.x - 144}px`,
                    top: `${mousePos.y - 144}px`,
                  }}
                />
              )}
            </div>

            {/* CARD CONTENT LAYER */}
            <div className="relative z-10 h-full flex flex-col justify-between text-white">
              {/* Top Bar: Bank Logo & Contactless */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Glowing Atom / Hardware Nanotech Icon */}
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      NANOTECH
                    </span>
                    <span className="text-[8px] font-bold text-cyan-300 block -mt-0.5 tracking-widest uppercase">
                      PLATINUM
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Wifi className="w-5 h-5 rotate-90 text-white/90 drop-shadow-md" />
                </div>
              </div>

              {/* Middle: EMV Smart Chip */}
              <div className="flex items-center gap-3 my-auto pt-2">
                {/* Realistic Metallic Chip */}
                <div
                  className={`w-11 h-8 rounded-md border border-amber-300/40 p-1 relative shadow-md ${
                    palette.chipTone === 'silver'
                      ? 'bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-300'
                      : palette.chipTone === 'platinum'
                      ? 'bg-gradient-to-tr from-zinc-400 via-zinc-200 to-slate-300'
                      : 'bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-400'
                  }`}
                >
                  <div className="w-full h-full border border-black/20 rounded-[3px] grid grid-cols-3 grid-rows-2 gap-0.5 opacity-60">
                    <div className="border-r border-b border-black/30" />
                    <div className="border-r border-b border-black/30" />
                    <div className="border-b border-black/30" />
                    <div className="border-r border-black/30" />
                    <div className="border-r border-black/30" />
                    <div />
                  </div>
                </div>

                <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase">
                  DEBIT / CREDIT
                </span>
              </div>

              {/* Bottom: Embossed 16-Digit Number & Holder/Expiry */}
              <div className="space-y-2">
                {/* Embossed Card Number */}
                <div
                  className="font-mono text-base sm:text-lg font-bold tracking-[0.18em] text-slate-100 text-shadow drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.4)',
                  }}
                >
                  {formattedNumber || '4829 7492 1083 9541'}
                </div>

                {/* Cardholder Name & Expiry Date & Brand Hologram */}
                <div className="flex items-end justify-between text-[10px] sm:text-xs">
                  <div>
                    <span className="text-[8px] font-semibold uppercase text-white/60 tracking-wider block leading-tight">
                      CARD HOLDER
                    </span>
                    <span className="font-bold tracking-wider text-white uppercase drop-shadow-md">
                      {cardDetails.holder || 'YOUR NAME'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-semibold uppercase text-white/60 tracking-wider block leading-tight">
                      EXPIRES
                    </span>
                    <span className="font-mono font-bold tracking-wider text-white drop-shadow-md">
                      {cardDetails.expiry || 'MM/YY'}
                    </span>
                  </div>

                  {/* Holographic Payment Network Circles (Visa / Mastercard style) */}
                  <div className="flex -space-x-2.5 items-center opacity-95">
                    <div className="w-6 h-6 rounded-full bg-rose-500/85 backdrop-blur-sm border border-white/20 shadow-md" />
                    <div className="w-6 h-6 rounded-full bg-amber-400/85 backdrop-blur-sm border border-white/20 shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] overflow-hidden border border-white/25 shadow-2xl backdrop-blur-2xl transition-all duration-300"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: palette.baseBg,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -5px ${palette.accentGlow}`,
            }}
          >
            {/* Background Liquid mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-10 -right-10 w-60 h-60 rounded-full blur-[30px] opacity-70"
                style={{ background: palette.liquid1 }}
              />
              <div
                className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full blur-[30px] opacity-75"
                style={{ background: palette.liquid2 }}
              />
              <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl" />
            </div>

            {/* Back Elements */}
            <div className="relative z-10 h-full flex flex-col justify-between py-5">
              {/* Magnetic Stripe */}
              <div className="w-full h-11 bg-slate-950/90 border-y border-white/10 shadow-inner flex items-center px-4">
                <span className="text-[8px] font-mono text-white/30 tracking-[0.25em] uppercase">
                  NANOTECH SECURE CHIP STRIPE • ESCROW PROTECTED
                </span>
              </div>

              {/* Signature Strip & CVV Box */}
              <div className="px-6 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Signature line with fine security wave pattern */}
                  <div className="flex-1 h-9 bg-slate-200/90 rounded-md border border-slate-400/40 flex items-center px-3 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
                    <span className="font-serif italic text-xs text-slate-800 tracking-wider">
                      {cardDetails.holder || 'Authorized Signature'}
                    </span>
                  </div>

                  {/* CVV Box */}
                  <div className="w-14 h-9 bg-white rounded-md border border-slate-300 flex items-center justify-center shadow-md">
                    <span className="font-mono font-bold text-xs text-slate-900 tracking-widest">
                      {showCvv ? cardDetails.cvv || '842' : '•••'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] text-white/60 px-1">
                  <span>Authorized Signature Not Valid Unless Signed</span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setShowCvv(!showCvv);
                    }}
                    className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold"
                  >
                    {showCvv ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                    {showCvv ? 'Hide CVV' : 'Reveal CVV'}
                  </button>
                </div>
              </div>

              {/* Bottom Info / Holographic seal */}
              <div className="px-6 flex items-center justify-between text-[8px] text-white/50 border-t border-white/10 pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Escrow Encrypted</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400/30 via-purple-400/30 to-pink-400/30 border border-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Themes (if showControls is true) */}
      {showControls && (
        <div className="w-full max-w-[420px] mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-between gap-2">
          {/* Flip Button */}
          <button
            type="button"
            onClick={handleToggleFlip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold transition-all border border-white/15 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
            <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
          </button>

          {/* Theme Switchers */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Theme:</span>
            {[
              { id: 'aurora', color: 'bg-gradient-to-tr from-cyan-400 to-purple-500', label: 'Aurora' },
              { id: 'cyberCyan', color: 'bg-gradient-to-tr from-cyan-500 to-blue-600', label: 'Cyber Cyan' },
              { id: 'solarFlare', color: 'bg-gradient-to-tr from-amber-500 to-rose-600', label: 'Solar' },
              { id: 'emeraldFlux', color: 'bg-gradient-to-tr from-emerald-400 to-cyan-500', label: 'Emerald' },
              { id: 'deepObsidian', color: 'bg-gradient-to-tr from-slate-600 to-zinc-900', label: 'Obsidian' },
            ].map(thm => (
              <button
                key={thm.id}
                type="button"
                onClick={() => onChange && onChange({ ...cardDetails, theme: thm.id as any })}
                className={`w-5 h-5 rounded-full ${thm.color} border transition-all ${
                  currentTheme === thm.id ? 'scale-125 border-white ring-2 ring-purple-400/50' : 'border-white/30 opacity-70 hover:opacity-100'
                }`}
                title={thm.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
