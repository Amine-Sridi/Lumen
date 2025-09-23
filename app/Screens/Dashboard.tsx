/**
 * Dashboard Screen
 * Main overview screen showing inventory statistics, low stock alerts, and quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { HeaderView } from '../components/HeaderView';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { products, isLoading: productsLoading, fetchProducts } = useProducts();
  const { inventory, isLoading: inventoryLoading, fetchInventory } = useInventory();
  const { sales, fetchSales, getSalesSummary } = useSales();
  
  const [refreshing, setRefreshing] = useState(false);
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    calculateSummary();
  }, [products, inventory, sales]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchInventory(),
        fetchSales(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateSummary = () => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const lowStockCount = inventory.filter(
      item => item.quantity <= item.minimumStock
    ).length;

    setSalesSummary({
      totalSales,
      totalRevenue,
      lowStockCount,
    });
  };

  const navigateToAddProduct = () => {
    (navigation as any).navigate('AddProduct');
  };

  const navigateToScanBarcode = () => {
    (navigation as any).navigate('Scanner');
  };

  const navigateToProducts = () => {
    (navigation as any).navigate('Products');
  };

  // Get low stock items
  const lowStockItems = inventory
    .filter(item => item.quantity <= item.minimumStock)
    .slice(0, 3); // Show only first 3

  // Get recent sales (last 3)
  const recentSales = sales
    .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
    .slice(0, 3);

  if (productsLoading || inventoryLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <>
      <HeaderView title="Dashboard" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={24} color={colors.success} />
            <Text style={styles.statNumber}>{salesSummary.totalSales}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          
          <View style={[styles.statCard, salesSummary.lowStockCount > 0 && styles.warningCard]}>
            <Ionicons 
              name="warning-outline" 
              size={24} 
              color={salesSummary.lowStockCount > 0 ? colors.warning : colors.textLight} 
            />
            <Text style={[
              styles.statNumber,
              salesSummary.lowStockCount > 0 && styles.warningText
            ]}>
              {salesSummary.lowStockCount}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={styles.revenueTitle}>Total Revenue</Text>
          </View>
          <Text style={styles.revenueAmount}>
            ${salesSummary.totalRevenue.toFixed(2)}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={navigateToAddProduct}
            >
              <Ionicons name="add-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Add Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]} 
              onPress={navigateToScanBarcode}
            >
              <Ionicons name="scan-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Scan Barcode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonOutline]} 
              onPress={navigateToProducts}
            >
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>View Products</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sample Products Section */}
        <View style={styles.sampleProductsContainer}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.productGrid}>
            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="headset-outline" size={40} color={colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>Wireless Headphones</Text>
                <Text style={styles.productPrice}>$99.99</Text>
                <View style={styles.productStockContainer}>
                  <View style={[styles.stockIndicator, { backgroundColor: colors.success }]} />
                  <Text style={[styles.productStock, { color: colors.success }]}>In Stock: 25</Text>
                </View>
              </View>
            </View>

            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="phone-portrait-outline" size={40} color={colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>Smartphone Case</Text>
                <Text style={styles.productPrice}>$24.99</Text>
                <View style={styles.productStockContainer}>
                  <View style={[styles.stockIndicator, { backgroundColor: colors.success }]} />
                  <Text style={[styles.productStock, { color: colors.success }]}>In Stock: 50</Text>
                </View>
              </View>
            </View>

            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="laptop-outline" size={40} color={colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>Laptop Stand</Text>
                <Text style={styles.productPrice}>$49.99</Text>
                <View style={styles.productStockContainer}>
                  <View style={[styles.stockIndicator, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.productStock, { color: colors.warning }]}>Low Stock: 3</Text>
                </View>
              </View>
            </View>

            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="watch-outline" size={40} color={colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>Smart Watch</Text>
                <Text style={styles.productPrice}>$199.99</Text>
                <View style={styles.productStockContainer}>
                  <View style={[styles.stockIndicator, { backgroundColor: colors.success }]} />
                  <Text style={[styles.productStock, { color: colors.success }]}>In Stock: 12</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
            </View>
            <Text style={styles.alertDescription}>
              {lowStockItems.length} product(s) are running low on stock
            </Text>
            
            {lowStockItems.map((item) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <ProductCard
                  key={item.id}
                  product={product}
                  inventory={item}
                  showInventory
                  onPress={() => (navigation as any).navigate('ProductDetails', { productId: product.id })}
                />
              );
            })}
            
            <Button
              title="View All Products"
              onPress={navigateToProducts}
              variant="outline"
              size="small"
            />
          </View>
        )}

        {/* Recent Activity */}
        {recentSales.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            {recentSales.map((sale) => {
              const product = products.find(p => p.id === sale.productId);
              return (
                <View key={sale.id} style={styles.saleItem}>
                  <View style={styles.saleInfo}>
                    <Text style={styles.saleName}>
                      {product?.name || 'Unknown Product'}
                    </Text>
                    <Text style={styles.saleDetails}>
                      Qty: {sale.quantity} × ${sale.unitPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.saleDate}>
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.saleAmount}>
                    ${sale.totalAmount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  warningCard: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  
  warningText: {
    color: colors.warning,
  },
  
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  revenueCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  revenueTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  
  revenueAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  actionButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    alignItems: 'center',
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    minWidth: 200,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  actionButtonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  
  actionButtonTextSecondary: {
    color: colors.primary,
  },
  
  sampleProductsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  productGrid: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  
  productCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 300,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: spacing.lg,
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  productName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  productPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  
  productStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  
  alertSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  alertTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  
  alertDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  
  activitySection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  saleItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  saleInfo: {
    flex: 1,
  },
  
  saleName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  
  saleDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  saleDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  
  saleAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
});

export default DashboardScreen;