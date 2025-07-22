'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookies when the app loads
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
