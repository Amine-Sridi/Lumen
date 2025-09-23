/**
 * Theme configuration for the Lumen Inventory app
 * Provides consistent styling across the application
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colors
export const colors = {
  // Primary brand colors
  primary: '#3b82f6',      // Blue
  primaryDark: '#2563eb',  // Darker blue
  primaryLight: '#60a5fa', // Lighter blue
  
  // Secondary colors
  secondary: '#8b5cf6',    // Purple
  secondaryDark: '#7c3aed',
  secondaryLight: '#a78bfa',
  
  // Status colors
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  info: '#06b6d4',         // Cyan
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textOnPrimary: '#ffffff',
  textOnDark: '#ffffff',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Status specific
  lowStock: '#f59e0b',
  outOfStock: '#ef4444',
  inStock: '#10b981',
};

// Typography
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    display: 32,
  },
  
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Screen dimensions
export const layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  headerHeight: 60,
  tabBarHeight: 80,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 200,
  slow: 300,
};

// Component sizes
export const componentSizes = {
  button: {
    small: {
      height: 32,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.sm,
    },
    medium: {
      height: 40,
      paddingHorizontal: spacing.lg,
      fontSize: typography.fontSize.md,
    },
    large: {
      height: 48,
      paddingHorizontal: spacing.xl,
      fontSize: typography.fontSize.lg,
    },
  },
  
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
  
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
};

// Complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animations,
  componentSizes,
};

export type Theme = typeof theme;