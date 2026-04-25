import { useCallback, useEffect, useState } from 'react';
import { authService } from '@/features/auth/services/authService';
import { apiClient } from '@/services/api';
import { storageService } from '@/services/storage';
import type { AuthState, GoogleLoginForm, User } from '@/types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const initializeAuth = useCallback(async () => {
    try {
      const token = await storageService.getAuthToken();
      const userData = await storageService.getUserData<User>();

      if (token && userData) {
        // Set auth token for API client
        apiClient.setAuthToken(token);

        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (phoneNumber: string, otp: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.verifyOTP(phoneNumber, otp);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens and user data
        await Promise.all([
          storageService.setAuthToken(tokens.accessToken),
          storageService.setRefreshToken(tokens.refreshToken),
          storageService.setUserData(user),
        ]);

        // Set auth token for API client
        apiClient.setAuthToken(tokens.accessToken);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleData: unknown) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.loginWithGoogle(googleData as GoogleLoginForm);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens and user data
        await Promise.all([
          storageService.setAuthToken(tokens.accessToken),
          storageService.setRefreshToken(tokens.refreshToken),
          storageService.setUserData(user),
        ]);

        // Set auth token for API client
        apiClient.setAuthToken(tokens.accessToken);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        throw new Error(response.error || 'Google login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      await storageService.clearAuthData();

      // Clear auth token from API client
      apiClient.setAuthToken('');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const sendOTP = useCallback(async (phoneNumber: string) => {
    try {
      const response = await authService.sendOTP(phoneNumber);
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    sendOTP,
    clearError,
  };
};
