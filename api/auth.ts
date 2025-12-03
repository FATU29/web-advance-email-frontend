import AuthService from '@/services/auth.service';

//==================== REGION AUTH API ====================
// Re-export service methods for backward compatibility
export const getCurrentUser = AuthService.getCurrentUser;
export const signup = AuthService.signup;
export const login = AuthService.login;
export const googleSignIn = AuthService.googleSignIn;
export const refreshToken = AuthService.refreshToken;
export const logout = AuthService.logout;
export const introspect = AuthService.introspect;
export const verifyEmail = AuthService.verifyEmail;
export const resendVerificationOtp = AuthService.resendVerificationOtp;
export const forgotPassword = AuthService.forgotPassword;
export const resetPassword = AuthService.resetPassword;
export const sendChangePasswordOtp = AuthService.sendChangePasswordOtp;
export const changePassword = AuthService.changePassword;

// Export service class
export { AuthService };

//====================================================
