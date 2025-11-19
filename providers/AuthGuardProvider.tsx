'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';

type AuthGuardProviderProps = {
  children: React.ReactNode;
};

/**
 * AuthGuardProvider - Watch token and protect routes on client-side
 * This works as a proxy to watch token changes when navigating between pages
 */
export default function AuthGuardProvider({
  children,
}: AuthGuardProviderProps) {
  // Watch token and handle route protection
  useAuthGuard();

  return <>{children}</>;
}
