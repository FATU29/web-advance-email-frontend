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
import { getAccessToken, removeTokens, setTokens } from '@/services/jwt';
import {
  IUserLoginParams,
  IUserSignupParams,
  IGoogleAuthParams,
  IVerifyEmailParams,
  IResendVerificationOtpParams,
  IForgotPasswordParams,
  IResetPasswordParams,
  IChangePasswordParams,
} from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '@/lib/stores/use-auth';
import { AxiosError } from 'axios';

//==================== REGION QUERY KEYS ====================
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  currentUser: () => [...authQueryKeys.user(), 'current'] as const,
};
//====================================================

//==================== REGION REACT QUERY HOOKS ====================

/**
 * Get current user query
 */
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: async () => {
      const response = await AuthService.getCurrentUser();
      if (response.data.success && response.data.data) {
        useAuth.setState({ user: response.data.data });
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get user');
    },
    enabled: !!getAccessToken(),
    retry: false,
  });
};

/**
 * Login mutation
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IUserLoginParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await login(params);
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken, user } = response.data.data;
          setTokens(accessToken, refreshToken);
          useAuth.setState({ user, isLoading: false, error: null });
          return user;
        } else {
          throw new Error(response.data.message || 'Login failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Login failed';
        useAuth.setState({
          user: null,
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
    },
  });
};

/**
 * Signup mutation
 */
export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (params: IUserSignupParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await signup(params);
        if (response.data.success) {
          // Signup successful, but user needs to verify email
          useAuth.setState({
            pendingVerificationEmail: params.email,
            isLoading: false,
            error: null,
          });
          return { email: params.email };
        } else {
          throw new Error(response.data.message || 'Signup failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Signup failed';
        useAuth.setState({
          user: null,
          isLoading: false,
          error: errorMessage,
          pendingVerificationEmail: null,
        });
        throw error;
      }
    },
  });
};

/**
 * Verify email mutation
 */
export const useVerifyEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IVerifyEmailParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await verifyEmail(params);
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken, user } = response.data.data;
          setTokens(accessToken, refreshToken);
          useAuth.setState({
            user,
            isLoading: false,
            error: null,
            pendingVerificationEmail: null,
          });
          return user;
        } else {
          throw new Error(response.data.message || 'Email verification failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Email verification failed';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
    },
  });
};

/**
 * Resend verification OTP mutation
 */
export const useResendVerificationOtpMutation = () => {
  return useMutation({
    mutationFn: async (params: IResendVerificationOtpParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await resendVerificationOtp(params);
        if (response.data.success) {
          useAuth.setState({ isLoading: false, error: null });
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to resend OTP');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to resend OTP';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
  });
};

/**
 * Google sign-in mutation
 */
export const useGoogleSignInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IGoogleAuthParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await googleSignIn(params);
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken, user } = response.data.data;
          setTokens(accessToken, refreshToken);
          useAuth.setState({ user, isLoading: false, error: null });
          return user;
        } else {
          throw new Error(response.data.message || 'Google sign-in failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        // Handle specific Google OAuth errors
        let errorMessage = 'Google sign-in failed';

        if (axiosError.response?.status === 401) {
          errorMessage =
            axiosError.response?.data?.message ||
            'Authorization code has expired or already been used. Please try logging in again.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }

        useAuth.setState({
          user: null,
          isLoading: false,
          error: errorMessage,
        });

        // Create a new error with the improved message
        const enhancedError = new Error(errorMessage);
        throw enhancedError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
    },
  });
};

/**
 * Logout mutation
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      useAuth.setState({ isLoading: true });
      try {
        // Call logout API - backend will clear HttpOnly cookie
        await logoutApi();
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      } finally {
        // Clear access token from memory
        removeTokens();
        useAuth.setState({ user: null, isLoading: false, error: null });
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

/**
 * Forgot password mutation
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (params: IForgotPasswordParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await forgotPassword(params);
        if (response.data.success) {
          useAuth.setState({ isLoading: false, error: null });
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to send reset code');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to send reset code';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
  });
};

/**
 * Reset password mutation
 */
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (params: IResetPasswordParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await resetPassword(params);
        if (response.data.success) {
          useAuth.setState({ isLoading: false, error: null });
          return true;
        } else {
          throw new Error(response.data.message || 'Password reset failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Password reset failed';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
  });
};

/**
 * Send change password OTP mutation
 */
export const useSendChangePasswordOtpMutation = () => {
  return useMutation({
    mutationFn: async () => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await sendChangePasswordOtp();
        if (response.data.success) {
          useAuth.setState({ isLoading: false, error: null });
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to send OTP');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to send OTP';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
  });
};

/**
 * Change password mutation
 */
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: async (params: IChangePasswordParams) => {
      useAuth.setState({ isLoading: true, error: null });
      try {
        const response = await changePassword(params);
        if (response.data.success) {
          useAuth.setState({ isLoading: false, error: null });
          return true;
        } else {
          throw new Error(response.data.message || 'Password change failed');
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Password change failed';
        useAuth.setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
  });
};

//====================================================
