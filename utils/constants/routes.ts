//==================== REGION ROUTES ====================

// Auth routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  GOOGLE_CALLBACK: '/auth/callback/google',
  // Mail routes
  MAIL: '/mail/inbox',
  MAIL_FOLDER: (folder: string) => `/mail/${folder}`,
} as const;

//====================================================
