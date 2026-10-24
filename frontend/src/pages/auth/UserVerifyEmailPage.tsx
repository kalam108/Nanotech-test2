import React from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAuthFlow } from '../../components/auth/CustomerAuthFlow';

interface UserVerifyEmailPageProps {
  initialEmail?: string;
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function UserVerifyEmailPage({ initialEmail, onNavigate }: UserVerifyEmailPageProps) {
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
        <CustomerAuthFlow
          isModal={false}
          initialScreen="verify_gmail"
          initialEmail={initialEmail}
          onClose={() => handleNavigate('home')}
          onSuccess={() => handleNavigate('home')}
        />
      </div>
    </div>
  );
}

export default UserVerifyEmailPage;
