/**
 * App Status Component
 * Shows current app status and theme validation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';

interface AppStatusProps {
  isOnline?: boolean;
  lastSync?: string;
}

export const AppStatus: React.FC<AppStatusProps> = ({ 
  isOnline = true,
  lastSync = 'Just now'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Ionicons 
          name={isOnline ? 'checkmark-circle' : 'alert-circle'} 
          size={16} 
          color={isOnline ? colors.success : colors.warning} 
        />
        <Text style={styles.statusText}>
          {isOnline ? 'Connected' : 'Offline'}
        </Text>
      </View>
      
      <Text style={styles.syncText}>
        Last sync: {lastSync}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    marginVertical: spacing.xs,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  
  syncText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});