import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/utils/constants/routes';

//==================== REGION MIDDLEWARE ====================

/**
 * Middleware to protect routes and watch token
 * Runs on edge runtime - can access cookies but not browser APIs
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.VERIFY_OTP];

  // Protected routes that require authentication
  const protectedRoutes = ['/mail'];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with valid token, redirect to mail
  if (isPublicRoute && accessToken) {
    // Check if token is valid (basic check - not expired)
    try {
      // In edge runtime, we can't use jose library
      // Just check if token exists and has basic structure
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        // Token has valid JWT structure, redirect to mail
        return NextResponse.redirect(new URL(ROUTES.MAIL, request.url));
      }
    } catch {
      // Invalid token structure, allow access to auth pages
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

//====================================================
