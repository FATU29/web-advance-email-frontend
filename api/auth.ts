import AuthService from '@/services/auth.service';

//==================== REGION AUTH API ====================
// Re-export service methods for backward compatibility
export const getCurrentUser = AuthService.getCurrentUser;
export const signup = AuthService.signup;
export const login = AuthService.login;
export const googleSignIn = AuthService.googleSignIn;
export const refreshToken = AuthService.refreshToken;
export const logout = AuthService.logout;

// Export service class
export { AuthService };

//====================================================
