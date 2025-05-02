import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // Check role if required
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Redirect to="/unauthorized" />;
  }

  // If authenticated and has proper role, render children
  return <>{children}</>;
};

export default ProtectedRoute;