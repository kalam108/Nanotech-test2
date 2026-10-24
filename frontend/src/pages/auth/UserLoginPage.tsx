import React from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAuthFlow } from '../../components/auth/CustomerAuthFlow';

interface UserLoginPageProps {
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function UserLoginPage({ onNavigate }: UserLoginPageProps) {
  const { setCurrentView } = useApp();

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 sm:py-16 px-4 flex items-center justify-center bg-slate-50">
      <div className="relative z-10 w-full flex justify-center">
        <CustomerAuthFlow
          isModal={false}
          initialScreen="signin"
          onClose={() => handleNavigate('home')}
          onSuccess={() => handleNavigate('home')}
        />
      </div>
    </div>
  );
}

export default UserLoginPage;
