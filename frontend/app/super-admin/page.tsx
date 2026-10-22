'use client';

import React from 'react';
import { SuperadminLayout } from '../../src/components/rbac/superadmin/SuperadminLayout';
import { SuperadminDashboardView } from '../../src/components/rbac/superadmin/SuperadminDashboardView';
import { AdminProvider } from '../../src/context/AdminContext';
import { AppProvider } from '../../src/context/AppContext';
import { RBACProvider } from '../../src/context/RBACContext';

export default function SuperAdminPage() {
  return (
    <RBACProvider>
      <AppProvider>
        <AdminProvider>
          <SuperadminLayout>
            <SuperadminDashboardView />
          </SuperadminLayout>
        </AdminProvider>
      </AppProvider>
    </RBACProvider>
  );
}
