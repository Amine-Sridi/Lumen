/**
 * Settings Screen
 * App settings, preferences, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { useNavigation } from '@react-navigation/native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  showChevron?: boolean;
}

const SettingsScreen: React.FC = () => {
  const { authState, onLogout } = useAuth();
  const navigation = useNavigation();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [salesReminders, setSalesReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    (navigation as any).navigate('ChangePassword');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your inventory and sales data to CSV format.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // TODO: Implement data export functionality
          Alert.alert('Coming Soon', 'Data export feature will be available in the next update.');
        }}
      ]
    );
  };

  const handleBackupRestore = () => {
    Alert.alert(
      'Backup & Restore',
      'Backup your data to cloud storage or restore from a previous backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: () => {
          Alert.alert('Coming Soon', 'Backup feature will be available in the next update.');
        }},
        { text: 'Restore', onPress: () => {
          Alert.alert('Coming Soon', 'Restore feature will be available in the next update.');
        }}
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => {
          Linking.openURL('mailto:support@lumen.app?subject=Lumen Inventory App Support');
        }},
        { text: 'Website', onPress: () => {
          Linking.openURL('https://lumen.app/support');
        }}
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Lumen',
      `Lumen Inventory Management System\n\nVersion: 1.0.0\nBuild: ${new Date().getFullYear()}.1\n\nA powerful inventory management solution for small to medium businesses.\n\n© ${new Date().getFullYear()} Lumen Technologies`,
      [{ text: 'OK' }]
    );
  };

  // Settings configuration
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile',
          subtitle: 'Manage your personal information',
          icon: 'person-outline',
          type: 'navigation' as const,
          onPress: () => (navigation as any).navigate('Profile'),
          showChevron: true,
        },
        {
          id: 'changePassword',
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'key-outline',
          type: 'action' as const,
          onPress: handleChangePassword,
          showChevron: true,
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: 'notifications-outline',
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'lowStock',
          title: 'Low Stock Alerts',
          subtitle: 'Alert when inventory is low',
          icon: 'alert-circle-outline',
          type: 'toggle' as const,
          value: lowStockAlerts,
          onToggle: setLowStockAlerts,
        },
        {
          id: 'salesReminders',
          title: 'Sales Reminders',
          subtitle: 'Daily sales summary notifications',
          icon: 'receipt-outline',
          type: 'toggle' as const,
          value: salesReminders,
          onToggle: setSalesReminders,
        },
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'moon-outline',
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
      ]
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your data as CSV',
          icon: 'download-outline',
          type: 'action' as const,
          onPress: handleExportData,
          showChevron: true,
        },
        {
          id: 'backup',
          title: 'Backup & Restore',
          subtitle: 'Manage data backups',
          icon: 'cloud-outline',
          type: 'action' as const,
          onPress: handleBackupRestore,
          showChevron: true,
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & FAQ',
          subtitle: 'Get help using the app',
          icon: 'help-circle-outline',
          type: 'action' as const,
          onPress: () => {
            Alert.alert('Coming Soon', 'Help section will be available in the next update.');
          },
          showChevron: true,
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'mail-outline',
          type: 'action' as const,
          onPress: handleContactSupport,
          showChevron: true,
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App information and credits',
          icon: 'information-circle-outline',
          type: 'action' as const,
          onPress: handleAbout,
          showChevron: true,
        },
      ]
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          icon: 'log-out-outline',
          type: 'action' as const,
          onPress: handleLogout,
          color: colors.error,
        },
      ]
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.color ? { borderLeftColor: item.color, borderLeftWidth: 3 } : null
        ]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, item.color ? { backgroundColor: `${item.color}15` } : null]}>
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={item.color || colors.primary} 
            />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, item.color ? { color: item.color } : null]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' && item.onToggle && (
            <Switch
              value={item.value || false}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={item.value ? colors.white : colors.textSecondary}
            />
          )}
          {item.showChevron && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <HeaderView title="Settings" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {authState?.user?.firstName} {authState?.user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{authState?.user?.email}</Text>
          </View>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContainer}>
              {group.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Lumen Inventory v1.0.0
          </Text>
          <Text style={styles.buildText}>
            Build {new Date().getFullYear()}.1.0 • Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  userHeader: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingsGroup: {
    marginTop: spacing.lg,
  },
  groupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  groupContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  buildText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});

export default SettingsScreen;