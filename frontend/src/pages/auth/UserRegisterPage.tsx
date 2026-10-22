import React from 'react';
import { useApp } from '../../context/AppContext';
import { RegisterSplitCard } from '../../components/auth/RegisterSplitCard';

interface UserRegisterPageProps {
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function UserRegisterPage({ onNavigate }: UserRegisterPageProps) {
  const { setCurrentView } = useApp();

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-8 sm:py-12 px-4 flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Ambient background artwork */}
      <img
        src="/image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center filter blur-md scale-105 opacity-30 pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/95 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <RegisterSplitCard
          isModal={false}
          onSwitchToLogin={() => handleNavigate('user_login')}
          onSuccess={() => handleNavigate('home')}
        />
      </div>
    </div>
  );
}
