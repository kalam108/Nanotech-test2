import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  SellerProfile,
  Product,
  Category,
  CartItem,
  Order,
  Conversation,
  Message,
  Review,
  Report,
  Promotion,
  ToastMessage,
  UserRole,
  ProductCondition,
  CurrencyCode,
  LanguageCode,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_SELLERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_PROMOTIONS,
} from '../data/mockData';
import { PaymentMethodType } from '../components/payment/NepalesePaymentGateway';
import { NEPAL_BANKS, NepalBank } from '../data/nepalBanks';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_PROJECT_ID,
  SUPER_ADMIN_EMAIL,
  testSupabaseConnection,
  signUpWithSupabase,
  signInWithSupabase,
  signOutFromSupabase,
  saveUserProfileToSupabase,
  saveProductToSupabase,
  saveOrderToSupabase,
  saveMessageToSupabase,
  saveReviewToSupabase,
  fetchInitialDataFromSupabase,
  resolveUserRole,
} from '../lib/supabase';
import {
  fetchServerProducts,
  fetchServerOrders,
  createProductOnServer,
  updateProductOnServer,
  deleteProductOnServer,
  createOrderOnServer,
  updateOrderStatusOnServer,
} from '../lib/serverClient';

interface FilterState {
  searchQuery: string;
  category: string;
  condition: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  sortBy: 'relevance' | 'newest' | 'price_low' | 'price_high' | 'rating';
}

