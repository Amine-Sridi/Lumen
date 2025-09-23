/**
 * HeaderView Component
 * Professional header with drawer navigation toggle and user profile access
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { colors, spacing, typography } from '../Styles/theme';

interface HeaderViewProps {
  title: string;
  showBackButton?: boolean;
}

export const HeaderView: React.FC<HeaderViewProps> = ({ 
  title, 
  showBackButton = false 
}) => {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    (navigation as any).dispatch(DrawerActions.toggleDrawer());
  };

  const goBack = () => {
    navigation.goBack();
  };

  const navigateToProfile = () => {
    // Implement profile navigation when needed
    console.log('Navigate to profile');
  };

  return (
    <>
      <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={goBack}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleDrawer}
              accessibilityLabel="Open navigation menu"
            >
              <Ionicons name="menu" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={navigateToProfile}
            accessibilityLabel="User profile"
          >
            <Ionicons name="person-circle-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  
  iconButton: {
    padding: spacing.xs,
    borderRadius: 20,
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});

export default HeaderView;