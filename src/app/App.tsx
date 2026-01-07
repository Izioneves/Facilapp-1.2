import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { CartProvider } from '../contexts/CartContext';
import { StoreProvider } from '../contexts/StoreContext'; // Facade

// Pages
import LoginScreen from '../features/auth/pages/LoginScreen';
import RegisterScreen from '../features/auth/pages/RegisterScreen';
import SupplierRegisterScreen from '../features/auth/pages/SupplierRegisterScreen';

// Catalog Screens
import WelcomeScreen from '../features/catalog/pages/WelcomeScreen';
import HomeScreen from '../features/catalog/pages/HomeScreen';
import SearchScreen from '../features/catalog/pages/SearchScreen';
import StoreScreen from '../features/catalog/pages/StoreScreen';
import ProductDetailScreen from '../features/catalog/pages/ProductDetailScreen';
// Checkout Screens
import CartScreen from '../features/checkout/pages/CartScreen';
import CheckoutAddressScreen from '../features/checkout/pages/CheckoutAddressScreen';
import CheckoutPaymentScreen from '../features/checkout/pages/CheckoutPaymentScreen';
import CheckoutSummaryScreen from '../features/checkout/pages/CheckoutSummaryScreen';

// Orders Screens
import OrdersScreen from '../features/orders/pages/OrdersScreen';
import OrderDetailScreen from '../features/orders/pages/OrderDetailScreen';
import OrderSuccessScreen from '../features/orders/pages/OrderSuccessScreen';

// Client Screens
import SavedAddressesScreen from '../features/profile/pages/SavedAddressesScreen';
import ProfileScreen from '../features/profile/pages/ProfileScreen';
import ProfileEditScreen from '../features/profile/pages/ProfileEditScreen';
import AddressFormScreen from '../features/profile/pages/AddressFormScreen';
import SettingsScreen from '../features/profile/pages/SettingsScreen';
import FAQScreen from '../features/common/pages/FAQScreen';

// Supplier Screens
import DashboardScreen from '../features/supplier/pages/DashboardScreen';
import SupplierProductsScreen from '../features/supplier/pages/SupplierProductsScreen';
import AddProductScreen from '../features/supplier/pages/AddProductScreen';
import SupplierOrdersScreen from '../features/supplier/pages/SupplierOrdersScreen';
import SupplierOrderDetailScreen from '../features/supplier/pages/SupplierOrderDetailScreen';
import SupplierStoreSettingsScreen from '../features/supplier/pages/SupplierStoreSettingsScreen';
import SupplierStatementScreen from '../features/supplier/pages/SupplierStatementScreen';

// Components
import BottomNav from '../components/BottomNav';

const ProtectedRoute = ({ children, role }: { children: React.JSX.Element, role?: 'client' | 'supplier' }) => {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.type !== role) {
    return <Navigate to={user.type === 'supplier' ? '/supplier/dashboard' : '/home'} replace />;
  }

  return children;
};

