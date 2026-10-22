'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  IconSelector,
  IconChevronRight,
  IconBuildingStore,
  IconExternalLink,
  IconPalette,
  IconUserCircle,
  IconLanguage,
  IconBell,
  IconSettings,
  IconLifebuoy,
  IconBook,
  IconKeyboard,
  IconMessageCircle,
  IconLogout,
} from '@tabler/icons-react';
import LogoutDialog from './LogoutDialog';

interface AccountMenuProps {
  adminName?: string;
  adminRole?: string;
  avatarInitials?: string;
  isCollapsed?: boolean;
  onLogout?: () => void;
  onNavigate?: (routeOrView: string) => void;
}

export default function AccountMenu({
  adminName = 'Raju Khadka',
  adminRole = 'Admin',
  avatarInitials = 'RK',
  isCollapsed = false,
  onLogout,
  onNavigate,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [language, setLanguage] = useState<'English' | 'नेपाली'>('English');
  const [orderAlerts, setOrderAlerts] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const helpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize saved preferences from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('nanotech_admin_language');
      if (savedLang === 'नेपाली' || savedLang === 'English') {
        setLanguage(savedLang);
      }
      const savedAlerts = localStorage.getItem('nanotech_admin_order_alerts');
      if (savedAlerts !== null) {
        setOrderAlerts(savedAlerts === 'true');
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsHelpOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsHelpOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      if (helpTimeoutRef.current) clearTimeout(helpTimeoutRef.current);
    };
  }, []);

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = language === 'English' ? 'नेपाली' : 'English';
    setLanguage(nextLang);
    try {
      localStorage.setItem('nanotech_admin_language', nextLang);
    } catch {
      // ignore
    }
  };

  const toggleOrderAlerts = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !orderAlerts;
    setOrderAlerts(nextState);
    try {
      localStorage.setItem('nanotech_admin_order_alerts', String(nextState));
    } catch {
      // ignore
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsHelpOpen(false);
  };

  const handleItemClick = (target: string, e?: React.MouseEvent) => {
    closeMenu();
    if (onNavigate) {
      if (e) e.preventDefault();
      onNavigate(target);
    }
  };

  const openLogoutDialog = () => {
    closeMenu();
    setIsLogoutOpen(true);
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        {/* ACCOUNT MENU POPUP (opens UPWARD directly above the account button) */}
        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute bottom-full left-0 mb-2 w-[220px] rounded-[14px] border border-[#EDEDED] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 text-[13px]"
          >
            {/* 1. Avatar RK + Raju Khadka + Admin + ChevronRight */}
            <Link
              href="/admin/profile"
              onClick={(e) => handleItemClick('profile', e)}
              className="flex items-center gap-2.5 rounded-[8px] p-2 transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[11px] font-medium text-[#1A1A1A]">
                {avatarInitials}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium text-[#1A1A1A]">
                  {adminName}
                </div>
                <div className="text-[11px] leading-none text-[#6B6B6B]">
                  {adminRole}
                </div>
              </div>
              <IconChevronRight size={17} stroke={1.5} className="shrink-0 text-[#6B6B6B]" />
            </Link>

            {/* 2. Divider */}
            <div className="my-1 border-t border-[#EDEDED]" />

            {/* 3. View storefront (opens public shop '/' in a new tab) */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <IconBuildingStore size={17} stroke={1.5} className="text-[#6B6B6B]" />
                <span>View storefront</span>
              </div>
              <IconExternalLink size={14} stroke={1.5} className="text-[#6B6B6B]" />
            </a>

            {/* 4. Personalization */}
            <Link
              href="/admin/personalization"
              onClick={(e) => handleItemClick('personalization', e)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <IconPalette size={17} stroke={1.5} className="text-[#6B6B6B]" />
              <span>Personalization</span>
            </Link>

            {/* 5. Profile */}
            <Link
              href="/admin/profile"
              onClick={(e) => handleItemClick('profile', e)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <IconUserCircle size={17} stroke={1.5} className="text-[#6B6B6B]" />
              <span>Profile</span>
            </Link>

            {/* 6. Language (toggles English / नेपाली) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <IconLanguage size={17} stroke={1.5} className="text-[#6B6B6B]" />
                <span>Language</span>
              </div>
              <span className="text-[12px] text-[#6B6B6B]">{language}</span>
            </button>

            {/* 7. Order alerts (toggle switch) */}
            <div
              onClick={toggleOrderAlerts}
              className="flex cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5]"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                <IconBell size={17} stroke={1.5} className="text-[#6B6B6B]" />
                <span>Order alerts</span>
              </div>
              {/* Minimal toggle switch: black when on, #DCDCDC when off */}
              <div
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                  orderAlerts ? 'bg-[#1A1A1A]' : 'bg-[#DCDCDC]'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    orderAlerts ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>

            {/* 8. Settings */}
            <Link
              href="/admin/settings"
              onClick={(e) => handleItemClick('settings', e)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <IconSettings size={17} stroke={1.5} className="text-[#6B6B6B]" />
              <span>Settings</span>
            </Link>

            {/* 9. Divider */}
            <div className="my-1 border-t border-[#EDEDED]" />

            {/* 10. Help (with right submenu) */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (helpTimeoutRef.current) clearTimeout(helpTimeoutRef.current);
                setIsHelpOpen(true);
              }}
              onMouseLeave={() => {
                helpTimeoutRef.current = setTimeout(() => setIsHelpOpen(false), 150);
              }}
            >
              <button
                type="button"
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={isHelpOpen}
              >
                <div className="flex items-center gap-2.5">
                  <IconLifebuoy size={17} stroke={1.5} className="text-[#6B6B6B]" />
                  <span>Help</span>
                </div>
                <IconChevronRight size={17} stroke={1.5} className="text-[#6B6B6B]" />
              </button>

              {/* Help Submenu */}
              {isHelpOpen && (
                <div
                  className="absolute bottom-0 left-[calc(100%+6px)] w-[160px] rounded-[14px] border border-[#EDEDED] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 text-[13px]"
                  role="menu"
                >
                  <Link
                    href="/admin/help"
                    onClick={(e) => handleItemClick('help', e)}
                    className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
                    role="menuitem"
                  >
                    <IconBook size={17} stroke={1.5} className="text-[#6B6B6B]" />
                    <span>Help center</span>
                  </Link>
                  <Link
                    href="/admin/shortcuts"
                    onClick={(e) => handleItemClick('shortcuts', e)}
                    className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
                    role="menuitem"
                  >
                    <IconKeyboard size={17} stroke={1.5} className="text-[#6B6B6B]" />
                    <span>Shortcuts</span>
                  </Link>
                  <Link
                    href="/admin/support"
                    onClick={(e) => handleItemClick('support', e)}
                    className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
                    role="menuitem"
                  >
                    <IconMessageCircle size={17} stroke={1.5} className="text-[#6B6B6B]" />
                    <span>Contact support</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 11. Log out */}
            <button
              type="button"
              onClick={openLogoutDialog}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:bg-[#F5F5F5]"
              role="menuitem"
            >
              <IconLogout size={17} stroke={1.5} className="text-[#6B6B6B]" />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* ACCOUNT BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={`flex w-full items-center gap-2.5 rounded-[8px] p-2 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] ${
            isOpen ? 'bg-[#F0F0F0]' : 'bg-transparent hover:bg-[#F5F5F5]'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          {/* Light gray circle avatar with initials */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[11px] font-medium text-[#1A1A1A]">
            {avatarInitials}
          </div>

          {!isCollapsed && (
            <>
              {/* Name & Role */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[#1A1A1A]">
                  {adminName}
                </div>
                <div className="text-[11px] leading-tight text-[#6B6B6B]">
                  {adminRole}
                </div>
              </div>
              {/* IconSelector on the right */}
              <IconSelector size={17} stroke={1.5} className="shrink-0 text-[#6B6B6B]" />
            </>
          )}
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirmLogout={onLogout}
      />
    </>
  );
}
