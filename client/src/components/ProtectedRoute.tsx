import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
