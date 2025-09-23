/**
 * Enhanced Authentication Context
 * 
 * This context manages user authentication state across the entire application.
 * It handles login, registration, logout, token management, and demo mode.
 * 
 * Key Features:
 * - JWT token storage and management using Expo SecureStore
 * - Automatic token validation on app startup
 * - Axios integration with automatic Authorization headers
 * - Token refresh mechanism for session management
 * - Demo mode for development and testing
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
  onDemoLogin: () => Promise<void>;                                        // Demo mode authentication
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

  /**
   * Load stored authentication data on app startup
   * 
   * This function is called when the app initializes to check if the user
   * has previously authenticated. It retrieves stored JWT token and user data,
   * validates them, and sets up the authentication state accordingly.
   * 
   * Process:
   * 1. Retrieve token and user data from secure storage
   * 2. Parse and validate the stored data
   * 3. Set up Axios authorization headers if valid
   * 4. Update authentication state
   * 5. Handle any errors gracefully
   */
  const loadStoredAuth = async (): Promise<void> => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);

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

  /**
   * Register a new user
   * 
   * Sends user registration data to the backend. This only creates the user account
   * but does NOT automatically log them in. The user will need to sign in after
   * successful registration.
   * 
   * Backend Endpoint: POST /api/users
   * Expected Request Body: { email, password, firstName, lastName, phone }
   * Expected Response: User object without sensitive data
   * 
   * @param credentials - User registration information
   * @returns Promise<ApiResponse<User>> - Registration result
   */
  const register = async (credentials: RegisterCredentials): Promise<ApiResponse<User>> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await axios.post(`${API_URL}/users`, credentials);
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful',
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
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

  /**
   * Login user with credentials
   * 
   * Authenticates user with email and password, receives JWT token and user data,
   * stores them securely, and sets up the authenticated session.
   * 
   * Backend Endpoint: POST /api/auth
   * Expected Request Body: { email, password }
   * Expected Response: { token: string, user: User }
   * 
   * Process:
   * 1. Send credentials to backend
   * 2. Receive JWT token and user data
   * 3. Store token and user data in secure storage
   * 4. Set up Axios authorization header
   * 5. Update authentication state
   * 
   * @param credentials - User login credentials
   * @returns Promise<ApiResponse<{ token: string; user: User }>> - Login result
   */
  const login = async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await axios.post(`${API_URL}/auth`, credentials);
      const { token, user } = response.data;

      // Store authentication data
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Set up axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthState({
        token,
        authenticated: true,
        user,
        isLoading: false,
      });

      return {
        success: true,
        data: { token, user },
        message: 'Login successful',
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
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

  /**
   * Logout user and clear stored data
   * 
   * Completely clears the user session including:
   * - JWT token from secure storage
   * - User data from secure storage
   * - Axios authorization headers
   * - Authentication state
   * 
   * This function should be called when user manually logs out or when
   * authentication fails (expired/invalid token).
   */
  const logout = async (): Promise<void> => {
    try {
      // Clear stored data
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

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
   * Demo login for development - bypasses authentication
   * 
   * Creates a fake user session for development and testing purposes.
   * This allows developers to test the app without setting up a backend.
   * 
   * IMPORTANT: This should be disabled in production builds.
   * The demo mode is only available when __DEV__ is true.
   */
  const demoLogin = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Create a demo user
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@lumen.app',
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1 (555) 123-4567',
          createdAt: new Date(),
          updatedAt: new Date(),
        };      const demoToken = 'demo-token-' + Date.now();

      // Set demo authentication state
      setAuthState({
        token: demoToken,
        authenticated: true,
        user: demoUser,
        isLoading: false,
      });

      console.log('🚀 Demo mode activated - bypassing authentication');
    } catch (error) {
      console.error('Demo login failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        authenticated: false,
      }));
    }
  };

  const value: AuthContextType = {
    authState,
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    clearError,
    refreshToken,
    onDemoLogin: demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 