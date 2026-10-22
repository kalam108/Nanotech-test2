export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended';

export type SellerStatus = 'pending' | 'verified' | 'approved' | 'suspended' | 'rejected';

export type CurrencyCode = 'NPR' | 'USD';
export type LanguageCode = 'EN' | 'NP';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  rateToUsd: number; // 1 USD = X NPR
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  bio?: string;
  description?: string;
  logoUrl?: string;
  phone: string;
  whatsapp?: string;
  facebookUrl?: string;
  location: string;
  status: SellerStatus;
  rating: number;
  reviewCount: number;
  verified?: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export type ProductCondition = 'New' | 'Used' | 'Refurbished';

export type ProductStatus = 'published' | 'pending' | 'draft' | 'sold' | 'out_of_stock' | 'suspended';

export interface ProductSpecification {
  key: string;
  value: string;
}

export type NepalPriceStatus = 'verified' | 'estimated' | 'out_of_stock' | 'discontinued' | 'trending' | 'sale' | 'new';

export type HardwareSubcategory =
  | 'student_laptop'
  | 'gaming_laptop'
  | 'creator_laptop'
  | 'ai_copilot_laptop'
  | 'business_laptop'
  | 'desktop_pc'
  | 'mini_pc'
  | 'all_in_one'
  | 'cpu_processor'
  | 'graphics_card_gpu'
  | 'motherboard'
  | 'ram_memory'
  | 'ssd_storage'
  | 'hdd_storage'
  | 'gaming_monitor'
  | 'creator_4k_monitor'
  | 'office_monitor'
  | 'mechanical_keyboard'
  | 'gaming_mouse'
  | 'headphones_audio'
  | 'webcam_streaming'
  | 'cpu_cooler'
  | 'power_supply_psu'
  | 'pc_case'
  | 'ups_power'
  | 'networking_wifi'
  | 'apple_macbook'
  | 'apple_desktop'
  | 'printer_scanner'
  | 'gaming_gear'
  | 'accessories';

export interface PriceHistoryPoint {
  date: string;
  priceNpr: number;
  source: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number; // base price in NPR (or normalized)
  originalPrice?: number; // MRP in NPR
  discountPercent?: number;
  condition: ProductCondition;
  category: string;
  subcategory?: HardwareSubcategory;
  brand: string;
  stock: number;
  stockQuantity?: number;
  imageUrl?: string;
  model?: string;
  images: string[];
  specifications: ProductSpecification[];
  warranty?: string;
  location: string;
  deliveryOptions: string;
  contactPreference?: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  sellerWhatsapp?: string;
  sellerFacebook?: string;
  status: ProductStatus;
  isFeatured?: boolean;
  isSponsored?: boolean;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;

  // Master Prompt Nepal Market Intelligence Extensions
  nepalPriceStatus?: NepalPriceStatus;
  nepalOfficialDistributor?: string;
  nepalPriceSource?: string;
  nepalLastUpdated?: string;
  minPriceNpr?: number;
  maxPriceNpr?: number;
  importedPriceNpr?: number;
  officialPriceNpr?: number;
  resellerPriceNpr?: number;
  nepalStockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
  useCases?: string[]; // e.g. ['BCA student', 'programming', 'gaming', 'video editing', 'AI/ML']
  pros?: string[];
  cons?: string[];
  upgradeOptions?: string;
  powerWatts?: number; // For PC builder PSU calculations
  socket?: string; // e.g. AM5, LGA1700, LGA1851
  chipsetSupport?: string[]; // e.g. ['B650', 'X670', 'Z790']
  memoryType?: 'DDR4' | 'DDR5' | 'LPDDR5X' | 'Unified';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  priceHistory?: PriceHistoryPoint[];
  trendingScore?: number;
  performanceScore?: number; // 1-100 index
  valueScore?: number; // 1-100 index
}

export interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  country: string;
  logo: string;
  website: string;
  authorizedDistributorsNepal: string[];
  nepalAvailability: 'Widely Available' | 'Moderate' | 'Imported / Limited';
  warrantyTermsNepal: string;
  serviceCentersNepal: string[];
  popularCategories: string[];
  marketPosition: string;
  priceRangeNpr: string;
  brandRating: number;
  reliabilityNotes: string;
}

export interface NepalSellerStore {
  id: string;
  name: string;
  hub: 'Itahari' | 'Putalisadak' | 'New Road' | 'Kamaladi' | 'Banepa' | 'Pokhara' | 'Chitwan' | 'Biratnagar';
  address: string;
  phone: string;
  whatsapp: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  yandexMap?: string;
  cybo?: string;
  coordinates?: { lat: number; lon: number };
  isAuthorized: boolean;
  authorizedBrands: string[];
  rating: number;
  reviewsCount: number;
  warrantyPolicy: string;
  openingHours: string;
  establishedYear: number;
}

export type PCBuilderPartKey =
  | 'cpu'
  | 'cooler'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'hdd'
  | 'psu'
  | 'pcCase'
  | 'caseFans'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'ups';

export interface PCBuildState {
  cpu: Product | null;
  cooler: Product | null;
  motherboard: Product | null;
  ram: Product | null;
  gpu: Product | null;
  ssd: Product | null;
  hdd: Product | null;
  psu: Product | null;
  pcCase: Product | null;
  caseFans: Product | null;
  monitor: Product | null;
  keyboard: Product | null;
  mouse: Product | null;
  ups: Product | null;
}

export interface CompatibilityCheckItem {
  key: string;
  title: string;
  isCompatible: boolean;
  details: string;
  severity: 'success' | 'warning' | 'error';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  icon?: string;
  imageUrl?: string;
  description: string;
  productCount: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

export interface OrderItem {
  productId: string;
  productTitle: string;
  title?: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  street?: string;
  city: string;
  state?: string;
  postalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export type ReportReason = 'fake_product' | 'scam' | 'incorrect_info' | 'offensive' | 'duplicate' | 'suspicious_seller' | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'seller' | 'user';
  targetId: string;
  targetTitle: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export type PromotionType = 'featured' | 'homepage_boost' | 'search_boost' | 'category_boost' | 'sponsored';

export type PromotionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected';

export interface Promotion {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  type: PromotionType;
  budget: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
