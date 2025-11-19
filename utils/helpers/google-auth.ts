//==================== REGION GOOGLE AUTH HELPER ====================

/**
 * Get Google OAuth authorization URL
 * Redirects to Google OAuth consent screen
 */
export const getGoogleAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  // Request access to Gmail API for reading and managing emails
  const scope = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ].join(' ');
  const responseType = 'code';

  if (!clientId) {
    throw new Error('Google Client ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

//====================================================
