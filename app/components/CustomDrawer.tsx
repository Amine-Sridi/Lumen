/**
 * CustomDrawer Component
 * Professional drawer/sidebar layout for the app navigation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomDrawerProps {
  [key: string]: any;
}

export const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  const { authState, onLogout } = useAuth();

  const handleLogout = async () => {
    try {
      await onLogout();
      props.navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="cube-outline" size={48} color={colors.white} />
            </View>
          </View>
          <Text style={styles.appTitle}>Lumen Inventory</Text>
          <Text style={styles.appSubtitle}>Inventory Management</Text>
        </View>

        {/* Navigation Items */}
        <View style={styles.navigationSection}>
          <DrawerItem
            label="Dashboard"
            icon={({ size, color }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('Dashboard')}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
          
          <DrawerItem
            label="Products"
            icon={({ size, color }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('Products')}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
          
          <DrawerItem
            label="Add Product"
            icon={({ size, color }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('AddProduct')}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
          
          <DrawerItem
            label="Barcode Scanner"
            icon={({ size, color }) => (
              <Ionicons name="scan-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('Scanner')}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
          
          <DrawerItem
            label="Record Sale"
            icon={({ size, color }) => (
              <Ionicons name="receipt-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('Sales')}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* User Section */}
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <DrawerItem
            label="Profile"
            icon={({ size, color }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            )}
            onPress={() => {
              // Navigate to profile when implemented
              console.log('Navigate to profile');
            }}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
          
          <DrawerItem
            label="Settings"
            icon={({ size, color }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            onPress={() => {
              // Navigate to settings when implemented
              console.log('Navigate to settings');
            }}
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
        </View>
      </DrawerContentScrollView>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
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
  
  headerSection: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: -4, // Overlap with status bar
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryDark,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  appTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  appSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  navigationSection: {
    paddingVertical: spacing.md,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  drawerItem: {
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  
  drawerItemLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginLeft: -spacing.md,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  
  userSection: {
    paddingVertical: spacing.md,
  },
  
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default CustomDrawer;