import {
  login,
  signup,
  googleSignIn,
  logout as logoutApi,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
  sendChangePasswordOtp,
  changePassword,
} from '@/api/auth';
import AuthService from '@/services/auth.service';
import {
  getAccessToken,
  removeTokens,
  setTokens,
  isAccessTokenValid,
} from '@/services/jwt';
import { decodeAccessToken } from '@/services/jwt';
import {
  IAuthUser,
  IUserLoginParams,
  IUserSignupParams,
  IGoogleAuthParams,
  IVerifyEmailParams,
  IResendVerificationOtpParams,
  IForgotPasswordParams,
  IResetPasswordParams,
  IChangePasswordParams,
} from '@/types/api.types';
import * as React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AxiosError } from 'axios';
import { getAuthBroadcastChannel } from '@/utils/broadcast-channel';

//==================== REGION TYPES ====================
interface AuthState {
  user: IAuthUser | null;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null; // Email that needs OTP verification
}

interface AuthActions {
  login: (params: IUserLoginParams) => Promise<void>;
  signup: (params: IUserSignupParams) => Promise<void>;
  verifyEmail: (params: IVerifyEmailParams) => Promise<void>;
  resendVerificationOtp: (
    params: IResendVerificationOtpParams
  ) => Promise<void>;
  googleSignIn: (params: IGoogleAuthParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  forgotPassword: (params: IForgotPasswordParams) => Promise<void>;
  resetPassword: (params: IResetPasswordParams) => Promise<void>;
  sendChangePasswordOtp: () => Promise<void>;
  changePassword: (params: IChangePasswordParams) => Promise<void>;
  setPendingVerificationEmail: (email: string | null) => void;
  // Computed getter - không lưu trong state để tránh hack
  getIsAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;
//====================================================

const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      // Init state
      user: null,
      isLoading: false,
      error: null,
      pendingVerificationEmail: null,

      // Computed getter - kiểm tra token thực tế và expiry, không lưu trong state
      getIsAuthenticated: () => {
        return isAccessTokenValid();
      },

      // Init actions
      login: async (params: IUserLoginParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await login(params);
          if (response.data.success && response.data.data) {
            const { accessToken, user } = response.data.data;
            // Only store access token in memory (refresh token is in HttpOnly cookie)
            setTokens(accessToken);
            set({
              user,
              isLoading: false,
              error: null,
            });
            // Broadcast login to other tabs
            getAuthBroadcastChannel().broadcastLogin(user.id);
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Login failed';
          set({
            user: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      signup: async (params: IUserSignupParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await signup(params);
          if (response.data.success) {
            // Signup successful, but user needs to verify email
            // Store email for OTP verification
            set({
              pendingVerificationEmail: params.email,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.message || 'Signup failed');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Signup failed';
          set({
            user: null,
            isLoading: false,
            error: errorMessage,
            pendingVerificationEmail: null,
          });
          throw error;
        }
      },

      verifyEmail: async (params: IVerifyEmailParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await verifyEmail(params);
          if (response.data.success && response.data.data) {
            const { accessToken, user } = response.data.data;
            // Only store access token in memory (refresh token is in HttpOnly cookie)
            setTokens(accessToken);
            set({
              user,
              isLoading: false,
              error: null,
              pendingVerificationEmail: null,
            });
            // Broadcast login to other tabs
            getAuthBroadcastChannel().broadcastLogin(user.id);
          } else {
            throw new Error(
              response.data.message || 'Email verification failed'
            );
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Email verification failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      resendVerificationOtp: async (params: IResendVerificationOtpParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await resendVerificationOtp(params);
          if (response.data.success) {
            set({
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.message || 'Failed to resend OTP');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Failed to resend OTP';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      googleSignIn: async (params: IGoogleAuthParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await googleSignIn(params);
          if (response.data.success && response.data.data) {
            const { accessToken, user } = response.data.data;
            // Only store access token in memory (refresh token is in HttpOnly cookie)
            setTokens(accessToken);
            set({
              user,
              isLoading: false,
              error: null,
            });
            // Broadcast login to other tabs
            getAuthBroadcastChannel().broadcastLogin(user.id);
          } else {
            throw new Error(response.data.message || 'Google sign-in failed');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Google sign-in failed';
          set({
            user: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API - backend will clear HttpOnly cookie
          await logoutApi();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        } finally {
          // Clear all auth data from localStorage (accessToken + any other auth keys)
          removeTokens();
          // Clear user data from memory (Zustand store)
          set({
            user: null,
            isLoading: false,
            error: null,
          });
          // Broadcast logout to other tabs
          getAuthBroadcastChannel().broadcastLogout();
        }
      },

      refreshAuth: async () => {
        try {
          const accessToken = getAccessToken();
          if (!accessToken) {
            set({ user: null });
            return;
          }

          // Token refresh is handled by axios interceptor automatically
          // This method can be used to verify auth state
          const decoded = decodeAccessToken<{
            userId?: string;
            email?: string;
          }>();
          if (!decoded) {
            set({ user: null });
          }
          // If token is valid, keep user state
        } catch {
          set({ user: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      forgotPassword: async (params: IForgotPasswordParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await forgotPassword(params);
          if (response.data.success) {
            set({
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(
              response.data.message || 'Failed to send reset code'
            );
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Failed to send reset code';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      resetPassword: async (params: IResetPasswordParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await resetPassword(params);
          if (response.data.success) {
            set({
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.message || 'Password reset failed');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Password reset failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      sendChangePasswordOtp: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await sendChangePasswordOtp();
          if (response.data.success) {
            set({
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.message || 'Failed to send OTP');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Failed to send OTP';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      changePassword: async (params: IChangePasswordParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await changePassword(params);
          if (response.data.success) {
            set({
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.message || 'Password change failed');
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Password change failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const accessToken = getAccessToken();
          if (!accessToken) {
            set({ user: null, isLoading: false });
            return;
          }

          console.warn('🔍 Checking authentication status...');

          // Gọi API để lấy user - nếu token expired/invalid (401/403),
          // axios interceptor sẽ TỰ ĐỘNG refresh token và retry
          try {
            const userResponse = await AuthService.getCurrentUser();
            if (userResponse.data.success && userResponse.data.data) {
              console.warn('✅ User authenticated successfully');
              set({
                user: userResponse.data.data,
                isLoading: false,
                error: null,
              });
            } else {
              // Nếu API trả về lỗi, xóa user và token
              console.warn('❌ Failed to fetch user data. Clearing tokens...');
              removeTokens();
              set({ user: null, isLoading: false });
            }
          } catch (error) {
            // Nếu API call thất bại sau khi đã thử refresh token
            const axiosError = error as AxiosError<{ message?: string }>;

            // Chỉ logout nếu đã thử refresh mà vẫn thất bại
            // (interceptor đã xử lý 401/403 và retry, nếu vẫn lỗi = refresh token hết hạn)
            if (
              axiosError.response?.status === 401 ||
              axiosError.response?.status === 403
            ) {
              console.warn(
                '❌ Auth failed after refresh attempt. Refresh token likely expired. Logging out...'
              );
              // Refresh token đã hết hạn hoặc không hợp lệ
              removeTokens();
              set({ user: null, isLoading: false });
            } else {
              console.warn(
                '⚠️ Non-auth error occurred. Keeping user data from cache.',
                axiosError.message
              );
              // Nếu lỗi khác (network, etc), giữ nguyên user từ persist
              set({ isLoading: false });
            }
          }
        } catch {
          console.warn('❌ Unexpected error in initializeAuth');
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ lưu user, không lưu isAuthenticated để tránh hack
      partialize: (state) => ({
        user: state.user,
        pendingVerificationEmail: state.pendingVerificationEmail,
      }),
    }
  )
);

// Selector để lấy isAuthenticated - luôn kiểm tra token thực tế
export const useIsAuthenticated = () => {
  return useAuth((state) => state.getIsAuthenticated());
};

// Hook to set up BroadcastChannel listener for multi-tab logout sync
// This should be called once in the app root (e.g., in layout.tsx or AuthProvider)
export const useAuthBroadcastSync = () => {
  React.useEffect(() => {
    const channel = getAuthBroadcastChannel();
    const listenerId = 'auth-store-listener';

    // Listen for logout broadcasts from other tabs
    channel.onMessage(listenerId, (message) => {
      if (message.type === 'LOGOUT') {
        // Another tab logged out - sync this tab
        // Don't call logout() API or broadcast again to avoid loops
        console.warn(
          '🔄 Logout broadcast received from another tab - syncing...'
        );

        // Clear tokens and state directly (without API call or broadcast)
        removeTokens();
        useAuth.setState({
          user: null,
          isLoading: false,
          error: null,
          pendingVerificationEmail: null,
        });

        // Clear query cache if React Query is available
        if (typeof window !== 'undefined') {
          // Redirect to login page to ensure clean state
          // Use replace to avoid adding to history
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }
      }
      // Note: We don't handle LOGIN broadcasts here as each tab should
      // authenticate independently through the normal flow
    });

    // Cleanup on unmount
    return () => {
      channel.offMessage(listenerId);
    };
  }, []);
};

export default useAuth;
