import { login, signup, googleSignIn, logout as logoutApi } from '@/api/auth';
import AuthService from '@/services/auth.service';
import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
  setTokens,
} from '@/services/jwt';
import { decodeAccessToken } from '@/services/jwt';
import {
  IAuthUser,
  IUserLoginParams,
  IUserSignupParams,
  IGoogleAuthParams,
} from '@/types/api.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AxiosError } from 'axios';

//==================== REGION TYPES ====================
interface AuthState {
  user: IAuthUser | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (params: IUserLoginParams) => Promise<void>;
  signup: (params: IUserSignupParams) => Promise<void>;
  googleSignIn: (params: IGoogleAuthParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
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

      // Computed getter - kiểm tra token thực tế, không lưu trong state
      getIsAuthenticated: () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
          return false;
        }
        try {
          const decoded = decodeAccessToken();
          return !!decoded;
        } catch {
          return false;
        }
      },

      // Init actions
      login: async (params: IUserLoginParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await login(params);
          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            setTokens(accessToken, refreshToken);
            set({
              user,
              isLoading: false,
              error: null,
            });
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
          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            setTokens(accessToken, refreshToken);
            set({
              user,
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
          });
          throw error;
        }
      },

      googleSignIn: async (params: IGoogleAuthParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await googleSignIn(params);
          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            setTokens(accessToken, refreshToken);
            set({
              user,
              isLoading: false,
              error: null,
            });
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
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            await logoutApi({ refreshToken });
          }
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        } finally {
          removeTokens();
          set({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            set({ user: null });
            return;
          }

          // Token refresh is handled by axios interceptor
          // This method can be used to verify auth state
          const decoded = decodeAccessToken<{
            userId?: string;
            email?: string;
          }>();
          if (!decoded) {
            set({ user: null });
          }
          // Nếu token hợp lệ, giữ nguyên user state
        } catch {
          set({ user: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const accessToken = getAccessToken();
          if (!accessToken) {
            set({ user: null, isLoading: false });
            return;
          }

          // Kiểm tra token có hợp lệ không
          const decoded = decodeAccessToken();
          if (!decoded) {
            set({ user: null, isLoading: false });
            return;
          }

          // Gọi API để lấy thông tin user mới nhất từ server
          try {
            const response = await AuthService.getCurrentUser();
            if (response.data.success && response.data.data) {
              set({
                user: response.data.data,
                isLoading: false,
                error: null,
              });
            } else {
              // Nếu API trả về lỗi, xóa user và token
              removeTokens();
              set({ user: null, isLoading: false });
            }
          } catch (error) {
            // Nếu API call thất bại (401, 403, etc), xóa user và token
            const axiosError = error as AxiosError<{ message?: string }>;
            if (
              axiosError.response?.status === 401 ||
              axiosError.response?.status === 403
            ) {
              removeTokens();
              set({ user: null, isLoading: false });
            } else {
              // Nếu lỗi khác, giữ nguyên user từ persist nhưng vẫn set loading false
              set({ isLoading: false });
            }
          }
        } catch {
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ lưu user, không lưu isAuthenticated để tránh hack
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

// Selector để lấy isAuthenticated - luôn kiểm tra token thực tế
export const useIsAuthenticated = () => {
  return useAuth((state) => state.getIsAuthenticated());
};

export default useAuth;
