'use client';

import { useEffect } from 'react';
import useAuth, { useAuthBroadcastSync } from '@/lib/stores/use-auth';

type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuth((state) => state.initializeAuth);

  useAuthBroadcastSync();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
