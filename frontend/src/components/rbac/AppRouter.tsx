import React from 'react';
import { useRBAC } from '../../context/RBACContext';
import { CustomerLoginPage } from './customer/CustomerLoginPage';

// Customer Components
import { CustomerLayout } from './customer/CustomerLayout';
import { CustomerDashboardView } from './customer/CustomerDashboardView';
import { CustomerProductsView } from './customer/CustomerProductsView';
import { CustomerCartView } from './customer/CustomerCartView';
import { CustomerOrdersView } from './customer/CustomerOrdersView';
import { CustomerProfileView } from './customer/CustomerProfileView';
import { CustomerSignupPage } from './customer/CustomerSignupPage';

// Admin Components
import { AdminLogin } from '../admin/AdminLogin';
import { AdminDashboard } from '../admin/AdminDashboard';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboardView } from './admin/AdminDashboardView';
import { AdminProductsView } from './admin/AdminProductsView';
import { AdminOrdersView } from './admin/AdminOrdersView';
import { AdminCustomersView } from './admin/AdminCustomersView';
import { AdminReportsView } from './admin/AdminReportsView';

// Superadmin Components
import { SuperadminLayout } from './superadmin/SuperadminLayout';
import { SuperadminLoginPage } from './superadmin/SuperadminLoginPage';
import { SuperadminSignupPage } from './superadmin/SuperadminSignupPage';
import { SuperadminDashboardView } from './superadmin/SuperadminDashboardView';
import { SuperadminAdminsView } from './superadmin/SuperadminAdminsView';
import { SuperadminCustomersView } from './superadmin/SuperadminCustomersView';
import { SuperadminProductsView } from './superadmin/SuperadminProductsView';
import { SuperadminOrdersView } from './superadmin/SuperadminOrdersView';
import { SuperadminPermissionsView } from './superadmin/SuperadminPermissionsView';
import { SuperadminSettingsView } from './superadmin/SuperadminSettingsView';
import { SuperadminUsersRolesView } from './superadmin/SuperadminUsersRolesView';

// Dedicated User Search Page
import { UserSearchPage } from '../../pages/UserSearchPage';
import { UserDashboardPage } from '../../pages/auth/UserDashboardPage';

