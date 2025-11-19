//==================== REGION ROUTES ====================

// Auth routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  GOOGLE_CALLBACK: '/auth/callback/google',
  // Mail routes
  MAIL: '/mail/inbox',
  MAIL_FOLDER: (folder: string) => `/mail/${folder}`,
} as const;

//====================================================
