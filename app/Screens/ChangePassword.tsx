/**
 * Change Password Screen
 * Secure password change functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert('Validation Error', 'Please enter a new password.');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Validation Error', 'New password must be different from current password.');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert(
        'Password Changed',
        'Your password has been changed successfully. You will need to login again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    field: keyof PasswordFormData,
    showKey: keyof typeof showPasswords,
    placeholder: string
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showPasswords[showKey]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility(showKey)}
          >
            <Ionicons
              name={showPasswords[showKey] ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <HeaderView title="Change Password" showBackButton />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Notice */}
          <View style={styles.noticeContainer}>
            <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
            <Text style={styles.noticeTitle}>Change Password</Text>
            <Text style={styles.noticeText}>
              Choose a strong password that you haven't used before. Your password should be at least 6 characters long.
            </Text>
          </View>

          {/* Password Form */}
          <View style={styles.formContainer}>
            {renderPasswordInput(
              'Current Password',
              formData.currentPassword,
              'currentPassword',
              'current',
              'Enter your current password'
            )}

            {renderPasswordInput(
              'New Password',
              formData.newPassword,
              'newPassword',
              'new',
              'Enter a new password'
            )}

            {renderPasswordInput(
              'Confirm New Password',
              formData.confirmPassword,
              'confirmPassword',
              'confirm',
              'Confirm your new password'
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                <Ionicons
                  name={formData.newPassword.length >= 6 ? 'checkmark-circle' : 'radio-button-off'}
                  size={16}
                  color={formData.newPassword.length >= 6 ? colors.success : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.requirementText,
                    formData.newPassword.length >= 6 && styles.requirementMet,
                  ]}
                >
                  At least 6 characters
                </Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name={
                    formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword
                      ? 'checkmark-circle'
                      : 'radio-button-off'
                  }
                  size={16}
                  color={
                    formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword
                      ? colors.success
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    (formData.newPassword &&
                      formData.confirmPassword &&
                      formData.newPassword === formData.confirmPassword) ? styles.requirementMet : null,
                  ]}
                >
                  Passwords match
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Change Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  noticeContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  noticeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  noticeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  requirementsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  requirementMet: {
    color: colors.success,
  },
  buttonContainer: {
    flexDirection: 'row',
    margin: spacing.md,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default ChangePasswordScreen;