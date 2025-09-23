/**
 * Product Details Screen
 * Detailed view of product information and inventory status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';

const ProductDetailsScreen: React.FC = () => {
  return (
    <>
      <HeaderView title="Product Details" showBackButton />
      <View style={styles.container}>
        <Text style={styles.title}>Product Details</Text>
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

export default ProductDetailsScreen;