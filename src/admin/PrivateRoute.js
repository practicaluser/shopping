import React from 'react';
import { useAuth } from './AuthContext';
import LoginPage from './LoginPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return user ? children : <LoginPage />;
};

export default PrivateRoute;
