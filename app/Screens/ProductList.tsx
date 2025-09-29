/**
 * Product List Screen
 * Displays all products with search and filter functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { Product, InventoryItem } from '../types';

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation();
  const productContext = useProducts();
  const inventoryContext = useInventory();
  
  // Ensure contexts are properly loaded with fallbacks
  const { 
    products = [], 
    isLoading: productsLoading = false, 
    error: productsError = null, 
    fetchProducts, 
    searchProducts,
    clearError 
  } = productContext || {};
  
  const { 
    inventory: inventoryItems = [], 
    isLoading: inventoryLoading = false, 
    error: inventoryError = null, 
    fetchInventory 
  } = inventoryContext || {};

  // Debug logging to understand the issue
  console.log('🔍 ProductList Debug:', {
    inventoryContextExists: !!inventoryContext,
    inventoryItemsType: typeof inventoryItems,
    inventoryItemsIsArray: Array.isArray(inventoryItems),
    inventoryItemsLength: inventoryItems?.length,
    inventoryItems: inventoryItems,
    inventoryLoading,
    inventoryError
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Use useMemo to ensure filteredProducts is always an array
  const filteredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    
    if (!searchQuery || searchQuery.trim() === '') {
      return safeProducts;
    }
    
    return safeProducts.filter(product => {
      if (!product) return false;
      
      const name = product.name?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const barcode = product.barcode || '';
      const query = searchQuery.toLowerCase();
      
      return name.includes(query) || 
             category.includes(query) || 
             barcode.includes(query);
    });
  }, [products, searchQuery]);

  // Early return if contexts are not properly loaded
  if (!productContext || !inventoryContext) {
    return (
      <>
        <HeaderView title="Products" />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </>
    );
  }

  const loadData = async () => {
    try {
      const promises: Promise<any>[] = [];
      if (fetchProducts) promises.push(fetchProducts());
      if (fetchInventory) promises.push(fetchInventory());
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '' && query.length > 2) {
      try {
        await searchProducts(query);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetails', { productId: product.id });
  };

  const getInventoryForProduct = (productId: string): InventoryItem | undefined => {
    // Ensure inventoryItems is actually an array and has a find method
    if (!Array.isArray(inventoryItems)) {
      console.warn('inventoryItems is not an array:', typeof inventoryItems, inventoryItems);
      return undefined;
    }
    
    try {
      return inventoryItems.find(item => item?.productId === productId);
    } catch (error) {
      console.error('Error in getInventoryForProduct:', error);
      return undefined;
    }
  };

  const getStockStatus = (inventory: InventoryItem | undefined) => {
    if (!inventory) return { text: 'No Stock', color: colors.error, isLowStock: true };
    
    if (inventory.quantity === 0) {
      return { text: 'Out of Stock', color: colors.error, isLowStock: true };
    } else if (inventory.quantity <= inventory.minimumStock) {
      return { text: `Low Stock: ${inventory.quantity}`, color: colors.warning, isLowStock: true };
    } else {
      return { text: `In Stock: ${inventory.quantity}`, color: colors.success, isLowStock: false };
    }
  };

  if (productsLoading && (products?.length || 0) === 0) {
    return (
      <>
        <HeaderView title="Products" />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </>
    );
  }

  if (productsError && (products?.length || 0) === 0) {
    return (
      <>
        <HeaderView title="Products" />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{productsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderView title="Products" />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => Alert.alert('Filter', 'Filter functionality coming soon!')}
          >
            <Ionicons name="filter-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Products Header with Count */}
        <View style={styles.productsHeader}>
          <View style={styles.productCountContainer}>
            <Text style={styles.productCountNumber}>{filteredProducts.length}</Text>
            <Text style={styles.productCountLabel}>
              {filteredProducts.length === (products?.length || 0) ? 'Total Products' : 'Found Products'}
            </Text>
          </View>
        </View>

        {/* Loading State */}
        {productsLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        )}

        {/* Empty State */}
        {!productsLoading && filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add your first product to get started'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.addProductButton}
                onPress={() => (navigation as any).navigate('AddProduct')}
              >
                <Ionicons name="add-outline" size={20} color={colors.white} />
                <Text style={styles.addProductButtonText}>Add Product</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Products Grid */}
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => {
            const inventory = getInventoryForProduct(product.id);
            const stockStatus = getStockStatus(inventory);
            
            return (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.productImagePlaceholder}>
                  {product.imageUrl ? (
                    <Text style={styles.productImageText}>IMG</Text>
                  ) : (
                    <Ionicons 
                      name="cube-outline" 
                      size={40} 
                      color={colors.primary} 
                    />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  {product.category && (
                    <Text style={styles.productCategory}>{product.category}</Text>
                  )}
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.productBarcode}>#{product.barcode}</Text>
                  <View style={styles.stockContainer}>
                    <View style={[
                      styles.stockIndicator,
                      { backgroundColor: stockStatus.color }
                    ]} />
                    <Text style={[
                      styles.productStock,
                      { color: stockStatus.color }
                    ]}>
                      {stockStatus.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add spacing at bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    paddingVertical: 0,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addProductButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  addProductButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
  productImageText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
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
  productBarcode: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: 'monospace',
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
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default ProductListScreen;