const AppContent = () => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/home" /> : <WelcomeScreen />} />
      <Route path="/login" element={user ? <Navigate to={user.type === 'supplier' ? '/supplier/dashboard' : '/home'} /> : <LoginScreen />} />
      <Route path="/register/client" element={user ? <Navigate to="/home" /> : <RegisterScreen />} />
      <Route path="/register/supplier" element={user ? <Navigate to="/supplier/dashboard" /> : <SupplierRegisterScreen />} />
      <Route path="/order-success" element={<OrderSuccessScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />

      {/* Client Routes */}
      <Route path="/home" element={<ProtectedRoute role="client"><HomeScreen /></ProtectedRoute>} />
      <Route path="/client/home" element={<Navigate to="/home" replace />} /> {/* Redirect old path */}
      <Route path="/search" element={<ProtectedRoute role="client"><SearchScreen /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute role="client"><OrdersScreen /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute role="client"><OrderDetailScreen /></ProtectedRoute>} />
      <Route path="/saved-addresses" element={<ProtectedRoute role="client"><SavedAddressesScreen /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute role="client"><SavedAddressesScreen /></ProtectedRoute>} />
      <Route path="/addresses/new" element={<ProtectedRoute role="client"><AddressFormScreen /></ProtectedRoute>} />
      <Route path="/addresses/edit" element={<ProtectedRoute role="client"><AddressFormScreen /></ProtectedRoute>} />
      <Route path="/addresses/edit/:zipCode" element={<ProtectedRoute role="client"><AddressFormScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="client"><ProfileScreen /></ProtectedRoute>} />
      <Route path="/faq" element={<ProtectedRoute><FAQScreen /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute role="client"><ProfileEditScreen /></ProtectedRoute>} />
      <Route path="/store/:id" element={<ProtectedRoute role="client"><StoreScreen /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetailScreen /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute role="client"><CartScreen /></ProtectedRoute>} />
      <Route path="/checkout/address" element={<ProtectedRoute role="client"><CheckoutAddressScreen /></ProtectedRoute>} />
      <Route path="/checkout/payment" element={<ProtectedRoute role="client"><CheckoutPaymentScreen /></ProtectedRoute>} />
      <Route path="/checkout/summary" element={<ProtectedRoute role="client"><CheckoutSummaryScreen /></ProtectedRoute>} />
      <Route path="/payment-methods" element={<ProtectedRoute role="client"><CheckoutPaymentScreen /></ProtectedRoute>} />

      {/* Supplier Routes */}
      <Route path="/supplier/dashboard" element={<ProtectedRoute role="supplier"><DashboardScreen /></ProtectedRoute>} />
      <Route path="/supplier/products" element={<ProtectedRoute role="supplier"><SupplierProductsScreen /></ProtectedRoute>} />
      <Route path="/supplier/add-product" element={<ProtectedRoute role="supplier"><AddProductScreen /></ProtectedRoute>} />
      <Route path="/supplier/products/edit/:id" element={<ProtectedRoute role="supplier"><AddProductScreen /></ProtectedRoute>} />
      <Route path="/supplier/orders" element={<ProtectedRoute role="supplier"><SupplierOrdersScreen /></ProtectedRoute>} />
      <Route path="/supplier/orders/:id" element={<ProtectedRoute role="supplier"><SupplierOrderDetailScreen /></ProtectedRoute>} />
      <Route path="/supplier/store-settings" element={<ProtectedRoute role="supplier"><SupplierStoreSettingsScreen /></ProtectedRoute>} />
      <Route path="/supplier/statement" element={<ProtectedRoute role="supplier"><SupplierStatementScreen /></ProtectedRoute>} />
      <Route path="/supplier/profile" element={<ProtectedRoute role="supplier"><ProfileScreen /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="/" element={user ? <Navigate to={user.type === 'supplier' ? '/supplier/dashboard' : '/home'} /> : <Navigate to="/welcome" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AppLayout = () => {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  // Hide BottomNav on these specific routes
  const hideNavRoutes = ['/welcome', '/login', '/register', '/landing', '/supplier/add-product', '/supplier/products/edit', '/checkout'];
  const shouldHideNav = hideNavRoutes.some(path => location.pathname.startsWith(path));

  // Check if user is fully ready (auth resolved + valid type)
  const isUserReady = user && user.type && !isAuthLoading;

  // Also hide if no user is logged in
  const showBottomNav = isUserReady && !shouldHideNav;

  return (
    <div className="flex flex-col h-full min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Mobile Constraints Wrapper - centers app on desktop */}
      <div className="w-full max-w-md mx-auto bg-background-light dark:bg-background-dark min-h-screen shadow-2xl relative flex flex-col overflow-hidden">

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          <AppContent />
        </div>

        {/* Bottom Navigation - Fixed within container */}
        {showBottomNav && (
          <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
            <BottomNav role={user!.type} />
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  console.log("App Component Rendering...");
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <StoreProvider>
              <AppLayout />
            </StoreProvider>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
