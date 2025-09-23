/**
 * Scan Barcode Screen
 * Camera-based barcode scanning for product lookup
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';

const ScanBarcodeScreen: React.FC = () => {
  return (
    <>
      <HeaderView title="Barcode Scanner" />
      <View style={styles.container}>
        <Text style={styles.title}>Barcode Scanner</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default ScanBarcodeScreen;