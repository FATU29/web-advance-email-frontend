import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import {
  ApiResponse,
  IUserLoginParams,
  IUserSignupParams,
  IGoogleAuthParams,
  IRefreshTokenParams,
  ILogoutParams,
  IAuthResponse,
  IAuthUser,
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
   */
  static async refreshToken(
    params: IRefreshTokenParams
  ): Promise<CustomAxiosResponse<ApiResponse<IAuthResponse>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.REFRESH, params);
  }

  /**
   * Logout
   */
  static async logout(
    params: ILogoutParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(AUTH_ENDPOINTS.LOGOUT, params);
  }
}

export default AuthService;

//====================================================
