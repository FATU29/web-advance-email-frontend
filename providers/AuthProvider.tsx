'use client';

import { useEffect } from 'react';
import useAuth, { useAuthBroadcastSync } from '@/lib/stores/use-auth';

type AuthProviderProps = {
  children: React.ReactNode;
};

/**
 * AuthProvider - Initialize authentication on app load
 * Best practice: Check token and fetch user info when app starts/reloads
 * Also sets up multi-tab logout sync via BroadcastChannel
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuth((state) => state.initializeAuth);

  // Set up multi-tab logout sync
  useAuthBroadcastSync();

  useEffect(() => {
    // Initialize auth when component mounts (app loads/reloads)
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
