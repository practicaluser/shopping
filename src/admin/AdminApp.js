import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from './LoginPage';
import AdminLayout from './layout/AdminLayout';
 import DashboardPage from './pages/DashboardPage';
 import ProductsPage from './pages/ProductsPage';
 import OrdersPage from './pages/OrdersPage';
 import UsersPage from './pages/UsersPage';
 import AnalyticsPage from './pages/AnalyticsPage';
 import SettingsPage from './pages/SettingsPage';

const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'products': return <ProductsPage />;
      case 'orders': return <OrdersPage />;
      case 'users': return <UsersPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AuthProvider>
      <PrivateRoute>
        <AdminLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
          {renderPage()}
        </AdminLayout>
      </PrivateRoute>
    </AuthProvider>
  );
};

export default AdminApp;
