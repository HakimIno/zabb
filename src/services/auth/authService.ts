import { apiClient } from '../api/client';
import { LoginForm, GoogleLoginForm, User, ApiResponse } from '@/src/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/send-otp', {
        phoneNumber,
      });
      return response;
    } catch (error) {
      console.error('Send OTP failed:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-otp', {
        phoneNumber,
        otp,
      });
      return response;
    } catch (error) {
      console.error('Verify OTP failed:', error);
      throw new Error(ERROR_MESSAGES.INVALID_OTP);
    }
  }

  async loginWithGoogle(googleData: GoogleLoginForm): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/google', googleData);
      return response;
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error(ERROR_MESSAGES.LOGIN_FAILED);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await apiClient.post<AuthTokens>('/auth/refresh', {
        refreshToken,
      });
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/logout');
      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }
}

export const authService = new AuthService();
