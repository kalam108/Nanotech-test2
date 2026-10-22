'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRBAC } from '../../context/RBACContext';
import { supabase } from '../../lib/supabase/client';
import { useTranslation } from '../../i18n/useTranslation';
import { LanguageToggle } from './LanguageToggle';
import { NanoTechLogo } from '../brand/NanoTechLogo';
import { WhatsAppIcon } from '../brand/WhatsAppIcon';
import { ComponentsMegaDropdown } from './ComponentsMegaDropdown';
import { Product } from '../../types';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User as UserIcon,
  UserPlus,
  Cpu,
  Bot,
  Flame,
  Recycle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  Package,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Truck,
  MapPin,
  Home,
  Monitor,
  Laptop,
  Layers,
  Settings,
  Headphones,
  Tag,
  Shield,
  Clock,
  LayoutDashboard,
  Sparkles,
  Smile,
  Star,
  XCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenAiAdvisor?: () => void;
  onOpenDashboardHub?: () => void;
}

export function Header({ onOpenAiAdvisor, onOpenDashboardHub }: HeaderProps) {
  const {
    currentUser,
    setCurrentUserRole,
    currentView,
    setCurrentView,
    customerDashboardTab,
    setCustomerDashboardTab,
    logoutUser,
    cart,
    wishlist,
    compareList,
    filters,
    setFilters,
    categories,
    currency,
    formatPricePrimary,
    products,
    setSelectedProductId,
    setIsAuthModalOpen,
    openAuthModal,
    addToast,
  } = useApp();

  const { t, isNepali } = useTranslation();
  const {
    currentUser: rbacUser,
    isAuthenticated: rbacIsAuthenticated,
    role: rbacRole,
    navigate: rbacNavigate,
    logout: rbacLogout,
  } = useRBAC();

  // 4. Header updates right after sign in and sign out using supabase.auth.onAuthStateChange
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const metaFullName =
          metadata.full_name ||
          [metadata.first_name, metadata.middle_name, metadata.last_name].filter(Boolean).join(' ') ||
          metadata.name;

        const pendingName = typeof window !== 'undefined' ? localStorage.getItem('nanotech_pending_fullname') : null;
        const name = metaFullName || pendingName || 'Customer';

        if (typeof window !== 'undefined') {
          localStorage.setItem('nanotech_session_token', session.access_token);
          const customerProfile = {
            id: session.user.id,
            name,
            email: session.user.email,
            role: 'customer',
            phone: metadata.phone || '+977 9800000000',
            location: metadata.location || 'Nepal (Storefront)',
            orders: 1,
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            isLiveSession: true,
            source: 'Supabase Auth',
          };
          localStorage.setItem('nanotech_user', JSON.stringify(customerProfile));

          try {
            const raw = localStorage.getItem('nanotech_registered_customers');
            const list = raw ? JSON.parse(raw) : [];
            const idx = list.findIndex((c: any) => c.email?.toLowerCase() === session.user.email?.toLowerCase());
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...customerProfile, isLiveSession: true };
            } else {
              list.unshift(customerProfile);
            }
            localStorage.setItem('nanotech_registered_customers', JSON.stringify(list));
          } catch {}
        }
      }
    });

    const handleRefresh = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSupabaseUser(session?.user ?? null);
      });
    };
    window.addEventListener('auth-state-change', handleRefresh);
    window.addEventListener('supabase-auth-refresh', handleRefresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-state-change', handleRefresh);
      window.removeEventListener('supabase-auth-refresh', handleRefresh);
    };
  }, []);

  // Unified authentication state
  const isUserLoggedIn =
    Boolean(supabaseUser) ||
    (rbacIsAuthenticated && !!rbacUser) ||
    (typeof window !== 'undefined' &&
      (!!localStorage.getItem('nanotech_session_token') || !!localStorage.getItem('nanotech_user')));

  const storedUser = typeof window !== 'undefined' ? (() => {
    try {
      const u = localStorage.getItem('nanotech_user') || localStorage.getItem('nanotech_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })() : null;

  const userMeta = supabaseUser?.user_metadata || {};
  const metaFullName =
    userMeta.full_name ||
    [userMeta.first_name, userMeta.middle_name, userMeta.last_name].filter(Boolean).join(' ') ||
    userMeta.name;

  const pendingName = typeof window !== 'undefined' ? localStorage.getItem('nanotech_pending_fullname') : null;

  // Filter out raw email usernames like "sky240287" from sky240287@gmail.com
  const isEmailPrefix = (val?: string | null, email?: string | null) => {
    if (!val) return false;
    if (email && val.toLowerCase() === email.split('@')[0].toLowerCase()) return true;
    return false;
  };

  const storedValidName = !isEmailPrefix(storedUser?.name, storedUser?.email || supabaseUser?.email)
    ? storedUser?.name
    : null;

  const activeCustomerName =
    metaFullName ||
    pendingName ||
    storedValidName ||
    'Customer';

  const activeUser =
    (supabaseUser
      ? {
          id: supabaseUser.id,
          name: activeCustomerName,
          email: supabaseUser.email || storedUser?.email || '',
          role: 'customer',
        }
      : null) ||
    (storedUser
      ? {
          id: storedUser.id || 'cust-1',
          name: activeCustomerName,
          email: storedUser.email || '',
          role: storedUser.role || 'customer',
        }
      : null) ||
    rbacUser ||
    (isUserLoggedIn ? currentUser : null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('All Categories');
  const [searchCategoryDropdownOpen, setSearchCategoryDropdownOpen] = useState(false);
  const [componentsDropdownOpen, setComponentsDropdownOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchCategoryRef = useRef<HTMLDivElement>(null);
  const componentsMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const wishlistCount = (wishlist || []).length;
  const compareCount = (compareList || []).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountDropdownOpen(false);
      }
      if (searchCategoryRef.current && !searchCategoryRef.current.contains(target)) {
        setSearchCategoryDropdownOpen(false);
      }
      if (componentsMenuRef.current && !componentsMenuRef.current.contains(target)) {
        setComponentsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSearchCategory !== 'All Categories') {
      setFilters(prev => ({ ...prev, category: selectedSearchCategory }));
    }
    // Route directly to dedicated /search URL on the same domain
    const query = filters.searchQuery ? `?q=${encodeURIComponent(filters.searchQuery)}` : '';
    rbacNavigate(`/search${query}`);
  };

  const handleSelectNavCategory = (catName: string, condition: 'all' | 'Refurbished' | 'Used' = 'all') => {
    setFilters(prev => ({ ...prev, category: catName, condition }));
    setComponentsDropdownOpen(false);
    setCurrentView('products');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  const handleCustomerNav = (tab: 'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns') => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    setCustomerDashboardTab(tab);
    setCurrentView('user_dashboard');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSupabaseUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_user');
      window.dispatchEvent(new Event('auth-state-change'));
    }
    await rbacLogout();
    await logoutUser();
    setCurrentUserRole('customer');
    addToast('info', 'Signed out of account session');
    setCurrentView('home');
    rbacNavigate('/');
  };

  // Real-time store status in Nepal
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; text: string }>({ isOpen: true, text: 'Open now · 8AM–7PM' });

  useEffect(() => {
    const checkStatus = () => {
      try {
        const now = new Date();
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour12: false,
          weekday: 'short',
          hour: 'numeric',
          minute: 'numeric',
        }).formatToParts(now);

        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
        const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        const weekday = parts.find(p => p.type === 'weekday')?.value || 'Sun';
        const mins = hour * 60 + minute;

        if (weekday === 'Sat') {
          setStoreStatus({ isOpen: false, text: 'Closed (Saturday)' });
        } else if (weekday === 'Thu') {
          if (mins >= 540 && mins < 1140) {
            setStoreStatus({ isOpen: true, text: 'Open · 9AM–7PM' });
          } else {
            setStoreStatus({ isOpen: false, text: 'Closed now' });
          }
        } else {
          if (mins >= 480 && mins < 1140) {
            setStoreStatus({ isOpen: true, text: 'Open · 8AM–7PM' });
          } else {
            setStoreStatus({ isOpen: false, text: 'Closed now' });
          }
        }
      } catch {
        setStoreStatus({ isOpen: true, text: 'Open · 8AM–7PM' });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full font-sans select-none">
      {/* 1. TOP UTILITY BAR (Vibrant Purple to Blue Gradient with Glossy Inset) - Scrolls naturally with page */}
      <div className="relative bg-gradient-to-r from-[#4f46e5] via-[#2563eb] to-[#0284c7] px-3 sm:px-6 lg:px-8 xl:px-10 py-1.5 sm:py-2 text-xs text-white shadow-2xs overflow-visible before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none z-50">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex items-center justify-between gap-2 sm:gap-4 relative z-10 overflow-visible no-scrollbar">
          {/* Left: Store Location & Live Status Pill (Visible on Mobile & Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs shrink-0 py-0.5">
            <button
              onClick={() => setCurrentView('contact')}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-white/95 hover:text-amber-200 font-semibold whitespace-nowrap cursor-pointer transition"
              title="Click to view Itahari store details"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300 stroke-[2.2] shrink-0" />
              <span className="truncate max-w-[130px] xs:max-w-none">{t('locationItahari')}</span>
            </button>

            {/* Live Store Hours Pill - Visible on mobile and desktop */}
            <button
              type="button"
              onClick={() => setCurrentView('contact')}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full font-bold text-[9px] sm:text-[10px] transition cursor-pointer border shrink-0 ${
                storeStatus.isOpen
                  ? 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/40'
                  : 'bg-rose-500/25 text-rose-100 border-rose-400/40 hover:bg-rose-500/40'
              }`}
              title="View full weekly store hours and location in Itahari"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{storeStatus.isOpen ? t('storeOpen') : t('storeClosed')}</span>
            </button>
          </div>

          {/* Right: Language Switcher, Need Help, Sign In/Up (Visible on Mobile & Desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 text-[11px] sm:text-xs shrink-0 whitespace-nowrap">
            {/* Direct Language Switcher (EN / नेपाली) */}
            <div className="flex items-center gap-1">
              <LanguageToggle variant="header" />
            </div>

            <span className="text-white/30 font-light">|</span>

            {/* Need Help? - Visible on mobile too */}
            <button
              onClick={() => setCurrentView('help')}
              className="text-white hover:text-white/85 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              title="Need Help?"
            >
              <Headphones className="w-3.5 h-3.5 text-white stroke-[2.2] shrink-0" />
              <span className="hidden xs:inline">{t('needHelp')}</span>
            </button>

            {onOpenDashboardHub && (
              <>
                <span className="text-white/30 font-light">|</span>
                <button
                  type="button"
                  onClick={onOpenDashboardHub}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 hover:from-indigo-500/50 hover:to-purple-500/50 text-white border border-indigo-300/40 text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="View and launch all 5 live enterprise and customer dashboards"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dashboards</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </>
            )}

            <span className="text-white/30 font-light">|</span>

            {!isUserLoggedIn ? (
              /* Sign In & Register buttons matching user design attachment */
              <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-bold text-white hover:text-white/80 transition-colors cursor-pointer text-xs sm:text-[13px] px-1.5 py-1 tracking-tight"
                  title="Sign In to your account"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center justify-center font-bold text-white bg-[#0d6e66] hover:bg-[#0a5852] active:scale-95 transition-all px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-[13px] shadow-sm cursor-pointer border border-[#14837a]"
                  title="Register a new account"
                >
                  Register
                </button>
              </div>
            ) : (
              /* Dynamic Logged-in User Account Dropdown */
              <div className="relative shrink-0" ref={accountMenuRef}>
                {/* Customer Pill Button matching user screenshot (blue pill with green avatar) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountDropdownOpen(prev => !prev);
                  }}
                  className="transition-all flex items-center gap-2 cursor-pointer font-bold px-3 py-1 sm:py-1.5 rounded-full bg-[#1e88e5] hover:bg-[#1976d2] active:scale-95 text-xs sm:text-[13px] shadow-sm tracking-wide border border-white/30 text-white select-none"
                  title={`Signed in as ${activeUser?.name || 'Customer'}`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#00c853] text-[11px] flex items-center justify-center font-bold text-white shadow-xs shrink-0">
                    {(activeCustomerName || activeUser?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold tracking-tight text-white select-none max-w-[140px] sm:max-w-[220px] truncate">
                    {activeCustomerName || activeUser?.name || 'Customer'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white stroke-[2.2] transition-transform duration-200 ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu matching user screenshot exactly */}
                {accountDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px] md:hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountDropdownOpen(false);
                      }}
                    />
                    <div className="absolute right-0 top-full mt-2 w-[260px] sm:w-[275px] max-w-[calc(100vw-20px)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-[100] overflow-hidden text-slate-700 animate-in fade-in zoom-in-95 duration-150 p-2">
                      {/* 1. Manage My Account */}
                      <button
                        type="button"
                        onClick={() => handleCustomerNav('profile')}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-slate-50/90 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-[#0F172A] font-normal transition-colors cursor-pointer group"
                      >
                        <Smile className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors stroke-[1.5] shrink-0" />
                        <span>Manage My Account</span>
                      </button>

                      {/* 2. My Orders */}
                      <button
                        type="button"
                        onClick={() => handleCustomerNav('orders')}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-slate-50/90 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-[#0F172A] font-normal transition-colors cursor-pointer group"
                      >
                        <Package className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors stroke-[1.5] shrink-0" />
                        <span>My Orders</span>
                      </button>

                      {/* 3. My Wishlist & Followed Stores */}
                      <button
                        type="button"
                        onClick={() => handleCustomerNav('wishlist')}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-slate-50/90 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-[#0F172A] font-normal transition-colors cursor-pointer group"
                      >
                        <Heart className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors stroke-[1.5] shrink-0" />
                        <span>My Wishlist &amp; Followed Stores</span>
                      </button>

                      {/* 4. My Reviews */}
                      <button
                        type="button"
                        onClick={() => handleCustomerNav('reviews')}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-slate-50/90 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-[#0F172A] font-normal transition-colors cursor-pointer group"
                      >
                        <svg
                          className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors stroke-current shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9.5" />
                          <polygon points="12 6.8 13.6 10.1 17.2 10.6 14.6 13.1 15.2 16.7 12 15 8.8 16.7 9.4 13.1 6.8 10.6 10.4 10.1 12 6.8" />
                        </svg>
                        <span>My Reviews</span>
                      </button>

                      {/* 5. My Returns & Cancellations */}
                      <button
                        type="button"
                        onClick={() => handleCustomerNav('returns')}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-slate-50/90 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-[#0F172A] font-normal transition-colors cursor-pointer group"
                      >
                        <XCircle className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors stroke-[1.5] shrink-0" />
                        <span>My Returns &amp; Cancellations</span>
                      </button>

                      {/* 6. Log out */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2.5 text-[13px] sm:text-sm hover:bg-rose-50/80 rounded-xl flex items-center gap-3.5 text-[#475569] hover:text-rose-600 font-normal transition-colors cursor-pointer group"
                      >
                        <svg
                          className="w-5 h-5 text-slate-400 group-hover:text-rose-500 stroke-current shrink-0 transition-colors"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 5H17a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7" />
                          <polyline points="7 9 4 12 7 15" />
                          <line x1="4" y1="12" x2="14" y2="12" />
                        </svg>
                        <span>Log out</span>
                      </button>

                      {/* Admin ERP link if user is admin */}
                      {(activeUser?.role === 'admin' || activeUser?.role === 'superadmin') && (
                        <div className="pt-1 mt-1 border-t border-amber-100 bg-amber-50/60 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setAccountDropdownOpen(false);
                              setCurrentView('admin_dashboard');
                              rbacNavigate('/admin');
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs hover:bg-amber-100/70 text-amber-900 flex items-center gap-2.5 font-bold transition-colors cursor-pointer rounded-lg"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Admin ERP Dashboard</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STICKY MAIN HEADER (Sticks firmly at top-0 after the top utility bar scrolls past) */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(79,70,229,0.06)] transition-all w-full">
        {/* MAIN NAVIGATION CONTENT */}
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: 'all', condition: 'all', searchQuery: '' }));
              setCurrentView('home');
            }}
            className="flex items-center group focus:outline-none shrink-0 text-left cursor-pointer"
          >
            <NanoTechLogo size="md" variant="horizontal" />
          </button>

          {/* Integrated Glossy Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl relative items-center"
          >
            <div className="w-full flex items-center bg-slate-50/90 hover:bg-white focus-within:bg-white border border-slate-200/90 rounded-full p-1 pl-4 shadow-inner hover:border-indigo-400/80 focus-within:border-[#4f46e5] focus-within:ring-3 focus-within:ring-indigo-500/15 transition-all">
              {/* Search input */}
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm py-1.5 focus:outline-none"
              />

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer ml-2"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2.5 sm:gap-6">
            {/* Wishlist */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className="flex flex-col items-center group relative text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Wishlist"
            >
              <div className="relative p-1">
                <Heart className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                <span className="absolute -top-1.5 -right-2 bg-[#4f46e5] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount > 0 ? wishlistCount : 1}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 mt-0.5 hidden sm:block">
                {t('wishlist')}
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setCurrentView('cart')}
              className="flex flex-col items-center group relative text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <div className="relative p-1">
                <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                <span className="absolute -top-1.5 -right-2 bg-[#4f46e5] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount > 0 ? cartCount : 3}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 mt-0.5 hidden sm:block">
                {t('cart')}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Direct Search Bar - Visible directly on mobile header just like desktop */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex md:hidden w-full relative items-center mt-2.5"
        >
          <div className="w-full flex items-center bg-slate-50/95 hover:bg-white focus-within:bg-white border border-slate-200/90 rounded-full p-1 pl-3.5 shadow-inner hover:border-indigo-400 focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs py-1.5 focus:outline-none"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer ml-1.5"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 3. SUB-NAVIGATION CATEGORY BAR (Visible on both Desktop and Mobile with Smooth Horizontal Scroll) */}
        <div className="flex items-center justify-between border-t border-slate-200/80 mt-2.5 pt-2 text-xs font-semibold overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth whitespace-nowrap relative">
          <div className="flex items-center gap-4 sm:gap-7 shrink-0">
            {/* Home with active bottom line */}
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, category: 'all', condition: 'all', searchQuery: '' }));
                setCurrentView('home');
              }}
              className={`relative flex items-center gap-1.5 pb-1.5 transition-colors cursor-pointer shrink-0 ${
                currentView === 'home'
                  ? 'text-[#4f46e5] font-bold'
                  : 'text-slate-600 hover:text-[#4f46e5]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#4f46e5]" />
              <span>{t('home')}</span>
              {currentView === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5] rounded-full" />
              )}
            </button>

            {/* Desktops */}
            <button
              onClick={() => handleSelectNavCategory('Desktop PCs')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#4f46e5] transition-colors cursor-pointer shrink-0"
            >
              <Monitor className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('desktops')}</span>
            </button>

            {/* Laptops */}
            <button
              onClick={() => handleSelectNavCategory('Laptops')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#4f46e5] transition-colors cursor-pointer shrink-0"
            >
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('laptops')}</span>
            </button>

            {/* Components Mega Dropdown */}
            <div className="relative shrink-0" ref={componentsMenuRef}>
              <button
                type="button"
                onClick={() => setComponentsDropdownOpen(!componentsDropdownOpen)}
                className={`relative flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-1.5 font-semibold text-xs ${
                  componentsDropdownOpen || filters.category === 'Components' || filters.category.includes('CPU') || filters.category.includes('GPU')
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                {/* Top orange active accent indicator from reference image */}
                {componentsDropdownOpen && (
                  <span className="absolute -top-[10px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
                <Cpu className={`w-3.5 h-3.5 ${componentsDropdownOpen ? 'text-orange-500' : 'text-slate-500'}`} />
                <span>{t('components')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${componentsDropdownOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'}`} />
              </button>

              <ComponentsMegaDropdown
                isOpen={componentsDropdownOpen}
                onClose={() => setComponentsDropdownOpen(false)}
                activeCategory={filters.category}
                onSelectCategory={(catName) => {
                  handleSelectNavCategory(catName);
                  setComponentsDropdownOpen(false);
                }}
                onSelectTag={(tag) => {
                  setFilters(prev => ({ ...prev, searchQuery: tag, category: 'all' }));
                  setCurrentView('products');
                  setComponentsDropdownOpen(false);
                }}
                onOpenPcBuilder={() => {
                  setCurrentView('pc_builder');
                  setComponentsDropdownOpen(false);
                }}
              />
            </div>

            {/* Accessories */}
            <button
              onClick={() => handleSelectNavCategory('Accessories')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#4f46e5] transition-colors cursor-pointer shrink-0"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('accessories')}</span>
            </button>


            {/* Deals */}
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, category: 'all', condition: 'all' }));
                setCurrentView('products');
              }}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer shrink-0"
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('deals')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-3 sm:pl-5 border-l border-slate-200/60">
            <button
              onClick={() => setCurrentView('orders')}
              className="text-slate-600 hover:text-[#4f46e5] transition-colors cursor-pointer shrink-0"
            >
              {t('myOrders')}
            </button>

            <button
              onClick={() => setCurrentView('about')}
              className="text-slate-600 hover:text-[#4f46e5] transition-colors cursor-pointer shrink-0 hidden lg:block"
            >
              {t('about')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Language Selector */}
          <LanguageToggle variant="mobile" />

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t('searchHardware')}
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full h-10 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs pl-4 pr-10 rounded-full focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-10 w-10 text-indigo-600 flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {!isUserLoggedIn ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-100/70 text-[#0d6e66] flex items-center justify-center font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Welcome to NanoTech</span>
                  <span className="text-[11px] text-slate-500 block">Sign in or create your account</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-2 px-3 rounded-full border border-slate-300 text-slate-800 font-bold text-center hover:bg-slate-100 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2 px-3 rounded-full bg-[#0d6e66] hover:bg-[#0a5852] text-white font-bold text-center shadow-xs transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-black">
                  {(activeUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-xs min-w-0 flex-1">
                  <span className="font-extrabold text-slate-900 block truncate uppercase">
                    {activeUser?.name ? activeUser.name.toUpperCase() : 'CUSTOMER'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate font-mono">
                    {activeUser?.email || ''}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-col divide-y divide-slate-100 text-xs">
                {/* 1. Manage My Account */}
                <button
                  type="button"
                  onClick={() => handleCustomerNav('profile')}
                  className="py-2.5 px-2 hover:bg-white text-slate-700 hover:text-slate-900 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <Smile className="w-4 h-4 text-slate-400 stroke-[1.7] shrink-0" />
                  <span>Manage My Account</span>
                </button>

                {/* 2. My Orders */}
                <button
                  type="button"
                  onClick={() => handleCustomerNav('orders')}
                  className="py-2.5 px-2 hover:bg-white text-slate-700 hover:text-slate-900 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <Package className="w-4 h-4 text-slate-400 stroke-[1.7] shrink-0" />
                  <span>My Orders</span>
                </button>

                {/* 3. My Wishlist & Followed Stores */}
                <button
                  type="button"
                  onClick={() => handleCustomerNav('wishlist')}
                  className="py-2.5 px-2 hover:bg-white text-slate-700 hover:text-slate-900 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <Heart className="w-4 h-4 text-slate-400 stroke-[1.7] shrink-0" />
                  <span>My Wishlist &amp; Followed Stores</span>
                </button>

                {/* 4. My Reviews */}
                <button
                  type="button"
                  onClick={() => handleCustomerNav('reviews')}
                  className="py-2.5 px-2 hover:bg-white text-slate-700 hover:text-slate-900 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 stroke-current shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="12 6.5 13.8 10.2 17.8 10.8 14.9 13.6 15.6 17.6 12 15.7 8.4 17.6 9.1 13.6 6.2 10.8 10.2 10.2 12 6.5" />
                  </svg>
                  <span>My Reviews</span>
                </button>

                {/* 5. My Returns & Cancellations */}
                <button
                  type="button"
                  onClick={() => handleCustomerNav('returns')}
                  className="py-2.5 px-2 hover:bg-white text-slate-700 hover:text-slate-900 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <XCircle className="w-4 h-4 text-slate-400 stroke-[1.7] shrink-0" />
                  <span>My Returns &amp; Cancellations</span>
                </button>

                {/* 6. Log out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 px-2 hover:bg-rose-50 text-[#475569] hover:text-rose-600 font-medium flex items-center gap-3 transition-colors cursor-pointer text-left pt-2.5"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-rose-500 stroke-current shrink-0 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 5H17a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7" />
                    <polyline points="7 9 4 12 7 15" />
                    <line x1="4" y1="12" x2="14" y2="12" />
                  </svg>
                  <span>Log out</span>
                </button>

                {/* Admin ERP link if user is admin */}
                {(activeUser?.role === 'admin' || activeUser?.role === 'superadmin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('admin_dashboard');
                      rbacNavigate('/admin');
                    }}
                    className="py-2.5 px-2 bg-amber-50 text-amber-900 font-bold flex items-center gap-2.5 rounded-lg mt-1 cursor-pointer text-left"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Admin ERP Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {onOpenDashboardHub && (
            <button
              onClick={() => {
                onOpenDashboardHub();
                setMobileMenuOpen(false);
              }}
              className="w-full mb-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-sky-500/20 border border-amber-400/40 text-slate-800 flex items-center justify-between text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>⚡ Live Dashboards Hub</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">Switch Live</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> {t('home')}
            </button>
            <button
              onClick={() => {
                setCurrentView('about');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-600" /> {t('about')}
            </button>
            <button
              onClick={() => {
                if (onOpenAiAdvisor) onOpenAiAdvisor();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white flex items-center gap-2.5 font-bold shadow-md cursor-pointer hover:opacity-95 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </div>
              <span>
                {isNepali ? 'ह्वाट्सएप साहुजी च्याट (९८५२०५५३४६)' : 'WhatsApp Shop Owner (9852055346)'}
              </span>
            </button>
          </div>
        </div>
      )}
      </header>
    </div>
  );
}
