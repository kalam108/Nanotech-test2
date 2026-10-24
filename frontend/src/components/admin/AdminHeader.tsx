'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';
import { Search, Bell, Menu } from 'lucide-react';

export function AdminHeader() {
  const {
    currentAdmin,
    unreadNotificationCount,
    setIsGlobalSearchOpen,
    setIsMobileDrawerOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [adminName, setAdminName] = useState(currentAdmin?.name || 'Admin User');

  // Load name from Supabase session + profiles
  useEffect(() => {
    let isMounted = true;
    async function fetchName() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authEmail = session.user.email || '';
          let name = session.user.user_metadata?.full_name || authEmail.split('@')[0];
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', session.user.id)
              .maybeSingle();
            if (profile?.full_name) name = profile.full_name;
          } catch {
            // fallback
          }
          if (isMounted) setAdminName(name);
        }
      } catch {
        if (currentAdmin && isMounted) setAdminName(currentAdmin.name);
      }
    }
    fetchName();
    return () => {
      isMounted = false;
    };
  }, [currentAdmin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalSearchOpen(true);
  };

  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 h-16 text-slate-800 flex items-center justify-between gap-4 font-poppins select-none shadow-2xs">
      {/* Left: Mobile Menu Toggle / Sidebar Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsMobileDrawerOpen(true);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          className="p-2 rounded-xl text-slate-600 hover:text-[#0F766E] hover:bg-slate-100 transition-all cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search Box (searches products, orders, customers) */}
      <div className="flex-1 max-w-lg mx-2 sm:mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            id="admin-search-input"
            type="text"
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] shadow-2xs transition-all cursor-pointer font-poppins"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* Right: Notification Bell & Admin Name */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="relative p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0F766E] border border-slate-200 shadow-2xs transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F766E] text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Admin Name with Initials Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {adminName}
            </div>
            <div className="text-[10px] text-[#0F766E] font-semibold leading-tight">
              Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
