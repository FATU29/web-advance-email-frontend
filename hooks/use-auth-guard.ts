import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuth, { useIsAuthenticated } from '@/lib/stores/use-auth';
// TEMPORARILY DISABLED - import { ROUTES } from '@/utils/constants/routes';

//==================== REGION AUTH GUARD HOOK ====================

/**
 * Hook to watch token and protect routes
 * Redirects to login if not authenticated on protected routes
 * Redirects to mail if authenticated on auth routes
 * Works as a proxy to watch token changes when navigating between pages
 */
export const useAuthGuard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuth((state) => state.isLoading);
  const prevPathnameRef = useRef<string>(pathname);
  const prevAuthRef = useRef<boolean>(isAuthenticated);

  useEffect(() => {
    // TEMPORARILY DISABLED AUTH - Comment out to re-enable
    // Don't check during initial loading
    // if (isLoading) {
    //   return;
    // }

    // Public routes that don't require authentication
    // const publicRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.VERIFY_OTP];

    // Protected routes that require authentication
    // const protectedRoutes = ['/mail'];

    // const isPublicRoute = publicRoutes.some((route) =>
    //   pathname.startsWith(route)
    // );
    // const isProtectedRoute = protectedRoutes.some((route) =>
    //   pathname.startsWith(route)
    // );

    // Watch for auth state changes
    // const authChanged = prevAuthRef.current !== isAuthenticated;

    // Update refs
    prevPathnameRef.current = pathname;
    prevAuthRef.current = isAuthenticated;

    // TEMPORARILY DISABLED - If on protected route and not authenticated, redirect to login
    // if (isProtectedRoute && !isAuthenticated) {
    //   const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
    //   router.push(loginUrl);
    //   return;
    // }

    // TEMPORARILY DISABLED - If on auth route and authenticated, redirect to mail
    // if (isPublicRoute && isAuthenticated) {
    //   router.push(ROUTES.MAIL);
    //   return;
    // }

    // TEMPORARILY DISABLED - If auth state changed (token expired/invalid) and on protected route, redirect
    // if (authChanged && !isAuthenticated && isProtectedRoute) {
    //   const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
    //   router.push(loginUrl);
    //   return;
    // }
  }, [pathname, isAuthenticated, isLoading, router]);
};

//====================================================
