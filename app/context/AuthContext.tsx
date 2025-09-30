/**
 * Enhanced Authentication Context
 * 
 * This context manages user authentication state across the entire application.
 * It handles login, registration, logout, and token management.
 * 
 * Key Features:
 * - JWT token storage and management using Expo SecureStore
 * - Automatic token validation on app startup
 * - Axios integration with automati  const value = {
    authState,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    clearError,
    refreshToken,
    updateProfile,
    refreshProfile,
  };tion headers
 * - Token refresh mechanism for session management
 * - Comprehensive error handling
 * 
 * Backend Dependencies:
 * - POST /api/auth (login endpoint)
 * - POST /api/users (registration endpoint) 
 * - POST /api/auth/refresh (token refresh endpoint)
 * 
 * Storage Keys:
 * - 'lumen_jwt_token': JWT authentication token
 * - 'lumen_user_data': Serialized user profile data
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthState, LoginCredentials, RegisterCredentials, User, ApiResponse } from '../types';

// Authentication context interface defining all available methods and state
interface AuthContextType {
  authState: AuthState;                                                    // Current authentication state
  onRegister: (credentials: RegisterCredentials) => Promise<ApiResponse<User>>;  // User registration
  onLogin: (credentials: LoginCredentials) => Promise<ApiResponse<{ token: string; user: User }>>; // User login
  onLogout: () => Promise<void>;                                           // User logout and cleanup
  clearError: () => void;                                                  // Clear authentication errors
  refreshToken: () => Promise<void>;                                       // Refresh JWT token
  updateProfile: (profileData: Partial<User>) => Promise<void>;           // Update user profile
  refreshProfile: () => Promise<void>;                                     // Refresh user profile data
}

// Secure storage keys for persistent authentication data
const TOKEN_KEY = 'lumen_jwt_token';    // Key for storing JWT token
const USER_KEY = 'lumen_user_data';     // Key for storing user profile data

// API base URL - Configure this for your backend server
export const API_URL = 'http://localhost:3000/api';

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async (): Promise<void> => {
    try {
      let token, userData;
      
      try {
        // Try SecureStore first
        token = await SecureStore.getItemAsync(TOKEN_KEY);
        userData = await SecureStore.getItemAsync(USER_KEY);
      } catch (secureStoreError) {
        // Fallback to AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        token = await AsyncStorage.getItem('accessToken');
        userData = await AsyncStorage.getItem('userData');
      }

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Set up axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setAuthState({
          token,
          authenticated: true,
          user,
          isLoading: false,
        });
      } else {
        setAuthState({
          token: null,
          authenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<ApiResponse<User>> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      
      // Reset loading state on successful registration
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
      }));
      
      return {
        success: true,
        data: response.data.user,
        message: 'Registration successful',
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('🔐 Attempting login with:', credentials.email);
      console.log('🌐 API URL:', `${API_URL}/auth/login`);

      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('✅ Login response received:', response.data);
      
      const { token: accessToken, user } = response.data.data;

      // Store authentication data with AsyncStorage as fallback
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } catch (secureStoreError) {
        // Fallback to AsyncStorage if SecureStore fails
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }

      // Set up axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setAuthState({
        token: accessToken,
        authenticated: true,
        user,
        isLoading: false,
      });

      return {
        success: true,
        data: { token: accessToken, user },
        message: 'Login successful',
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        authenticated: false,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear stored data from both storage systems
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } catch (secureStoreError) {
        // Clear AsyncStorage as fallback
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('userData');
      }

      // Clear axios defaults
      delete axios.defaults.headers.common['Authorization'];

      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  /**
   * Clear authentication errors
   */
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: undefined }));
  };

  /**
   * Refresh authentication token
   * 
   * Requests a new JWT token using the current token. This is typically called
   * when the current token is about to expire or has expired.
   * 
   * Backend Endpoint: POST /api/auth/refresh
   * Expected Request Body: { token: current_token }
   * Expected Response: { token: new_token, user: User }
   * 
   * If refresh fails, the user will be logged out automatically.
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const currentToken = authState.token;
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        token: currentToken,
      });

      const { token: newToken, user } = response.data;

      // Update stored data
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Update axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setAuthState(prev => ({
        ...prev,
        token: newToken,
        user,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };



  /**
   * Update user profile information
   * 
   * Updates the current user's profile data on the backend and refreshes
   * the local user state with the updated information.
   * 
   * @param profileData - Partial user data to update
   */
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      if (!authState.token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      const updatedUser = response.data.data;

      // Update stored user data
      try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
      } catch (secureStoreError) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  /**
   * Refresh user profile from backend
   * 
   * Fetches the latest user profile data from the backend and updates
   * the local user state.
   */
  const refreshProfile = async (): Promise<void> => {
    try {
      if (!authState.token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      const user = response.data.data;

      // Update stored user data
      try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } catch (secureStoreError) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user,
      }));
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      throw new Error(error.response?.data?.message || 'Failed to refresh profile');
    }
  };

  const value: AuthContextType = {
    authState,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    clearError,
    refreshToken,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 