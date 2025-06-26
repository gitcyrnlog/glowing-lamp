import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BD9526]"></div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location, message: "Admin access required" }} replace />;
  }

  // If admin, render children
  return <>{children}</>;
}
