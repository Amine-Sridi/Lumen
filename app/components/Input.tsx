/**
 * Custom Input Component
 * A reusable text input with validation and styling
 */

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, componentSizes } from '../Styles/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  icon,
  rightIcon,
  onRightIconPress,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    const baseStyle = [styles.input] as any[];
    
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputError);
    }
    
    if (disabled) {
      baseStyle.push(styles.inputDisabled);
    }
    
    if (multiline) {
      baseStyle.push(styles.inputMultiline);
    }
    
    if (icon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    return baseStyle;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={componentSizes.icon.small}
            color={isFocused ? colors.primary : colors.textLight}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={componentSizes.icon.small}
              color={colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  input: {
    flex: 1,
    height: componentSizes.input.height,
    paddingHorizontal: componentSizes.input.paddingHorizontal,
    fontSize: componentSizes.input.fontSize,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.text,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  inputDisabled: {
    backgroundColor: colors.gray100,
    color: colors.textLight,
  },
  
  inputMultiline: {
    height: 'auto',
    minHeight: componentSizes.input.height,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  
  inputWithLeftIcon: {
    paddingLeft: spacing.xl + componentSizes.icon.small,
  },
  
  inputWithRightIcon: {
    paddingRight: spacing.xl + componentSizes.icon.small,
  },
  
  leftIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  
  rightIconContainer: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});