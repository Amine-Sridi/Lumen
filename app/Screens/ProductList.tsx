/**
 * Product List Screen
 * Displays all products with search and filter functionality
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';

const ProductListScreen: React.FC = () => {
  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, stock: 25, category: 'Electronics', image: 'headset-outline' },
    { id: 2, name: 'Smartphone Case', price: 24.99, stock: 50, category: 'Accessories', image: 'phone-portrait-outline' },
    { id: 3, name: 'Laptop Stand', price: 49.99, stock: 3, category: 'Office', image: 'laptop-outline' },
    { id: 4, name: 'Smart Watch', price: 199.99, stock: 12, category: 'Electronics', image: 'watch-outline' },
    { id: 5, name: 'USB-C Cable', price: 15.99, stock: 100, category: 'Accessories', image: 'flash-outline' },
    { id: 6, name: 'Bluetooth Speaker', price: 79.99, stock: 8, category: 'Electronics', image: 'volume-high-outline' },
  ];

  return (
    <>
      <HeaderView title="Products" />
      <ScrollView style={styles.container}>
        {/* Search Bar Placeholder */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Products Header with Count */}
        <View style={styles.productsHeader}>
          <View style={styles.productCountContainer}>
            <Text style={styles.productCountNumber}>{sampleProducts.length}</Text>
            <Text style={styles.productCountLabel}>Total Products</Text>
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.productGrid}>
          {sampleProducts.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons 
                  name={product.image as any} 
                  size={40} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>${product.price}</Text>
                <View style={styles.stockContainer}>
                  <View style={[
                    styles.stockIndicator,
                    { backgroundColor: product.stock < 10 ? colors.warning : colors.success }
                  ]} />
                  <Text style={[
                    styles.productStock,
                    { color: product.stock < 10 ? colors.warning : colors.success }
                  ]}>
                    {product.stock < 10 ? 'Low Stock' : 'In Stock'}: {product.stock}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  filterButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsHeader: {
    padding: spacing.md,
    alignItems: 'center',
  },
  productCountContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  productCountNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  productCountLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    opacity: 0.9,
  },
  productsContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  productGrid: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '90%',
    maxWidth: 320,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productInfo: {
    gap: 6,
    alignItems: 'center',
  },
  productName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  productCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  productPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  stockIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  productStock: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ProductListScreen;