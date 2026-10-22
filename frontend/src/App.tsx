import React, { useState } from 'react';
import { ServerProvider } from './context/ServerContext';
import { AppProvider, useApp } from './context/AppContext';
import { AdminProvider } from './context/AdminContext';
import { RBACProvider } from './context/RBACContext';
import { AppRouter } from './components/rbac/AppRouter';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { WhatsAppFloatingButton } from './components/layout/WhatsAppFloatingButton';
import { WhatsAppSellerChatModal } from './components/common/WhatsAppSellerChatModal';
import { AuthModal } from './components/auth/AuthModal';
import { AddToCartPaymentModal } from './components/cart/AddToCartPaymentModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { ServerDiagnosticsModal } from './components/common/ServerConnectivityStatus';
import { LiveDashboardHubModal } from './components/common/LiveDashboardHubModal';
import { LayoutDashboard } from 'lucide-react';

// Pages & Views
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { UserOrdersPage } from './components/orders/UserOrdersPage';
import { ChatView } from './components/chat/ChatView';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SellPage } from './pages/SellPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { PCBuilderPage } from './pages/PCBuilderPage';
import { BrandsPage } from './pages/BrandsPage';
import { StoresPage } from './pages/StoresPage';
import { PriceTrackerPage } from './pages/PriceTrackerPage';
import { AboutPage, ContactPage, HelpPage } from './pages/AboutContactHelpPages';
import { UserRegisterPage } from './pages/auth/UserRegisterPage';
import { UserVerifyEmailPage } from './pages/auth/UserVerifyEmailPage';
import { UserLoginPage } from './pages/auth/UserLoginPage';
import { UserDashboardPage } from './pages/auth/UserDashboardPage';
import { AdminRegisterPage } from './pages/auth/AdminRegisterPage';
import { AdminVerifyEmailPage } from './pages/auth/AdminVerifyEmailPage';
import { AdminLogin } from './components/admin/AdminLogin';

function MainLayout() {
  const {
    currentView,
    isAddToCartModalOpen,
    setIsAddToCartModalOpen,
    lastAddedProduct,
    lastAddedQuantity,
    openCheckoutModalWithPayment,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    checkoutInitialMethod,
    checkoutInitialBank,
    isDashboardHubOpen,
    openDashboardHub,
    closeDashboardHub,
  } = useApp();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // If in isolated Admin Dashboard mode, render full enterprise console
  if (currentView === 'admin_dashboard') {
    return (
      <>
        <ToastContainer />
        <AdminDashboard />
        <LiveDashboardHubModal
          isOpen={isDashboardHubOpen}
          onClose={closeDashboardHub}
        />
      </>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onOpenAiAdvisor={() => setIsWhatsAppModalOpen(true)} />;
      case 'products':
        return <ProductsPage />;
      case 'product_detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
        return <UserOrdersPage />;
      case 'chat':
        return <ChatView />;
      case 'seller_dashboard':
        return <SellerDashboard />;
      case 'sell':
        return <SellPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'compare':
        return <ComparePage />;
      case 'pc_builder':
      case 'pc-builder':
        return <PCBuilderPage />;
      case 'brands':
        return <BrandsPage />;
      case 'stores':
        return <StoresPage />;
      case 'price_tracker':
      case 'price-tracker':
        return <PriceTrackerPage />;
      case 'user_register':
        return <UserRegisterPage />;
      case 'user_verify_email':
        return <UserVerifyEmailPage />;
      case 'user_login':
        return <UserLoginPage />;
      case 'user_dashboard':
        return <UserDashboardPage />;
      case 'admin_register':
        return <AdminRegisterPage />;
      case 'admin_verify_email':
        return <AdminVerifyEmailPage />;
      case 'admin_login':
        return <AdminLogin />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage onOpenAiAdvisor={() => setIsWhatsAppModalOpen(true)} />;
    }
  };

  const isUserDashboardView = currentView === 'user_dashboard' || currentView === 'orders';

  return (
    <div
      className={`min-h-screen ${isUserDashboardView ? 'bg-[#fdfdfd]' : 'bg-white'} text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-clip w-full max-w-full`}
    >
      <ToastContainer />
      <Header
        onOpenAiAdvisor={() => setIsWhatsAppModalOpen(true)}
        onOpenDashboardHub={openDashboardHub}
      />

      <main className={`flex-1 relative z-10 ${isUserDashboardView ? 'bg-[#fdfdfd]' : 'bg-white'}`}>
        {renderContent()}
      </main>

      <Footer />

      {/* Direct WhatsApp Chat with Seller in Right Down Side */}
      <WhatsAppFloatingButton
        isOpen={isWhatsAppModalOpen}
        onClick={() => setIsWhatsAppModalOpen(prev => !prev)}
      />

      {/* Global Modals */}
      <AuthModal />
      <LiveDashboardHubModal
        isOpen={isDashboardHubOpen}
        onClose={closeDashboardHub}
      />
      <WhatsAppSellerChatModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
      <AddToCartPaymentModal
        isOpen={isAddToCartModalOpen}
        onClose={() => setIsAddToCartModalOpen(false)}
        product={lastAddedProduct}
        quantity={lastAddedQuantity}
        onProceedToCheckout={(method, bank) => {
          openCheckoutModalWithPayment(method, bank);
        }}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        initialMethod={checkoutInitialMethod}
        initialBank={checkoutInitialBank}
      />
      <ServerDiagnosticsModal />
    </div>
  );
}

export function App() {
  return (
    <RBACProvider>
      <ServerProvider>
        <AppProvider>
          <AdminProvider>
            <AppRouter>
              <MainLayout />
            </AppRouter>
          </AdminProvider>
        </AppProvider>
      </ServerProvider>
    </RBACProvider>
  );
}

export default App;
