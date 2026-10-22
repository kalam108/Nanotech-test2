import React, { useState } from 'react';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function WhatsAppFloatingButton({ isOpen, onClick }: WhatsAppFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id="whatsapp-seller-floating-container"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip / Label Pill on Hover */}
      <div
        className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 text-white text-xs font-semibold backdrop-blur-md border border-emerald-500/30 shadow-xl shadow-emerald-950/40 transition-all duration-300 pointer-events-none transform ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-3 scale-95'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-bold">
          WhatsApp 9852055346
        </span>
        <span className="text-[10px] text-slate-300 font-normal border-l border-slate-700 pl-2">
          Chat directly with Shop Owner
        </span>
      </div>

      {/* Glossy WhatsApp Floating Action Button */}
      <button
        id="whatsapp-seller-floating-button"
        onClick={onClick}
        aria-label="Direct WhatsApp Chat with Seller"
        className="relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/40 transition-transform duration-300 transform active:scale-95 hover:scale-110"
      >
        {/* Pulsing Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping" />

        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Core Emerald Button Stage */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] p-1 flex items-center justify-center shadow-2xl border-2 border-white/40 overflow-hidden">
          {/* Glossy Light Reflection (Glass Dome Sheen) */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent rounded-t-full pointer-events-none" />

          {/* Center WhatsApp Icon */}
          <div className="relative z-10 text-white drop-shadow-md flex items-center justify-center">
            {isOpen ? (
              <X className="w-7 h-7 text-white animate-in zoom-in-50 duration-200" />
            ) : (
              <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            )}
          </div>

          {/* Active Online Status Dot */}
          <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-white border-2 border-[#25D366] shadow-[0_0_6px_#ffffff] z-20" />
        </div>
      </button>
    </div>
  );
}

export default WhatsAppFloatingButton;
