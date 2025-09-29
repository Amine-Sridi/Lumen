/**
 * Sales History Screen
 * Displays all sales transactions with filtering and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSales } from '../context/SalesContext';
import { Sale, SalesSummary } from '../types';
import { format } from 'date-fns';

const SalesHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    sales, 
    salesSummary,
    isLoading, 
    error, 
    fetchSales, 
    getSalesSummary,
    clearError 
  } = useSales();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchSales(),
        getSalesSummary()
      ]);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRecordNewSale = () => {
    (navigation as any).navigate('ScanBarcode', { mode: 'sale' });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const renderSaleItem = ({ item }: { item: Sale }) => (
    <TouchableOpacity style={styles.saleCard}>
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.product?.name || 'Unknown Product'}
          </Text>
          <Text style={styles.saleDate}>{formatDate(item.saleDate)}</Text>
        </View>
        <View style={styles.saleAmount}>
          <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        </View>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleDetailRow}>
          <Text style={styles.detailLabel}>Unit Price:</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.unitPrice)}</Text>
        </View>
        {item.notes && (
          <View style={styles.saleDetailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{item.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && sales.length === 0) {
    return (
      <>
        <HeaderView title="Sales History" />
        <View style={[styles.container, styles.centerContent]}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading sales...</Text>
        </View>
      </>
    );
  }

  if (error && sales.length === 0) {
    return (
      <>
        <HeaderView title="Sales History" />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderView title="Sales History" />
      <View style={styles.container}>
        {/* Summary Cards */}
        {salesSummary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{salesSummary.totalSales}</Text>
                <Text style={styles.summaryLabel}>Total Sales</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{formatCurrency(salesSummary.totalRevenue)}</Text>
                <Text style={styles.summaryLabel}>Revenue</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRecordNewSale}
          >
            <Ionicons name="add-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Record New Sale</Text>
          </TouchableOpacity>
        </View>

        {/* Sales List */}
        {sales.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Sales Yet</Text>
            <Text style={styles.emptyMessage}>
              Start recording sales to see them here
            </Text>
            <TouchableOpacity
              style={styles.recordSaleButton}
              onPress={handleRecordNewSale}
            >
              <Ionicons name="add-outline" size={20} color={colors.white} />
              <Text style={styles.recordSaleButtonText}>Record First Sale</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sales}
            renderItem={renderSaleItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={styles.salesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  loadingText: {
    marginTop: spacing.sm,
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
  summarySection: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
  },
  summaryNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  recordSaleButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  recordSaleButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  salesList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  saleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  saleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  saleDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  quantity: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  saleDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  saleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
});

export default SalesHistoryScreen;