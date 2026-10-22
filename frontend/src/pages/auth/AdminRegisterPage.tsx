import React from 'react';
import { AdminLogin } from '../../components/admin/AdminLogin';

interface AdminRegisterPageProps {
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function AdminRegisterPage({ onNavigate }: AdminRegisterPageProps) {
  return <AdminLogin initialMode="signup" />;
}

export default AdminRegisterPage;
