import React from 'react';

interface NanoTechLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'emblem' | 'horizontal' | 'vertical' | 'badge' | 'compact';
  showSubtitle?: boolean;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function NanoTechLogo({
  size = 'md',
  variant = 'horizontal',
  showSubtitle = true,
  className = '',
  glow = true,
  onClick,
}: NanoTechLogoProps) {
  // Compute pixel dimensions
  let iconHeight = 44;
  let iconWidth = 52;
  if (typeof size === 'number') {
    iconHeight = size;
    iconWidth = size * 1.18;
  } else {
    switch (size) {
      case 'xs':
        iconHeight = 22;
        iconWidth = 26;
        break;
      case 'sm':
        iconHeight = 32;
        iconWidth = 38;
        break;
      case 'md':
        iconHeight = 44;
        iconWidth = 52;
        break;
      case 'lg':
        iconHeight = 58;
        iconWidth = 68;
        break;
      case 'xl':
        iconHeight = 84;
        iconWidth = 100;
        break;
      case '2xl':
        iconHeight = 120;
        iconWidth = 142;
        break;
    }
  }

  // Pure Vector SVG Emblem with the 360° Yellow Corner Radiant Glow
  const EmblemOnlySvg = (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* 360-degree Yellow Radiant Ambient Corner Back-Glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-80 pointer-events-none scale-110"
          style={{
            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.95) 0%, rgba(245, 158, 11, 0.75) 45%, rgba(234, 179, 8, 0.35) 75%, transparent 100%)',
          }}
        />
      )}

      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 shrink-0 select-none ${
          glow
            ? 'filter drop-shadow-[0_0_12px_rgba(250,204,21,0.95)] drop-shadow-[0_0_24px_rgba(245,158,11,0.7)] drop-shadow-[0_0_36px_rgba(234,179,8,0.45)]'
            : ''
        }`}
      >
        <defs>
          {/* 360-Degree Yellow Corner Glow Filter */}
          <filter id="yellowCornerGlow360" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#FACC15" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="0" stdDeviation="28" floodColor="#F59E0B" floodOpacity="0.75" />
            <feDropShadow dx="0" dy="0" stdDeviation="45" floodColor="#EAB308" floodOpacity="0.5" />
          </filter>

          {/* Clip path for the central globe */}
          <clipPath id="globeRoundClip">
            <circle cx="250" cy="180" r="115" />
          </clipPath>

          {/* Vibrant Gradients */}
          <linearGradient id="wingOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>

          <linearGradient id="globeGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00B04F" />
            <stop offset="100%" stopColor="#009240" />
          </linearGradient>

          {/* Yellow Corner Aura Ring */}
          <radialGradient id="yellowCornerAuraRing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FACC15" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 360° Yellow Ambient Halo Behind the entire Emblem */}
        {glow && (
          <ellipse
            cx="250"
            cy="190"
            rx="230"
            ry="170"
            fill="url(#yellowCornerAuraRing)"
            opacity="0.7"
          />
        )}

        {/* ======================================================== */}
        {/* LEFT ORANGE WING (3 Slatted Horizontal Blades)           */}
        {/* ======================================================== */}
        <g id="leftWingGroup">
          {/* Top Blade (Widest) */}
          <polygon
            points="18,102 165,102 165,138 34,138"
            fill="url(#wingOrangeGrad)"
          />
          {/* Middle Blade */}
          <polygon
            points="50,154 165,154 165,190 66,190"
            fill="url(#wingOrangeGrad)"
          />
          {/* Bottom Blade (Tapered base) */}
          <polygon
            points="82,206 200,206 172,246 98,246"
            fill="url(#wingOrangeGrad)"
          />
          {/* Connector flank to globe */}
          <path
            d="M 148 102 L 185 102 C 160 135 152 185 178 246 L 140 246 C 122 195 125 145 148 102 Z"
            fill="url(#wingOrangeGrad)"
          />
        </g>

        {/* ======================================================== */}
        {/* RIGHT ORANGE WING (3 Slatted Horizontal Blades)          */}
        {/* ======================================================== */}
        <g id="rightWingGroup">
          {/* Top Blade (Widest) */}
          <polygon
            points="482,102 335,102 335,138 466,138"
            fill="url(#wingOrangeGrad)"
          />
          {/* Middle Blade */}
          <polygon
            points="450,154 335,154 335,190 434,190"
            fill="url(#wingOrangeGrad)"
          />
          {/* Bottom Blade (Tapered base) */}
          <polygon
            points="418,206 300,206 328,246 402,246"
            fill="url(#wingOrangeGrad)"
          />
          {/* Connector flank to globe */}
          <path
            d="M 352 102 L 315 102 C 340 135 348 185 322 246 L 360 246 C 378 195 375 145 352 102 Z"
            fill="url(#wingOrangeGrad)"
          />
        </g>

        {/* ======================================================== */}
        {/* CENTRAL EMERALD GREEN GLOBE WITH WHITE GRID MESH         */}
        {/* ======================================================== */}
        <g id="centralGlobe">
          {/* Outer Thin White Trim Border */}
          <circle cx="250" cy="180" r="119" fill="#FFFFFF" />

          {/* Solid Green Sphere */}
          <circle cx="250" cy="180" r="115" fill="url(#globeGreenGrad)" />

          {/* Clipped White Grid Network */}
          <g clipPath="url(#globeRoundClip)">
            {/* Center Vertical Meridian Line */}
            <line x1="250" y1="50" x2="250" y2="310" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />

            {/* Center Horizontal Equator Line */}
            <line x1="120" y1="180" x2="380" y2="180" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />

            {/* Inner Longitudinal Curves */}
            <ellipse
              cx="250"
              cy="180"
              rx="76"
              ry="115"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8.5"
            />
            <ellipse
              cx="250"
              cy="180"
              rx="38"
              ry="115"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8.5"
            />

            {/* Latitudinal Upper & Lower Curves */}
            <ellipse
              cx="250"
              cy="125"
              rx="98"
              ry="32"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
            />
            <ellipse
              cx="250"
              cy="235"
              rx="98"
              ry="32"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
            />
          </g>

          {/* White Outer Perimeter Ring */}
          <circle
            cx="250"
            cy="180"
            r="115"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8.5"
          />
        </g>
      </svg>
    </div>
  );

  // Full Standalone Logo (Emblem + "NanoTech" Orange Text with 360° Yellow Glow)
  const FullLogoSvg = (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* 360-degree Yellow Radiant Ambient Corner Back-Glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-3xl blur-lg opacity-85 pointer-events-none scale-105"
          style={{
            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.9) 0%, rgba(245, 158, 11, 0.65) 45%, rgba(234, 179, 8, 0.25) 80%, transparent 100%)',
          }}
        />
      )}

      <svg
        width={typeof size === 'number' ? size * 1.35 : iconWidth * 2.3}
        height={typeof size === 'number' ? size : iconHeight * 1.6}
        viewBox="0 0 540 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 shrink-0 select-none ${
          glow
            ? 'filter drop-shadow-[0_0_14px_rgba(250,204,21,0.95)] drop-shadow-[0_0_28px_rgba(245,158,11,0.7)] drop-shadow-[0_0_42px_rgba(234,179,8,0.4)]'
            : ''
        }`}
      >
        <defs>
          <clipPath id="globeRoundClipFull">
            <circle cx="270" cy="150" r="105" />
          </clipPath>

          <linearGradient id="wingOrangeGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>

          <linearGradient id="globeGreenGradFull" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00B04F" />
            <stop offset="100%" stopColor="#009240" />
          </linearGradient>

          <radialGradient id="yellowCornerAuraRingFull" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FACC15" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 360° Yellow Ambient Halo Behind the entire Logo */}
        {glow && (
          <ellipse
            cx="270"
            cy="220"
            rx="260"
            ry="210"
            fill="url(#yellowCornerAuraRingFull)"
            opacity="0.75"
          />
        )}

        {/* ======================================================== */}
        {/* LEFT ORANGE WING (3 Slatted Horizontal Blades)           */}
        {/* ======================================================== */}
        <g id="leftWingGroupFull">
          <polygon points="30,80 180,80 180,114 46,114" fill="url(#wingOrangeGradFull)" />
          <polygon points="62,130 180,130 180,164 78,164" fill="url(#wingOrangeGradFull)" />
          <polygon points="94,180 215,180 188,220 110,220" fill="url(#wingOrangeGradFull)" />
          <path
            d="M 165 80 L 205 80 C 180 115 172 165 198 220 L 155 220 C 138 172 142 120 165 80 Z"
            fill="url(#wingOrangeGradFull)"
          />
        </g>

        {/* ======================================================== */}
        {/* RIGHT ORANGE WING (3 Slatted Horizontal Blades)          */}
        {/* ======================================================== */}
        <g id="rightWingGroupFull">
          <polygon points="510,80 360,80 360,114 494,114" fill="url(#wingOrangeGradFull)" />
          <polygon points="478,130 360,130 360,164 462,164" fill="url(#wingOrangeGradFull)" />
          <polygon points="446,180 325,180 352,220 430,220" fill="url(#wingOrangeGradFull)" />
          <path
            d="M 375 80 L 335 80 C 360 115 368 165 342 220 L 385 220 C 402 172 398 120 375 80 Z"
            fill="url(#wingOrangeGradFull)"
          />
        </g>

        {/* ======================================================== */}
        {/* CENTRAL EMERALD GREEN GLOBE WITH WHITE GRID MESH         */}
        {/* ======================================================== */}
        <g id="centralGlobeFull">
          <circle cx="270" cy="150" r="109" fill="#FFFFFF" />
          <circle cx="270" cy="150" r="105" fill="url(#globeGreenGradFull)" />

          <g clipPath="url(#globeRoundClipFull)">
            <line x1="270" y1="30" x2="270" y2="270" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <line x1="150" y1="150" x2="390" y2="150" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="270" cy="150" rx="70" ry="105" fill="none" stroke="#FFFFFF" strokeWidth="8" />
            <ellipse cx="270" cy="150" rx="35" ry="105" fill="none" stroke="#FFFFFF" strokeWidth="8" />
            <ellipse cx="270" cy="100" rx="90" ry="28" fill="none" stroke="#FFFFFF" strokeWidth="7.5" />
            <ellipse cx="270" cy="200" rx="90" ry="28" fill="none" stroke="#FFFFFF" strokeWidth="7.5" />
          </g>

          <circle cx="270" cy="150" r="105" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        </g>

        {/* ======================================================== */}
        {/* "NanoTech" BOLD SLANTED ORANGE TYPOGRAPHY                */}
        {/* ======================================================== */}
        <g id="nanoTechText">
          {/* Subtle yellow glow drop shadow for text */}
          <text
            x="270"
            y="360"
            textAnchor="middle"
            fontSize="92"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="-0.02em"
            fill="#FF5500"
          >
            NanoTech
          </text>
        </g>
      </svg>
    </div>
  );

  // Return standalone emblem or badge variant
  if (variant === 'emblem' || variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
        title="NanoTech - Future of Hardware"
      >
        {EmblemOnlySvg}
      </div>
    );
  }

  // Compact variant for small navbars / pills
  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      >
        {EmblemOnlySvg}
        <div className="flex flex-col leading-none">
          <span className="font-black italic tracking-tight text-slate-900 flex items-center text-sm sm:text-base">
            <span className="text-[#FF5500]">Nano</span>
            <span className="text-[#009240]">Tech</span>
          </span>
        </div>
      </div>
    );
  }

  // Vertical layout (e.g. for Login pages or splash screens)
  if (variant === 'vertical') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      >
        <div className="transition-transform duration-300 group-hover:scale-105">
          {FullLogoSvg}
        </div>
        {showSubtitle && (
          <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-slate-500 uppercase -mt-2">
            FUTURE OF HARDWARE & SYSTEMS
          </p>
        )}
      </div>
    );
  }

  // Default 'horizontal' layout (Primary Header & Footer branding)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3.5 ${onClick ? 'cursor-pointer group focus:outline-none' : ''} ${className}`}
    >
      <div className="transition-transform duration-300 group-hover:scale-105 shrink-0">
        {EmblemOnlySvg}
      </div>
      <div className="text-left select-none">
        <div className="text-xl sm:text-2xl font-black italic tracking-tight flex items-center leading-none">
          <span className="text-[#FF5500] drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">Nano</span>
          <span className="text-[#009240] drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">Tech</span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-extrabold tracking-[0.22em] text-slate-500 block uppercase mt-1 group-hover:text-amber-600 transition-colors">
            FUTURE OF HARDWARE
          </span>
        )}
      </div>
    </div>
  );
}

export default NanoTechLogo;
