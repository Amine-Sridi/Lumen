/**
 * Custom Button Component
 * A reusable button with various styles and states
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, componentSizes } from '../Styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]] as any[];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
      return baseStyle;
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'warning':
        baseStyle.push(styles.warning);
        break;
      case 'error':
        baseStyle.push(styles.error);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text] as any[];
    
    // Add size-specific text style
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'medium':
        baseStyle.push(styles.textMedium);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
    }
    
    if (variant === 'secondary' || variant === 'outline') {
      baseStyle.push(styles.textSecondary);
    }
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (variant === 'secondary' || variant === 'outline') {
      return colors.text;
    }
    return colors.textOnPrimary;
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'outline' ? colors.text : colors.textOnPrimary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={componentSizes.icon.small}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          
          <Text style={getTextStyle()}>{title}</Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={componentSizes.icon.small}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sizes
  small: {
    height: componentSizes.button.small.height,
    paddingHorizontal: componentSizes.button.small.paddingHorizontal,
  },
  
  medium: {
    height: componentSizes.button.medium.height,
    paddingHorizontal: componentSizes.button.medium.paddingHorizontal,
  },
  
  large: {
    height: componentSizes.button.large.height,
    paddingHorizontal: componentSizes.button.large.paddingHorizontal,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  success: {
    backgroundColor: colors.success,
    ...shadows.md,
  },
  
  warning: {
    backgroundColor: colors.warning,
    ...shadows.md,
  },
  
  error: {
    backgroundColor: colors.error,
    ...shadows.md,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  disabled: {
    backgroundColor: colors.gray300,
    borderColor: colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
  
  textSmall: {
    fontSize: componentSizes.button.small.fontSize,
  },
  
  textMedium: {
    fontSize: componentSizes.button.medium.fontSize,
  },
  
  textLarge: {
    fontSize: componentSizes.button.large.fontSize,
  },
  
  textSecondary: {
    color: colors.text,
  },
  
  // Icons
  iconLeft: {
    marginRight: spacing.xs,
  },
  
  iconRight: {
    marginLeft: spacing.xs,
  },
});