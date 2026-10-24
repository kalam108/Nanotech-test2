import React from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerAuthFlow } from './CustomerAuthFlow';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="my-auto w-full flex justify-center">
        <CustomerAuthFlow
          isModal={true}
          initialScreen={authModalMode === 'signup' ? 'signup' : 'signin'}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default AuthModal;
