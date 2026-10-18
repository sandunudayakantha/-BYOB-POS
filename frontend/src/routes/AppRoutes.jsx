import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BranchProvider } from '../contexts/BranchContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import OwnerLayout from '../layouts/OwnerLayout';

// DDD Application Pages
import { LoginPage } from '../app/pages/auth/login.page';
import { AdminDashboardPage } from '../app/pages/admin/admin-dashboard.page';
import { AdminRestaurantsPage } from '../app/pages/admin/admin-restaurants.page';

import { OwnerDashboardPage } from '../app/pages/owner/owner-dashboard.page';
import { BranchesPage } from '../app/pages/owner/branches.page';
import { CatalogPage } from '../app/pages/owner/catalog.page';
import { InventoryPage } from '../app/pages/owner/inventory.page';
import { MenusPage } from '../app/pages/owner/menus.page';
import { MenuBuilderPage } from '../app/pages/owner/menu-builder.page';
import { FeaturedPage } from '../app/pages/owner/featured.page';
import { QRCodesPage } from '../app/pages/owner/qrcodes.page';
import { ProfilePage } from '../app/pages/owner/profile.page';

import { CustomerMenuPage } from '../app/pages/public/customer-menu.page';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// Wrapper for all routes that need Authentication/Branch Context
const ProviderWrapper = () => (
  <AuthProvider>
    <BranchProvider>
      <Outlet />
    </BranchProvider>
  </AuthProvider>
);

const LoginRoute = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return <LoginPage />;
};

const FallbackRoute = () => {
  const { user } = useAuth();
  return <Navigate to={user ? (user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Customer QR Route - Instant Load Without Session Block */}
      {/* Not wrapped in ProviderWrapper, so no /auth/me check is ever run! */}
      <Route path="/q/:token" element={<CustomerMenuPage />} />

      {/* Auth-Aware Routes */}
      <Route element={<ProviderWrapper />}>
        {/* Auth Route */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Super Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="restaurants" element={<AdminRestaurantsPage />} />
        </Route>

        {/* Restaurant Owner Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="products" element={<Navigate to="/catalog?tab=products" replace />} />
          <Route path="categories" element={<Navigate to="/catalog?tab=categories" replace />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="menus/:menuId/builder" element={<MenuBuilderPage />} />
          <Route path="featured" element={<FeaturedPage />} />
          <Route path="qr-codes" element={<QRCodesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<FallbackRoute />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
