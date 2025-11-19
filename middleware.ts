import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

//==================== REGION MIDDLEWARE ====================

/**
 * Middleware disabled - using useAuthGuard hook for route protection instead
 * useAuthGuard handles both initial page loads and real-time auth state changes
 *
 * If you need server-side route protection in the future, uncomment and implement below
 */
export function middleware(_request: NextRequest) {
  // Pass through all requests - route protection handled by useAuthGuard
  return NextResponse.next();
}

// Disable middleware matcher - no routes will be processed
export const config = {
  matcher: [],
};

//====================================================