interface AppContextType {
  // Current session & state
  currentUser: User;
  sellerProfile: SellerProfile | null;
  isUserAuthenticated: boolean;
  setCurrentUserRole: (role: UserRole) => void;
  loginUser: (email: string, role: UserRole, password?: string, displayName?: string) => Promise<boolean>;
  signupUser: (name: string, email: string, role: UserRole, phone?: string, password?: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;

  // Supabase Status & Sync
  supabaseOnline: boolean;
  supabaseLatency: number;
  isSyncingWithSupabase: boolean;
  syncAllToSupabase: () => Promise<void>;
  pullFromSupabase: () => Promise<void>;

  // Navigation page views
  currentView: string; // 'home' | 'products' | 'product_detail' | 'categories' | 'sell' | 'cart' | 'orders' | 'wishlist' | 'messages' | 'seller_dashboard' | 'admin_dashboard' | 'about' | 'contact' | 'help'
  setCurrentView: (view: string) => void;
  customerDashboardTab: 'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns';
  setCustomerDashboardTab: (tab: 'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Products
  products: Product[];
  addProduct: (productData: Partial<Product>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Partial<Category>) => void;

  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemQuantity?: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist & Compare
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  compareList: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Messages & Chat
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: Record<string, Message[]>; // conversationId -> Message[]
  sendMessage: (conversationId: string, content: string) => void;
  startConversation: (product: Product, initialMessage: string) => string;

  // Reviews & Reports
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string) => void;
  reports: Report[];
  submitReport: (targetType: Report['targetType'], targetId: string, targetTitle: string, reason: Report['reason'], details: string) => void;
  updateReportStatus: (reportId: string, status: Report['status']) => void;

  // Sellers & Users management
  users: User[];
  sellers: SellerProfile[];
  updateUserStatus: (userId: string, status: User['status']) => void;
  updateSellerStatus: (sellerId: string, status: SellerProfile['status']) => void;

  // Promotions
  promotions: Promotion[];
  createPromotion: (productId: string, type: Promotion['type'], budget: number, startDate: string, endDate: string) => void;
  updatePromotionStatus: (promotionId: string, status: Promotion['status']) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeToast: (id: string) => void;

  // Auth Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;

  // Add to Cart Payment Gateway Modal
  isAddToCartModalOpen: boolean;
  setIsAddToCartModalOpen: (open: boolean) => void;
  lastAddedProduct: Product | null;
  lastAddedQuantity: number;
  openAddToCartModal: (product: Product, quantity?: number) => void;

  // Checkout Modal State
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutInitialMethod: PaymentMethodType;
  setCheckoutInitialMethod: (method: PaymentMethodType) => void;
  checkoutInitialBank: NepalBank;
  setCheckoutInitialBank: (bank: NepalBank) => void;
  openCheckoutModalWithPayment: (method?: PaymentMethodType, bank?: NepalBank) => void;

  // Live Dashboards Hub Modal State
  isDashboardHubOpen: boolean;
  setIsDashboardHubOpen: (open: boolean) => void;
  openDashboardHub: () => void;
  closeDashboardHub: () => void;

  // Currency & Exchange Rate System (Nepali Rupees NPR and USD)
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  showDualCurrency: boolean;
  setShowDualCurrency: (show: boolean) => void;
  currencySymbol: string;
  formatPrice: (usdAmount: number, options?: { showBoth?: boolean; compact?: boolean; targetCurrency?: CurrencyCode }) => string;
  formatPricePrimary: (usdAmount: number, targetCurrency?: CurrencyCode) => string;
  formatPriceSecondary: (usdAmount: number, targetCurrency?: CurrencyCode) => string;
  convertPrice: (usdAmount: number, targetCurrency?: CurrencyCode) => number;
  convertFromNPR: (nprAmount: number) => number;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  condition: 'all',
  brand: 'all',
  minPrice: 0,
  maxPrice: 5000,
  location: 'all',
  sortBy: 'relevance',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for safely parsing LocalStorage JSON with guaranteed fallback
function safeJsonParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state from LocalStorage if available with safe fallback
  const [users, setUsers] = useState<User[]>(() => safeJsonParse('nanotech_users', INITIAL_USERS));

  const [sellers, setSellers] = useState<SellerProfile[]>(() => safeJsonParse('nanotech_sellers', INITIAL_SELLERS));

  const [currentUser, setCurrentUser] = useState<User>(() => safeJsonParse('nanotech_current_user', INITIAL_USERS[3])); // Alex Rivera (Customer)

  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('nanotech_session_token') || !!localStorage.getItem('nanotech_user');
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [customerDashboardTab, setCustomerDashboardTab] = useState<'profile' | 'orders' | 'wishlist' | 'reviews' | 'returns'>('profile');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_products');
      if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_PRODUCTS;
      const parsed: Product[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;
      const existingIds = new Set(parsed.map(p => p.id));
      const missingInitial = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
      return [...parsed, ...missingInitial];
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_categories');
      if (!saved || saved === 'undefined' || saved === 'null') return INITIAL_CATEGORIES;
      const parsed: Category[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_CATEGORIES;
      const existingIds = new Set(parsed.map(c => c.id));
      const missingInitial = INITIAL_CATEGORIES.filter(c => !existingIds.has(c.id));
      return [...parsed, ...missingInitial];
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [cart, setCart] = useState<CartItem[]>(() => safeJsonParse('nanotech_cart', []));

  const [wishlist, setWishlist] = useState<string[]>(() => safeJsonParse('nanotech_wishlist', ['prod-1', 'prod-3']));

  const [compareList, setCompareList] = useState<string[]>(() => safeJsonParse('nanotech_compare', ['prod-2']));

  const [orders, setOrders] = useState<Order[]>(() => safeJsonParse('nanotech_orders', INITIAL_ORDERS));

  const [conversations, setConversations] = useState<Conversation[]>(() => safeJsonParse('nanotech_conversations', INITIAL_CONVERSATIONS));

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const fallback: Record<string, Message[]> = {
      'conv-1': [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-customer-1',
          senderName: 'Alex Rivera',
          content: 'Hi! Is local pickup available today for the RTX 4080 Super?',
          createdAt: '2026-08-11T14:30:00Z',
          isRead: true,
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          senderId: 'user-seller-1',
          senderName: 'Apex Tech Solutions',
          content: 'Hello Alex! Yes, local pickup is available at our San Jose shop until 6 PM today. Let us know if you want us to reserve it for you.',
          createdAt: '2026-08-11T14:35:00Z',
          isRead: true,
        },
      ],
    };
    return safeJsonParse('nanotech_messages', fallback);
  });

  const [reviews, setReviews] = useState<Review[]>(() => safeJsonParse('nanotech_reviews', INITIAL_REVIEWS));

  const [reports, setReports] = useState<Report[]>(() => safeJsonParse('nanotech_reports', INITIAL_REPORTS));

