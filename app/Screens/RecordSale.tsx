/**
 * Record Sale Screen
 * Interface for recording product sales
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';
import { useInventory } from '../context/InventoryContext';
import { CreateSaleRequest, Product, InventoryItem, SaleFormData, FormField, RootStackParamList } from '../types';

type RecordSaleRouteProp = RouteProp<RootStackParamList, 'RecordSale'>;

const RecordSaleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RecordSaleRouteProp>();
  
  // Safely extract productId with fallback
  const productId = route.params?.productId;

  const { getProductById } = useProducts();
  const { createSale, isLoading: salesLoading } = useSales();
  const { getInventoryByProductId, adjustStock } = useInventory();

  const [product, setProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<SaleFormData>({
    quantity: { value: '1', error: '', touched: false },
    unitPrice: { value: '', error: '', touched: false },
    notes: { value: '', error: '', touched: false },
  });

  useEffect(() => {
    if (!productId) {
      // If no productId provided, redirect to scan or select product
      Alert.alert(
        'No Product Selected',
        'Please select a product to record a sale.',
        [
          {
            text: 'Scan Barcode',
            onPress: () => (navigation as any).navigate('ScanBarcode', { mode: 'sale' }),
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
      return;
    }
    
    loadProductData();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        unitPrice: { 
          value: product.price.toString(), 
          error: '', 
          touched: false 
        },
      }));
    }
  }, [product]);

  const loadProductData = async () => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const [productData, inventoryData] = await Promise.all([
        getProductById(productId),
        getInventoryByProductId(productId),
      ]);

      setProduct(productData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading product data:', error);
      Alert.alert('Error', 'Failed to load product data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof SaleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true,
        error: validateField(field, value),
      },
    }));
  };

  const validateField = (field: keyof SaleFormData, value: string): string => {
    switch (field) {
      case 'quantity':
        if (!value.trim()) return 'Quantity is required';
        const quantity = parseInt(value, 10);
        if (isNaN(quantity) || quantity <= 0) return 'Quantity must be a positive number';
        if (inventory && quantity > inventory.quantity) {
          return `Only ${inventory.quantity} units available in stock`;
        }
        return '';
      
      case 'unitPrice':
        if (!value.trim()) return 'Price is required';
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) return 'Price must be a positive number';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newFormData = { ...formData };

    // Validate required fields
    const requiredFields: (keyof SaleFormData)[] = ['quantity', 'unitPrice'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field].value);
      newFormData[field] = {
        ...newFormData[field],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFormData(newFormData);
    return isValid;
  };

  const calculateTotal = (): number => {
    const quantity = parseFloat(formData.quantity.value) || 0;
    const unitPrice = parseFloat(formData.unitPrice.value) || 0;
    return quantity * unitPrice;
  };

  const handleSubmit = async () => {
    if (!product) return;

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      const saleData: CreateSaleRequest = {
        productId: product.id,
        quantity: parseInt(formData.quantity.value, 10),
        unitPrice: parseFloat(formData.unitPrice.value),
        notes: formData.notes.value.trim() || undefined,
      };

      const saleResponse = await createSale(saleData);

      if (saleResponse.success) {
        // Inventory is automatically updated by the backend when creating a sale

        Alert.alert(
          'Sale Recorded',
          `Successfully recorded sale of ${saleData.quantity} ${product.name}(s) for $${calculateTotal().toFixed(2)}`,
          [
            {
              text: 'Record Another Sale',
              onPress: () => {
                // Reset form for another sale
                setFormData({
                  quantity: { value: '1', error: '', touched: false },
                  unitPrice: { value: product.price.toString(), error: '', touched: false },
                  notes: { value: '', error: '', touched: false },
                });
              },
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', saleResponse.error || 'Failed to record sale');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleScanProduct = () => {
    (navigation as any).navigate('ScanBarcode', { mode: 'sale' });
  };

  // Handle missing productId
  if (!productId) {
    return (
      <>
        <HeaderView title="Record Sale" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="scan-outline" size={64} color={colors.primary} />
          <Text style={styles.errorText}>No Product Selected</Text>
          <Text style={styles.loadingText}>Please select a product to record a sale</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Scan Barcode" 
              onPress={() => (navigation as any).navigate('ScanBarcode', { mode: 'sale' })}
              variant="primary"
            />
            <Button 
              title="Go Back" 
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          </View>
        </View>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <HeaderView title="Record Sale" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <HeaderView title="Record Sale" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Product not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderView title="Record Sale" showBackButton />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Information */}
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            <ProductCard
              product={product}
              inventory={inventory || undefined}
              showInventory={true}
            />
          </View>

          {/* Sale Details Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sale Details</Text>
            
            <Input
              label="Quantity *"
              placeholder="Enter quantity"
              value={formData.quantity.value}
              onChangeText={(text) => updateField('quantity', text)}
              error={formData.quantity.touched ? formData.quantity.error : undefined}
              icon="layers-outline"
              keyboardType="numeric"
            />

            <Input
              label="Unit Price *"
              placeholder="0.00"
              value={formData.unitPrice.value}
              onChangeText={(text) => updateField('unitPrice', text)}
              error={formData.unitPrice.touched ? formData.unitPrice.error : undefined}
              icon="cash-outline"
              keyboardType="decimal-pad"
            />

            <Input
              label="Notes"
              placeholder="Add sale notes (optional)"
              value={formData.notes.value}
              onChangeText={(text) => updateField('notes', text)}
              error={formData.notes.touched ? formData.notes.error : undefined}
              icon="document-text-outline"
              multiline
              numberOfLines={3}
            />

            {/* Sale Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity:</Text>
                <Text style={styles.summaryValue}>{formData.quantity.value || 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unit Price:</Text>
                <Text style={styles.summaryValue}>${formData.unitPrice.value || '0.00'}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Record Sale"
              onPress={handleSubmit}
              variant="success"
              disabled={salesLoading}
              loading={salesLoading}
              fullWidth
            />
            
            <Button
              title="Scan Different Product"
              onPress={handleScanProduct}
              variant="outline"
              fullWidth
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  productSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  summaryContainer: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default RecordSaleScreen;