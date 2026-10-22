'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconWorld,
  IconLayoutGrid,
  IconChartLine,
  IconPackage,
  IconBuildingWarehouse,
  IconReceipt,
  IconUsers,
  IconCreditCard,
} from '@tabler/icons-react';
import AccountMenu from './AccountMenu';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: IconLayoutGrid },
  { label: 'Analytics', href: '/admin/analytics', icon: IconChartLine },
];

const catalogNavItems: NavItem[] = [
  { label: 'Products', href: '/admin/products', icon: IconPackage },
  { label: 'Inventory', href: '/admin/inventory', icon: IconBuildingWarehouse },
];

const salesNavItems: NavItem[] = [
  { label: 'Orders', href: '/admin/orders', icon: IconReceipt },
  { label: 'Customers', href: '/admin/customers', icon: IconUsers },
  { label: 'Payments', href: '/admin/payments', icon: IconCreditCard },
];

export default function Sidebar() {
  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch {
    pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[13px] transition-colors ${
          isActive
            ? 'bg-[#F3F3F3] font-medium text-[#1A1A1A]'
            : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
        }`}
      >
        <Icon size={17} stroke={1.5} className="shrink-0 text-[#6B6B6B]" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[220px] flex-col justify-between border-r border-[#EDEDED] bg-[#FFFFFF] font-sans text-[13px]">
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="flex h-12 items-center gap-2 px-4">
          <IconWorld size={17} stroke={1.5} className="shrink-0 text-[#6B6B6B]" />
          <Link
            href="/admin"
            className="text-[13px] font-medium tracking-tight text-[#1A1A1A] hover:opacity-80"
          >
            NanoTech
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col space-y-4 px-2 pt-1">
          {/* Main Items: Dashboard, Analytics */}
          <div className="space-y-0.5">
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Section: Catalog */}
          <div className="space-y-0.5">
            <div className="px-2.5 pb-1 pt-1 text-[11px] font-normal text-[#A0A0A0]">
              Catalog
            </div>
            {catalogNavItems.map(renderNavItem)}
          </div>

          {/* Section: Sales */}
          <div className="space-y-0.5">
            <div className="px-2.5 pb-1 pt-1 text-[11px] font-normal text-[#A0A0A0]">
              Sales
            </div>
            {salesNavItems.map(renderNavItem)}
          </div>
        </nav>
      </div>

      {/* Account button at bottom-left */}
      <div className="p-2 border-t border-[#EDEDED] bg-white">
        <AccountMenu />
      </div>
    </aside>
  );
}
