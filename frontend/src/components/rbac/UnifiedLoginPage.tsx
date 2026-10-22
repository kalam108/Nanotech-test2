import React from 'react';
import { CustomerLoginPage } from './customer/CustomerLoginPage';

// Replaced multi-role unified login with clean CustomerLoginPage
export const UnifiedLoginPage: React.FC<{ initialRole?: any }> = () => {
  return <CustomerLoginPage />;
};
