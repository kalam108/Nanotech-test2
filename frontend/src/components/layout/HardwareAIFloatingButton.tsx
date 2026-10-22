import React, { useState } from 'react';
import { HardwareAIRobotIcon } from './HardwareAIRobotIcon';
import { Sparkles, X } from 'lucide-react';

interface HardwareAIFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HardwareAIFloatingButton({ isOpen, onClick }: HardwareAIFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id="hardware-ai-floating-container"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip / Label Pill on Hover */}
      <div
        className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 text-white text-xs font-semibold backdrop-blur-md border border-indigo-500/30 shadow-xl shadow-indigo-950/40 transition-all duration-300 pointer-events-none transform ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-3 scale-95'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-bold">
          Hardware AI
        </span>
        <span className="text-[10px] text-slate-400 font-normal border-l border-slate-700 pl-2">
          {isOpen ? 'Close Advisor' : 'Ask Anything'}
        </span>
      </div>

      {/* Glossy 360-Color Button */}
      <button
        id="hardware-ai-floating-button"
        onClick={onClick}
        aria-label="Toggle Hardware AI Advisor"
        className="relative group cursor-pointer p-[2.5px] rounded-[22px] focus:outline-none focus:ring-4 focus:ring-indigo-500/40 transition-transform duration-300 transform active:scale-95 hover:scale-105"
      >
        {/* Outer Atmospheric Glow matching 360 colors */}
        <div className="absolute inset-0 rounded-[22px] conic-gradient-360 animate-spin-360 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 360 Color Border Ring */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[21px] p-[2.5px] overflow-hidden conic-gradient-360 animate-spin-360 shadow-2xl">
          {/* Internal rotating container to hold gradient */}
        </div>

        {/* Inner Dark Glass Core Container */}
        <div className="absolute inset-[2.5px] rounded-[18.5px] bg-gradient-to-b from-[#090e21] to-[#04060e] flex items-center justify-center overflow-hidden">
          {/* Top Glossy Specular Light Reflection (Glass Dome Sheen) */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-t-[18.5px] pointer-events-none" />

          {/* Subtle Ambient Radial Light behind Robot */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22)_0%,transparent_70%)] pointer-events-none" />

          {/* Center Hardware AI Robot Icon */}
          <div className="relative z-10 text-indigo-300 group-hover:text-blue-200 transition-colors duration-200 drop-shadow-[0_0_8px_rgba(147,197,253,0.7)] flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 text-indigo-200 animate-in zoom-in-50 duration-200" />
            ) : (
              <HardwareAIRobotIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>

          {/* Active Status Beacon Dot */}
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] z-20" />
        </div>
      </button>
    </div>
  );
}

export default HardwareAIFloatingButton;
