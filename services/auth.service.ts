import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import {
  ApiResponse,
  IUserLoginParams,
  IUserSignupParams,
  IGoogleAuthParams,
  IIntrospectParams,
  IIntrospectResponse,
  IAuthResponse,
  IAuthUser,
  IVerifyEmailParams,
  IResendVerificationOtpParams,
  IForgotPasswordParams,
  IResetPasswordParams,
  IChangePasswordParams,
} from '@/types/api.types';
import { AUTH_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION AUTH SERVICE ====================

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<
    CustomAxiosResponse<ApiResponse<IAuthUser>>
  > {
    return await axiosBI.get(AUTH_ENDPOINTS.ME);
  }

  /**
   * Sign up with email and password
   */
  static async signup(
    params: IUserSignupParams
  ): Promise<CustomAxiosResponse<ApiResponse<IAuthResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.SIGNUP, params);
  }

  /**
   * Login with email and password
   */
  static async login(
    params: IUserLoginParams
  ): Promise<CustomAxiosResponse<ApiResponse<IAuthResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.LOGIN, params);
  }

  /**
   * Google OAuth sign-in
   */
  static async googleSignIn(
    params: IGoogleAuthParams
  ): Promise<CustomAxiosResponse<ApiResponse<IAuthResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.GOOGLE, params);
  }

  /**
   * Refresh access token
   * No body needed - refresh token is sent automatically via HttpOnly cookie
   */
  static async refreshToken(): Promise<
    CustomAxiosResponse<ApiResponse<IAuthResponse>>
  > {
    // No parameters needed - browser sends refresh token cookie automatically
    return await axiosBI.post(AUTH_ENDPOINTS.REFRESH);
  }

  /**
   * Logout
   * Clears HttpOnly cookie on backend
   */
  static async logout(): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    // No parameters needed - backend clears HttpOnly cookie
    return await axiosBI.post(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Introspect token - Check if token is valid
   */
  static async introspect(
    params: IIntrospectParams
  ): Promise<CustomAxiosResponse<ApiResponse<IIntrospectResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.INTROSPECT, params);
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(
    params: IVerifyEmailParams
  ): Promise<CustomAxiosResponse<ApiResponse<IAuthResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.VERIFY_EMAIL, params);
  }

  /**
   * Resend verification OTP
   */
  static async resendVerificationOtp(
    params: IResendVerificationOtpParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.RESEND_VERIFICATION_OTP, params);
  }

  /**
   * Forgot password - Send reset code
   */
  static async forgotPassword(
    params: IForgotPasswordParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, params);
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(
    params: IResetPasswordParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.RESET_PASSWORD, params);
  }

  /**
   * Send change password OTP (authenticated)
   */
  static async sendChangePasswordOtp(): Promise<
    CustomAxiosResponse<ApiResponse<null>>
  > {
    return await axiosBI.post(AUTH_ENDPOINTS.SEND_CHANGE_PASSWORD_OTP);
  }

  /**
   * Change password (authenticated)
   */
  static async changePassword(
    params: IChangePasswordParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, params);
  }
}

export default AuthService;

//====================================================