  const [promotions, setPromotions] = useState<Promotion[]>(() => safeJsonParse('nanotech_promotions', INITIAL_PROMOTIONS));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Support direct testing links like ?auth=signup or ?auth=login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam === 'signup' || authParam === 'register') {
        openAuthModal('signup');
      } else if (authParam === 'login' || authParam === 'signin') {
        openAuthModal('login');
      }
    }
  }, []);

  // Add to Cart Payment Gateway Modal State
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [lastAddedQuantity, setLastAddedQuantity] = useState<number>(1);

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutInitialMethod, setCheckoutInitialMethod] = useState<PaymentMethodType>('esewa');
  const [checkoutInitialBank, setCheckoutInitialBank] = useState<NepalBank>(NEPAL_BANKS[0]);

  const openAddToCartModal = (product: Product, quantity: number = 1) => {
    setLastAddedProduct(product);
    setLastAddedQuantity(quantity);
    setIsAddToCartModalOpen(true);
  };

  const openCheckoutModalWithPayment = (method?: PaymentMethodType, bank?: NepalBank) => {
    if (method) setCheckoutInitialMethod(method);
    if (bank) setCheckoutInitialBank(bank);
    setIsCheckoutModalOpen(true);
  };

  // Live Dashboards Hub Modal State
  const [isDashboardHubOpen, setIsDashboardHubOpen] = useState(false);
  const openDashboardHub = () => setIsDashboardHubOpen(true);
  const closeDashboardHub = () => setIsDashboardHubOpen(false);

  // Language & Currency State (English Default & Nepali)
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('nanotech_language');
      return (saved === 'EN' || saved === 'NP') ? saved : 'EN';
    } catch {
      return 'EN';
    }
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('nanotech_language', newLang);
    } catch {}
  };

  // Currency & Exchange Rate State (Nepali Rupees NPR & USD)
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('nanotech_currency');
      return (saved === 'USD' || saved === 'NPR') ? saved : 'NPR';
    } catch {
      return 'NPR';
    }
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nanotech_exchange_rate');
      const parsed = saved ? parseFloat(saved) : 135.50;
      return !isNaN(parsed) && parsed > 0 ? parsed : 135.50; // 1 USD = 135.50 NPR
    } catch {
      return 135.50;
    }
  });

  const [showDualCurrency, setShowDualCurrencyState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nanotech_dual_currency');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('nanotech_currency', newCurrency);
    } catch {}
  };

  const setExchangeRate = (newRate: number) => {
    if (newRate > 0) {
      setExchangeRateState(newRate);
      try {
        localStorage.setItem('nanotech_exchange_rate', newRate.toString());
      } catch {}
    }
  };

  const setShowDualCurrency = (show: boolean) => {
    setShowDualCurrencyState(show);
    try {
      localStorage.setItem('nanotech_dual_currency', show.toString());
    } catch {}
  };

  const currencySymbol = currency === 'NPR' ? 'रु' : '$';

  /**
   * Universal price formatter supporting Nepali Rupees (NPR) and US Dollars (USD)
   * Base prices stored across the app are in USD standard units.
   */
  const formatPrice = (
    usdAmount: number,
    options?: {
      showBoth?: boolean;
      compact?: boolean;
      targetCurrency?: CurrencyCode;
    }
  ): string => {
    const activeCurr = options?.targetCurrency || currency;
    const num = typeof usdAmount === 'number' && !isNaN(usdAmount) ? usdAmount : 0;
    const shouldShowDual = options?.showBoth !== undefined ? options.showBoth : showDualCurrency;

    if (activeCurr === 'NPR') {
      const nprVal = Math.round(num * exchangeRate);
      const formattedNpr = `रु ${nprVal.toLocaleString('en-IN')}`;
      if (shouldShowDual) {
        return `${formattedNpr} ($${num.toFixed(2)})`;
      }
      return formattedNpr;
    } else {
      const formattedUsd = `$${num.toFixed(2)}`;
      if (shouldShowDual) {
        const nprVal = Math.round(num * exchangeRate);
        return `${formattedUsd} (रु ${nprVal.toLocaleString('en-IN')})`;
      }
      return formattedUsd;
    }
  };

  const formatPricePrimary = (
    usdAmount: number,
    targetCurrency?: CurrencyCode
  ): string => {
    const activeCurr = targetCurrency || currency;
    const num = typeof usdAmount === 'number' && !isNaN(usdAmount) ? usdAmount : 0;
    if (activeCurr === 'NPR') {
      const nprVal = Math.round(num * exchangeRate);
      return `रु ${nprVal.toLocaleString('en-IN')}`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatPriceSecondary = (
    usdAmount: number,
    targetCurrency?: CurrencyCode
  ): string => {
    const activeCurr = targetCurrency || currency;
    const num = typeof usdAmount === 'number' && !isNaN(usdAmount) ? usdAmount : 0;
    if (activeCurr === 'NPR') {
      return `$${num.toFixed(2)} USD`;
    }
    const nprVal = Math.round(num * exchangeRate);
    return `रु ${nprVal.toLocaleString('en-IN')} NPR`;
  };

  const convertPrice = (usdAmount: number, targetCurrency?: CurrencyCode): number => {
    const activeCurr = targetCurrency || currency;
    const num = typeof usdAmount === 'number' && !isNaN(usdAmount) ? usdAmount : 0;
    return activeCurr === 'NPR' ? Math.round(num * exchangeRate) : num;
  };

  const convertFromNPR = (nprAmount: number): number => {
    const num = typeof nprAmount === 'number' && !isNaN(nprAmount) ? nprAmount : 0;
    return Number((num / exchangeRate).toFixed(2));
  };

  // Supabase Online Status & Latency
  const [supabaseOnline, setSupabaseOnline] = useState<boolean>(true);
  const [supabaseLatency, setSupabaseLatency] = useState<number>(120);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState<boolean>(false);

  // Check Supabase Connectivity on mount and subscribe to auth changes
  useEffect(() => {
    let isMounted = true;

    async function initSupabase() {
      const health = await testSupabaseConnection();
      if (isMounted) {
        setSupabaseOnline(health.ok);
        setSupabaseLatency(health.latencyMs);
      }

      // Try pulling initial database data if available
      try {
        const remoteData = await fetchInitialDataFromSupabase();
        if (isMounted) {
          if (remoteData.products && remoteData.products.length > 0) {
            setProducts(prev => {
              const map = new Map(prev.map(p => [p.id, p]));
              remoteData.products!.forEach(p => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
          if (remoteData.profiles && remoteData.profiles.length > 0) {
            setUsers(prev => {
              const map = new Map(prev.map(u => [u.id, u]));
              remoteData.profiles!.forEach(u => map.set(u.id, u));
              return Array.from(map.values());
            });
          }
          if (remoteData.sellers && remoteData.sellers.length > 0) {
            setSellers(prev => {
              const map = new Map(prev.map(s => [s.id, s]));
              remoteData.sellers!.forEach(s => map.set(s.id, s));
              return Array.from(map.values());
            });
          }
          if (remoteData.orders && remoteData.orders.length > 0) {
            setOrders(prev => {
              const map = new Map(prev.map(o => [o.id, o]));
              remoteData.orders!.forEach(o => map.set(o.id, o));
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        console.warn('Supabase initial fetch bypassed:', err);
      }
    }

    initSupabase();

    // Hydrate from Express Backend Server
    async function initBackendServer() {
      try {
        const serverProds = await fetchServerProducts();
        if (isMounted && serverProds && serverProds.length > 0) {
          setProducts(prev => {
            const map = new Map(prev.map(p => [p.id, p]));
            serverProds.forEach(p => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
        const serverOrds = await fetchServerOrders();
        if (isMounted && serverOrds && serverOrds.length > 0) {
          setOrders(prev => {
            const map = new Map(prev.map(o => [o.id, o]));
            serverOrds.forEach(o => map.set(o.id, o));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Backend server initial hydrate bypassed:', err);
      }
    }

    initBackendServer();

    // Supabase Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email || '';
        let userRole: UserRole = 'customer';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.role) {
            userRole = (profile.role as UserRole) || 'customer';
          }
        } catch {
          userRole = 'customer';
        }

        const meta = session.user.user_metadata || {};
        const metaFullName =
          meta.full_name ||
          [meta.first_name, meta.middle_name, meta.last_name].filter(Boolean).join(' ') ||
          meta.name ||
          'Customer';

        setCurrentUser(prev => {
          if (prev.email.toLowerCase() === userEmail.toLowerCase() && prev.name === metaFullName && prev.role === userRole) return prev;
          return {
            id: session.user.id,
            name: metaFullName,
            email: userEmail,
            role: userRole,
            status: 'active',
            createdAt: session.user.created_at || new Date().toISOString(),
          };
        });

        if (session.access_token) {
          localStorage.setItem('nanotech_session_token', session.access_token);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync all local records into Supabase Database
  const syncAllToSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      addToast('info', 'Syncing catalog & accounts to Supabase...');
      // Sync profiles & sellers
      for (const u of users) {
        const s = sellers.find(sel => sel.userId === u.id) || null;
        await saveUserProfileToSupabase(u, s);
      }
      // Sync products
      for (const p of products) {
        await saveProductToSupabase(p);
      }
      // Sync orders
      for (const o of orders) {
        await saveOrderToSupabase(o);
      }
      // Sync reviews
      for (const r of reviews) {
        await saveReviewToSupabase(r);
      }
      addToast('success', `All records synced to Supabase (${SUPABASE_PROJECT_ID})!`);
    } catch (err: any) {
      addToast('error', `Sync notice: ${err?.message || 'Check database table permissions'}`);
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // Pull latest records from Supabase
  const pullFromSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      const data = await fetchInitialDataFromSupabase();
      if (data.products && data.products.length > 0) setProducts(data.products);
      if (data.profiles && data.profiles.length > 0) setUsers(data.profiles);
      if (data.sellers && data.sellers.length > 0) setSellers(data.sellers);
      if (data.orders && data.orders.length > 0) setOrders(data.orders);
      if (data.reviews && data.reviews.length > 0) setReviews(data.reviews);
      addToast('success', 'Refreshed latest data from Supabase!');
    } catch (err: any) {
      addToast('error', `Pull failed: ${err?.message}`);
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // Persistence effects with safe try-catch
  useEffect(() => { try { localStorage.setItem('nanotech_users', JSON.stringify(users)); } catch {} }, [users]);
  useEffect(() => { try { localStorage.setItem('nanotech_sellers', JSON.stringify(sellers)); } catch {} }, [sellers]);
  useEffect(() => { try { localStorage.setItem('nanotech_current_user', JSON.stringify(currentUser)); } catch {} }, [currentUser]);
  useEffect(() => { try { localStorage.setItem('nanotech_products', JSON.stringify(products)); } catch {} }, [products]);
  useEffect(() => { try { localStorage.setItem('nanotech_categories', JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { try { localStorage.setItem('nanotech_cart', JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem('nanotech_wishlist', JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { try { localStorage.setItem('nanotech_orders', JSON.stringify(orders)); } catch {} }, [orders]);
  useEffect(() => { try { localStorage.setItem('nanotech_conversations', JSON.stringify(conversations)); } catch {} }, [conversations]);
  useEffect(() => { try { localStorage.setItem('nanotech_messages', JSON.stringify(messages)); } catch {} }, [messages]);
  useEffect(() => { try { localStorage.setItem('nanotech_reviews', JSON.stringify(reviews)); } catch {} }, [reviews]);
  useEffect(() => { try { localStorage.setItem('nanotech_reports', JSON.stringify(reports)); } catch {} }, [reports]);
  useEffect(() => { try { localStorage.setItem('nanotech_promotions', JSON.stringify(promotions)); } catch {} }, [promotions]);

  // Seller profile lookup
  const sellerProfile = sellers.find(s => s.userId === currentUser.id) || null;

  // Toast helper
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth actions
  const setCurrentUserRole = (role: UserRole) => {
    let matchedUser = users.find(u => u.role === role);
    if (!matchedUser) {
      matchedUser = {
        id: `user-${role}-${Date.now()}`,
        name: role === 'admin' ? 'NanoTech Admin' : role === 'seller' ? 'Apex Tech Solutions' : 'Alex Rivera',
        email: role === 'admin' ? SUPER_ADMIN_EMAIL : `${role}@nanotech.com`,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, matchedUser!]);
    }
    setCurrentUser(matchedUser);
    addToast('info', `Switched active perspective to ${role.toUpperCase()}`);
  };

  const loginUser = async (
    email: string,
    requestedRole: UserRole,
    password?: string,
    displayName?: string
  ): Promise<boolean> => {
    const finalRole = resolveUserRole(email, requestedRole);
    let signedInUser: User | null = null;
    let signedInSeller: SellerProfile | null = null;

    // Authenticate strictly with Supabase Auth
    if (password) {
      try {
        const result = await signInWithSupabase(email, password);
        signedInUser = result.user;
        signedInSeller = result.seller || null;
      } catch (err: any) {
        addToast('error', err?.message || 'Supabase authentication failed');
        return false;
      }
    }

    if (!signedInUser) {
      addToast('error', 'Authentication failed. Please verify your credentials.');
      return false;
    }

    if (displayName) {
      signedInUser.name = displayName;
    }

    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase() !== email.toLowerCase());
      return [...filtered, signedInUser!];
    });
    setCurrentUser(signedInUser);
    try {
      localStorage.setItem('nanotech_current_user', JSON.stringify(signedInUser));
      localStorage.setItem('nanotech_user', JSON.stringify(signedInUser));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('nanotech_session_token', session.access_token);
      }
    } catch {
      // ignore
    }
    setIsUserAuthenticated(true);

    if (signedInUser.role === 'seller' && !sellers.find(s => s.userId === signedInUser!.id)) {
      const newSeller: SellerProfile = signedInSeller || {
        id: `seller-${signedInUser.id}`,
        userId: signedInUser.id,
        storeName: `${signedInUser.name} Store`,
        phone: '+1 (555) 000-0000',
        location: 'San Jose, CA',
        status: 'verified',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      setSellers(prev => [...prev, newSeller]);
    }

    // Save profile to Supabase Database
    saveUserProfileToSupabase(signedInUser, signedInSeller);

    addToast('success', `Welcome back, ${signedInUser.name}! (${signedInUser.role.toUpperCase()})`);
    setIsAuthModalOpen(false);
    return true;
  };

  const signupUser = async (
    name: string,
    email: string,
    requestedRole: UserRole,
    phone?: string,
    password?: string
  ): Promise<boolean> => {
    const finalRole = resolveUserRole(email, requestedRole);
    let createdUser: User | null = null;
    let createdSeller: SellerProfile | null = null;

    // 1. Attempt Supabase Auth registration
    if (password) {
      try {
        const result = await signUpWithSupabase(email, password, {
          fullName: name,
          role: finalRole,
          phone,
          storeName: `${name} Hardware Studio`,
        });
        createdUser = result.user;
        createdSeller = result.seller || null;
      } catch (err: any) {
        console.warn('Supabase signup direct note:', err?.message);
      }
    }

    if (!createdUser) {
      addToast('error', 'Registration failed with Supabase.');
      return false;
    }

    setUsers(prev => [...prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()), createdUser!]);
    setCurrentUser(createdUser);

    try {
      localStorage.setItem('nanotech_current_user', JSON.stringify(createdUser));
      localStorage.setItem('nanotech_user', JSON.stringify(createdUser));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('nanotech_session_token', session.access_token);
      }
    } catch {
      // ignore
    }
    setIsUserAuthenticated(true);

    if (createdSeller) {
      setSellers(prev => [...prev.filter(s => s.userId !== createdUser!.id), createdSeller!]);
    }

    // Background sync to Supabase
    saveUserProfileToSupabase(createdUser, createdSeller);

    addToast('success', `Welcome to NanoTech, ${name}!`);
    setIsAuthModalOpen(false);
    return true;
  };

  const logoutUser = async () => {
    await signOutFromSupabase();
    try {
      localStorage.removeItem('nanotech_current_user');
      localStorage.removeItem('nanotech_user');
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_admin_session');
    } catch {
      // ignore
    }
    setIsUserAuthenticated(false);
    // Default to customer guest
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@nanotech.com',
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(guestUser);
    addToast('info', 'Logged out successfully from session');
  };

  // Filter actions
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Cart actions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    setLastAddedProduct(product);
    setLastAddedQuantity(quantity);
    setIsAddToCartModalOpen(true);
    addToast('success', `Added "${product.title}" to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addToast('info', 'Item removed from cart');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      let updated: string[];
      if (prev.includes(productId)) {
        addToast('info', 'Removed from Wishlist');
        updated = prev.filter(id => id !== productId);
      } else {
        addToast('success', 'Saved to Wishlist');
        updated = [...prev, productId];
      }
      localStorage.setItem('nanotech_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Compare actions
  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      let updated: string[];
      if (prev.includes(productId)) {
        addToast('info', 'Removed from Compare list');
        updated = prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          addToast('error', 'You can compare maximum 4 products at once.');
          return prev;
        }
        addToast('success', 'Added to Comparison');
        updated = [...prev, productId];
      }
      localStorage.setItem('nanotech_compare', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('nanotech_compare');
    addToast('info', 'Comparison cleared');
  };

  // Products
  const addProduct = (productData: Partial<Product>): Product => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: productData.title || 'Untitled Accessory',
      slug: (productData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: productData.description || '',
      price: productData.price || 0,
      originalPrice: productData.originalPrice || productData.price,
      discountPercent: productData.discountPercent || 0,
      condition: productData.condition || 'New',
      category: productData.category || 'Computer Accessories',
      brand: productData.brand || 'Generic',
      stock: productData.stock ?? 1,
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'],
      specifications: productData.specifications || [],
      warranty: productData.warranty || '6 Month Seller Warranty',
      location: productData.location || 'San Jose, CA',
      deliveryOptions: productData.deliveryOptions || 'Courier Delivery Available',
      contactPreference: productData.contactPreference || 'Website Chat & Phone',
      sellerId: sellerProfile ? sellerProfile.id : 'seller-1',
      sellerName: sellerProfile ? sellerProfile.storeName : currentUser.name,
      sellerRating: sellerProfile ? sellerProfile.rating : 5.0,
      sellerVerified: true,
      sellerWhatsapp: sellerProfile?.whatsapp || '15552345678',
      sellerFacebook: sellerProfile?.facebookUrl || 'https://facebook.com/nanotech',
      status: productData.status || 'published',
      isFeatured: productData.isFeatured ?? false,
      isSponsored: productData.isSponsored ?? false,
      viewsCount: 1,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // Update seller categories count
    setCategories(prev => prev.map(cat => cat.name === newProduct.category ? { ...cat, productCount: cat.productCount + 1 } : cat));

    // Save to Supabase
    saveProductToSupabase(newProduct);
    // Persist to Express Server
    createProductOnServer(newProduct).catch(err => console.warn('Server createProduct background note:', err));

    addToast('success', `Product "${newProduct.title}" published successfully!`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const found = updated.find(p => p.id === id);
      if (found) {
        saveProductToSupabase(found);
        updateProductOnServer(id, found).catch(err => console.warn('Server updateProduct note:', err));
      }
      return updated;
    });
    addToast('success', 'Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteProductOnServer(id).catch(err => console.warn('Server deleteProduct note:', err));
    addToast('info', 'Product removed from marketplace');
  };

  const addCategory = (categoryData: Partial<Category>) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug: (categoryData.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      iconName: categoryData.iconName || 'Box',
      description: categoryData.description || 'Category description',
      productCount: 0,
      featured: categoryData.featured ?? false,
    };
    setCategories(prev => [...prev, newCat]);
    addToast('success', `Category "${newCat.name}" added`);
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: `NT-${Math.floor(1000000 + Math.random() * 9000000)}-US`,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Save to Supabase
    saveOrderToSupabase(newOrder);
    // Persist to Express Server
    createOrderOnServer(newOrder).catch(err => console.warn('Server createOrder note:', err));

    addToast('success', `Order #${newOrder.id} placed & stored in Supabase & Server!`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o);
      const found = updated.find(o => o.id === orderId);
      if (found) {
        saveOrderToSupabase(found);
        updateOrderStatusOnServer(orderId, status).catch(err => console.warn('Server order status note:', err));
      }
      return updated;
    });
    addToast('info', `Order #${orderId} status changed to ${status.toUpperCase()}`);
  };

  // Messaging & Chat
  const sendMessage = (conversationId: string, content: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: content,
      updatedAt: new Date().toISOString(),
    } : c));

    // Save to Supabase
    saveMessageToSupabase(newMsg);
  };

  const startConversation = (product: Product, initialMessage: string): string => {
    // Check if conversation exists
    let existing = conversations.find(c => c.productId === product.id && c.buyerId === currentUser.id);
    if (existing) {
      sendMessage(existing.id, initialMessage);
      setActiveConversationId(existing.id);
      setCurrentView('messages');
      return existing.id;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] || '',
      productPrice: product.price,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      lastMessage: initialMessage,
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
    };

    setConversations(prev => [newConv, ...prev]);
    sendMessage(newConvId, initialMessage);
    setActiveConversationId(newConvId);
    setCurrentView('messages');
    addToast('success', 'Message sent to seller!');
    return newConvId;
  };

  // Reviews
  const addReview = (productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      rating,
      comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate rating on product
    const prodReviews = [...reviews, newReview].filter(r => r.productId === productId);
    const avgRating = prodReviews.length > 0 
      ? Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
      : 4.8;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, sellerRating: avgRating } : p));
    addToast('success', 'Thank you! Review submitted.');
  };

  // Reports
  const submitReport = (
    targetType: Report['targetType'],
    targetId: string,
    targetTitle: string,
    reason: Report['reason'],
    details: string
  ) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      targetType,
      targetId,
      targetTitle,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports(prev => [newReport, ...prev]);
    addToast('success', 'Report submitted to moderators for investigation.');
  };

  const updateReportStatus = (reportId: string, status: Report['status']) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    addToast('info', `Report #${reportId} status set to ${status.toUpperCase()}`);
  };

  // Admin user & seller status updates
  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    addToast('info', `User status updated to ${status}`);
  };

  const updateSellerStatus = (sellerId: string, status: SellerProfile['status']) => {
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status, verifiedAt: status === 'verified' ? new Date().toISOString() : s.verifiedAt } : s));
    addToast('info', `Seller status updated to ${status}`);
  };

  // Promotions
  const createPromotion = (
    productId: string,
    type: Promotion['type'],
    budget: number,
    startDate: string,
    endDate: string
  ) => {
    const product = products.find(p => p.id === productId);
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      productId,
      productTitle: product ? product.title : 'Product',
      productImage: product ? product.images?.[0] || '' : '',
      sellerId: sellerProfile ? sellerProfile.id : 'seller-1',
      sellerName: sellerProfile ? sellerProfile.storeName : currentUser.name,
      type,
      budget,
      startDate,
      endDate,
      status: 'active',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };

    setPromotions(prev => [newPromo, ...prev]);

    // Apply boost flag on product
    if (type === 'featured') {
      updateProduct(productId, { isFeatured: true });
    } else if (type === 'sponsored') {
      updateProduct(productId, { isSponsored: true });
    }

    addToast('success', `Promotion campaign created for $${budget}!`);
  };

  const updatePromotionStatus = (promotionId: string, status: Promotion['status']) => {
    setPromotions(prev => prev.map(p => p.id === promotionId ? { ...p, status } : p));
    addToast('info', `Promotion campaign status updated to ${status.toUpperCase()}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        sellerProfile,
        isUserAuthenticated,
        setCurrentUserRole,
        loginUser,
        signupUser,
        logoutUser,
        supabaseOnline,
        supabaseLatency,
        isSyncingWithSupabase,
        syncAllToSupabase,
        pullFromSupabase,
        currentView,
        setCurrentView,
        customerDashboardTab,
        setCustomerDashboardTab,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        filters,
        setFilters,
        resetFilters,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemQuantity: updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        clearCompare,
        orders,
        createOrder,
        updateOrderStatus,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        sendMessage,
        startConversation,
        reviews,
        addReview,
        reports,
        submitReport,
        updateReportStatus,
        users,
        sellers,
        updateUserStatus,
        updateSellerStatus,
        promotions,
        createPromotion,
        updatePromotionStatus,
        toasts,
        addToast,
        removeToast,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        isAddToCartModalOpen,
        setIsAddToCartModalOpen,
        lastAddedProduct,
        lastAddedQuantity,
        openAddToCartModal,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutInitialMethod,
        setCheckoutInitialMethod,
        checkoutInitialBank,
        setCheckoutInitialBank,
        openCheckoutModalWithPayment,
        isDashboardHubOpen,
        setIsDashboardHubOpen,
        openDashboardHub,
        closeDashboardHub,
        language,
        setLanguage,
        currency,
        setCurrency,
        exchangeRate,
        setExchangeRate,
        showDualCurrency,
        setShowDualCurrency,
        currencySymbol,
        formatPrice,
        formatPricePrimary,
        formatPriceSecondary,
        convertPrice,
        convertFromNPR,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
