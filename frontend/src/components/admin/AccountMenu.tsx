'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../context/AdminContext';
import { useRBAC } from '../../context/RBACContext';
import { useApp } from '../../context/AppContext';
import { User, UserPlus, LogOut, ChevronUp } from 'lucide-react';

interface AccountMenuProps {
  isCollapsed?: boolean;
}

export default function AccountMenu({ isCollapsed = false }: AccountMenuProps) {
  const { currentAdmin, logoutAdmin, setAdminSubView } = useAdmin();
  const { logout: rbacLogout, navigate: rbacNavigate } = useRBAC();
  const { addToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(currentAdmin?.name || 'Admin User');
  const [adminEmail, setAdminEmail] = useState(currentAdmin?.email || 'admin@nanotech.com');

  // Load from Supabase session + profiles table
  useEffect(() => {
    let isMounted = true;

    async function loadAdminProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authEmail = session.user.email || '';
          let name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || authEmail.split('@')[0];

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email, role')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile?.full_name) {
              name = profile.full_name;
            }
          } catch {
            // fallback
          }

          if (isMounted) {
            setAdminName(name);
            setAdminEmail(authEmail);
          }
        } else if (currentAdmin) {
          if (isMounted) {
            setAdminName(currentAdmin.name);
            setAdminEmail(currentAdmin.email);
          }
        }
      } catch {
        if (currentAdmin && isMounted) {
          setAdminName(currentAdmin.name);
          setAdminEmail(currentAdmin.email);
        }
      }
    }

    loadAdminProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAdminProfile();
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [currentAdmin]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  // 1. My Profile action
  const handleMyProfile = () => {
    setIsOpen(false);
    setAdminSubView('settings');
  };

  // 2. Add another account: sign out, then open admin login page with an empty form
  const handleAddAnotherAccount = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    // Clear storage and admin sessions
    localStorage.removeItem('nanotech_admin_session');
    localStorage.removeItem('nanotech_user');
    logoutAdmin();
    await rbacLogout();

    addToast('info', 'Signed out. Please enter credentials for another account.');
    rbacNavigate('/admin');
  };

  // 3. Log out: supabase.auth.signOut(), then go to /admin login
  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem('nanotech_admin_session');
    localStorage.removeItem('nanotech_user');
    logoutAdmin();
    await rbacLogout();

    addToast('info', 'Logged out of admin console.');
    rbacNavigate('/admin');
  };

  return (
    <div ref={menuRef} className="relative w-full">
      {/* Small Account Popup Menu (opens upward) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs font-poppins animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100"
        >
          {/* User Brief */}
          <div className="px-3 py-2">
            <p className="font-bold text-slate-900 truncate">{adminName}</p>
            <p className="text-[11px] text-slate-500 font-mono truncate">{adminEmail}</p>
          </div>

          {/* Action List */}
          <div className="py-1">
            {/* My Profile */}
            <button
              type="button"
              onClick={handleMyProfile}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#0F766E]/10 hover:text-[#0F766E] font-medium transition-colors cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-slate-500 group-hover:text-[#0F766E]" />
              <span>My profile</span>
            </button>

            {/* Add another account */}
            <button
              type="button"
              onClick={handleAddAnotherAccount}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#0F766E]/10 hover:text-[#0F766E] font-medium transition-colors cursor-pointer text-left"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Add another account</span>
            </button>
          </div>

          {/* Log out (Red) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-left ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${adminName} (${adminEmail})`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar with initials in Teal */}
          <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {initials}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-slate-900 leading-tight">
                {adminName}
              </div>
              <div className="truncate text-[10px] text-slate-500 font-mono leading-tight">
                {adminEmail}
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <ChevronUp
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
    </div>
  );
}
