'use client';

import React from 'react';
import { AdminDashboard } from '../../src/components/admin/AdminDashboard';
import { AdminProvider } from '../../src/context/AdminContext';
import { AppProvider } from '../../src/context/AppContext';
import { RBACProvider } from '../../src/context/RBACContext';

export default function AdminPage() {
  return (
    <RBACProvider>
      <AppProvider>
        <AdminProvider>
          <AdminDashboard />
        </AdminProvider>
      </AppProvider>
    </RBACProvider>
  );
}
