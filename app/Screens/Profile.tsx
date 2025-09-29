/**
 * Profile Screen
 * User profile management with editing capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
}

const ProfileScreen: React.FC = () => {
  const { authState, updateProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (authState?.user) {
      setFormData({
        firstName: authState.user.firstName || '',
        lastName: authState.user.lastName || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
        businessName: authState.user.businessName || '',
        businessType: authState.user.businessType || '',
        businessAddress: authState.user.businessAddress || '',
      });
    }
  }, [authState?.user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        Alert.alert('Validation Error', 'First name and last name are required.');
        return;
      }

      // Update profile
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        businessName: formData.businessName.trim(),
        businessType: formData.businessType.trim(),
        businessAddress: formData.businessAddress.trim(),
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (authState?.user) {
      setFormData({
        firstName: authState.user.firstName || '',
        lastName: authState.user.lastName || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
        businessName: authState.user.businessName || '',
        businessType: authState.user.businessType || '',
        businessAddress: authState.user.businessAddress || '',
      });
    }
    setIsEditing(false);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderProfileField = (
    label: string,
    value: string,
    field: keyof ProfileFormData,
    placeholder?: string,
    multiline?: boolean
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.fieldInput, multiline && styles.multilineInput]}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            placeholderTextColor={colors.textSecondary}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            editable={field !== 'email'} // Email should not be editable
          />
        ) : (
          <Text style={[
            styles.fieldValue,
            !value && styles.fieldValueEmpty,
            field === 'email' && styles.fieldValueEmail
          ]}>
            {value || `No ${label.toLowerCase()} set`}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <HeaderView title="Profile" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={64} color={colors.primary} />
            </View>
            <Text style={styles.userName}>
              {authState?.user?.firstName} {authState?.user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{authState?.user?.email}</Text>
            <Text style={styles.userStatus}>
              Account Active • Member since {
                authState?.user?.createdAt 
                  ? new Date(authState.user.createdAt).getFullYear()
                  : new Date().getFullYear()
              }
            </Text>
          </View>

          {/* Profile Form */}
          <View style={styles.formContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {!isEditing ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {renderProfileField('First Name', formData.firstName, 'firstName')}
            {renderProfileField('Last Name', formData.lastName, 'lastName')}
            {renderProfileField('Email', formData.email, 'email')}
            {renderProfileField('Phone', formData.phone, 'phone', '+1 (555) 000-0000')}

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Business Information</Text>
            {renderProfileField('Business Name', formData.businessName, 'businessName')}
            {renderProfileField('Business Type', formData.businessType, 'businessType', 'e.g., Retail, Restaurant, Warehouse')}
            {renderProfileField('Business Address', formData.businessAddress, 'businessAddress', 'Enter full business address', true)}

            {/* Action Buttons */}
            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Account Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Account Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="cube-outline" size={24} color={colors.primary} />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="receipt-outline" size={24} color={colors.success} />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Sales</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color={colors.warning} />
                <Text style={styles.statValue}>
                  {authState?.user?.lastLoginAt 
                    ? new Date(authState.user.lastLoginAt).toLocaleDateString()
                    : 'N/A'
                  }
                </Text>
                <Text style={styles.statLabel}>Last Login</Text>
              </View>
            </View>
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
  profileHeader: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  formContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  fieldValueEmpty: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  fieldValueEmail: {
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  statsContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;