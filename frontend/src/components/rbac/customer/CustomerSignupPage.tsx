import React from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { CustomerAuthFlow } from '../../auth/CustomerAuthFlow';

export const CustomerSignupPage: React.FC = () => {
  const { navigate } = useRBAC();
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80">
      <div className="w-full max-w-md flex justify-center">
        <CustomerAuthFlow
          isModal={false}
          initialScreen="signup"
          onClose={() => {
            setCurrentView('home');
            navigate('/');
          }}
          onSuccess={() => {
            setCurrentView('home');
            navigate('/');
          }}
        />
      </div>
    </div>
  );
};

export default CustomerSignupPage;