export const AppRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPath, role, isAuthenticated } = useRBAC();

  // Normalize path without trailing slashes
  const path = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;

  // DEDICATED USER SEARCH ROUTE (/search) on the same domain
  if (path === '/search') {
    return <UserSearchPage />;
  }

  // 1. SUPERADMIN CUSTOM DOMAIN ROUTING (kalamkumar.com.np)
  const isSuperadminHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'kalamkumar.com.np' ||
      window.location.hostname === 'www.kalamkumar.com.np' ||
      window.location.hostname.includes('kalamkumar') ||
      window.location.hostname.startsWith('superadmin.'));

  if (isSuperadminHost) {
    if (path === '/' || path === '/login') {
      if (isAuthenticated && role === 'super_admin') {
        return (
          <SuperadminLayout>
            <SuperadminDashboardView />
          </SuperadminLayout>
        );
      }
      return <SuperadminLoginPage />;
    }
    if (path === '/signup' || path === '/register') {
      return <SuperadminSignupPage />;
    }
    if (path === '/dashboard') {
      return (
        <SuperadminLayout>
          <SuperadminDashboardView />
        </SuperadminLayout>
      );
    }
    if (path === '/admins') {
      return (
        <SuperadminLayout>
          <SuperadminAdminsView />
        </SuperadminLayout>
      );
    }
    if (path === '/customers') {
      return (
        <SuperadminLayout>
          <SuperadminCustomersView />
        </SuperadminLayout>
      );
    }
    if (path === '/products') {
      return (
        <SuperadminLayout>
          <SuperadminProductsView />
        </SuperadminLayout>
      );
    }
    if (path === '/orders') {
      return (
        <SuperadminLayout>
          <SuperadminOrdersView />
        </SuperadminLayout>
      );
    }
    if (path === '/permissions') {
      return (
        <SuperadminLayout>
          <SuperadminPermissionsView />
        </SuperadminLayout>
      );
    }
    if (path === '/settings') {
      return (
        <SuperadminLayout>
          <SuperadminSettingsView />
        </SuperadminLayout>
      );
    }
  }

  // 2. SUPERADMIN ROUTES (/super-admin and /superadmin)
  if (path === '/super-admin' || path.startsWith('/super-admin') || path === '/superadmin' || path.startsWith('/superadmin')) {
    if (path === '/superadmin/signup' || path === '/super-admin/signup' || path === '/superadmin/register' || path === '/super-admin/register') {
      return <SuperadminSignupPage />;
    }

    const isSuperAdmin = role === 'super_admin';

    // If not logged in as Superadmin, show the Superadmin Login page
    if (!isSuperAdmin) {
      return <SuperadminLoginPage />;
    }

    // Role-protected Superadmin Console
    return (
      <SuperadminLayout>
        {(() => {
          switch (path) {
            case '/super-admin':
            case '/superadmin':
            case '/superadmin/dashboard':
            case '/super-admin/dashboard':
              return <SuperadminDashboardView />;
            case '/super-admin/users':
            case '/superadmin/users':
              return <SuperadminUsersRolesView />;
            case '/super-admin/admins':
            case '/superadmin/admins':
              return <SuperadminAdminsView />;
            case '/super-admin/customers':
            case '/superadmin/customers':
              return <SuperadminCustomersView />;
            case '/super-admin/products':
            case '/superadmin/products':
              return <SuperadminProductsView />;
            case '/super-admin/orders':
            case '/superadmin/orders':
              return <SuperadminOrdersView />;
            case '/super-admin/permissions':
            case '/superadmin/permissions':
              return <SuperadminPermissionsView />;
            case '/super-admin/settings':
            case '/superadmin/settings':
              return <SuperadminSettingsView />;
            default:
              return <SuperadminDashboardView />;
          }
        })()}
      </SuperadminLayout>
    );
  }

  // 3. ADMIN ROUTES (/admin)
  if (path === '/admin' || path.startsWith('/admin')) {
    const isAdmin = role === 'admin' || role === 'super_admin';

    // If not logged in as Admin, show the Admin Authentication portal
    if (!isAdmin) {
      return <AdminLogin />;
    }

    // Full Enterprise Admin Dashboard Console with Master Sections
    return <AdminDashboard />;
  }

  // 3. CANONICAL AUTH & CUSTOMER ACCOUNT ROUTES
  if (path === '/login') {
    return <CustomerLoginPage />;
  }

  if (path === '/signup') {
    return <CustomerSignupPage />;
  }

  if (path === '/dashboard') {
    return (
      <CustomerLayout>
        <CustomerDashboardView />
      </CustomerLayout>
    );
  }

  if (path === '/cart') {
    return (
      <CustomerLayout>
        <CustomerCartView />
      </CustomerLayout>
    );
  }

  if (path.startsWith('/account')) {
    return (
      <CustomerLayout>
        {(() => {
          switch (path) {
            case '/account/orders':
              return <CustomerOrdersView />;
            case '/account/addresses':
            case '/account/profile':
            case '/account':
              return <CustomerProfileView />;
            case '/account/wishlist':
            case '/account/reviews':
            case '/account/returns':
              return <UserDashboardPage />;
            case '/account/dashboard':
              return <CustomerDashboardView />;
            case '/account/cart':
              return <CustomerCartView />;
            case '/account/products':
              return <CustomerProductsView />;
            default:
              return <CustomerDashboardView />;
          }
        })()}
      </CustomerLayout>
    );
  }

  // 4. LEGACY /customer PREFIXED ROUTES
  if (path.startsWith('/customer')) {
    if (path === '/customer/login') {
      return <CustomerLoginPage />;
    }

    if (path === '/customer/signup') {
      return <CustomerSignupPage />;
    }

    // Role-protected Customer Portal
    return (
      <CustomerLayout>
        {(() => {
          switch (path) {
            case '/customer/dashboard':
              return <CustomerDashboardView />;
            case '/customer/products':
              return <CustomerProductsView />;
            case '/customer/cart':
              return <CustomerCartView />;
            case '/customer/orders':
              return <CustomerOrdersView />;
            case '/customer/profile':
              return <CustomerProfileView />;
            default:
              return <CustomerDashboardView />;
          }
        })()}
      </CustomerLayout>
    );
  }

  // 5. PUBLIC STOREFRONT / ROOT
  return <>{children}</>;
};
