/**
 * Add Product Screen
 * Form for adding new products to inventory
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
import { useProducts } from '../context/ProductContext';
import { CreateProductRequest, ProductFormData, FormField, RootStackParamList } from '../types';

type AddProductRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddProductRouteProp>();
  const { createProduct, isLoading } = useProducts();

  // Get scanned barcode from route params if provided
  const scannedBarcode = (route.params as any)?.scannedBarcode;

  const [formData, setFormData] = useState<ProductFormData>({
    name: { value: '', error: '', touched: false },
    description: { value: '', error: '', touched: false },
    barcode: { value: scannedBarcode || '', error: '', touched: !!scannedBarcode },
    price: { value: '', error: '', touched: false },
    category: { value: '', error: '', touched: false },
    brand: { value: '', error: '', touched: false },
    initialQuantity: { value: '', error: '', touched: false },
  });

  // Update barcode field if scanned barcode changes
  useEffect(() => {
    if (scannedBarcode && scannedBarcode !== formData.barcode.value) {
      setFormData(prev => ({
        ...prev,
        barcode: {
          value: scannedBarcode,
          error: validateField('barcode', scannedBarcode),
          touched: true,
        },
      }));
    }
  }, [scannedBarcode]);

  const updateField = (field: keyof ProductFormData, value: string) => {
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

  const validateField = (field: keyof ProductFormData, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Product name is required';
        if (value.trim().length < 3) return 'Product name must be at least 3 characters';
        return '';
      
      case 'barcode':
        if (!value.trim()) return 'Barcode is required';
        if (!/^[a-zA-Z0-9]+$/.test(value.trim())) return 'Barcode can only contain letters and numbers';
        return '';
      
      case 'price':
        if (!value.trim()) return 'Price is required';
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) return 'Price must be a positive number';
        return '';
      
      case 'initialQuantity':
        if (!value.trim()) return 'Initial quantity is required';
        const quantity = parseInt(value, 10);
        if (isNaN(quantity) || quantity < 0) return 'Quantity must be a non-negative number';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newFormData = { ...formData };

    // Validate required fields
    const requiredFields: (keyof ProductFormData)[] = ['name', 'barcode', 'price', 'initialQuantity'];
    
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      const productData: CreateProductRequest = {
        name: formData.name.value.trim(),
        description: formData.description.value.trim() || undefined,
        barcode: formData.barcode.value.trim(),
        price: parseFloat(formData.price.value),
        category: formData.category.value.trim() || undefined,
        brand: formData.brand.value.trim() || undefined,
        initialQuantity: parseInt(formData.initialQuantity.value, 10),
      };

      const response = await createProduct(productData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Product created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create product');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleScanBarcode = () => {
    (navigation as any).navigate('ScanBarcode', { mode: 'add' });
  };

  const clearForm = () => {
    setFormData({
      name: { value: '', error: '', touched: false },
      description: { value: '', error: '', touched: false },
      barcode: { value: '', error: '', touched: false },
      price: { value: '', error: '', touched: false },
      category: { value: '', error: '', touched: false },
      brand: { value: '', error: '', touched: false },
      initialQuantity: { value: '', error: '', touched: false },
    });
  };

  if (isLoading) {
    return (
      <>
        <HeaderView title="Add Product" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Creating product...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderView title="Add Product" showBackButton />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Header */}
          <View style={styles.header}>
            <Ionicons name="cube-outline" size={48} color={colors.primary} />
            <Text style={styles.title}>Create New Product</Text>
            <Text style={styles.subtitle}>Fill in the product details below</Text>
          </View>

          {/* Product Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            
            <Input
              label="Product Name *"
              placeholder="Enter product name"
              value={formData.name.value}
              onChangeText={(text) => updateField('name', text)}
              error={formData.name.touched ? formData.name.error : undefined}
              icon="cube-outline"
            />

            <Input
              label="Description"
              placeholder="Enter product description (optional)"
              value={formData.description.value}
              onChangeText={(text) => updateField('description', text)}
              error={formData.description.touched ? formData.description.error : undefined}
              icon="document-text-outline"
              multiline
              numberOfLines={3}
            />

            <View style={styles.barcodeContainer}>
              <View style={styles.barcodeInputContainer}>
                <Input
                  label="Barcode *"
                  placeholder="Enter or scan barcode"
                  value={formData.barcode.value}
                  onChangeText={(text) => updateField('barcode', text)}
                  error={formData.barcode.touched ? formData.barcode.error : undefined}
                  icon="barcode-outline"
                />
              </View>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanBarcode}
              >
                <Ionicons name="scan-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <Input
              label="Category"
              placeholder="Enter product category (optional)"
              value={formData.category.value}
              onChangeText={(text) => updateField('category', text)}
              error={formData.category.touched ? formData.category.error : undefined}
              icon="pricetag-outline"
            />

            <Input
              label="Brand"
              placeholder="Enter brand name (optional)"
              value={formData.brand.value}
              onChangeText={(text) => updateField('brand', text)}
              error={formData.brand.touched ? formData.brand.error : undefined}
              icon="business-outline"
            />
          </View>

          {/* Pricing & Inventory Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
            
            <Input
              label="Price *"
              placeholder="0.00"
              value={formData.price.value}
              onChangeText={(text) => updateField('price', text)}
              error={formData.price.touched ? formData.price.error : undefined}
              icon="cash-outline"
              keyboardType="decimal-pad"
            />

            <Input
              label="Initial Quantity *"
              placeholder="0"
              value={formData.initialQuantity.value}
              onChangeText={(text) => updateField('initialQuantity', text)}
              error={formData.initialQuantity.touched ? formData.initialQuantity.error : undefined}
              icon="layers-outline"
              keyboardType="numeric"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Create Product"
              onPress={handleSubmit}
              variant="success"
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
            
            <Button
              title="Clear Form"
              onPress={clearForm}
              variant="outline"
              fullWidth
            />
          </View>

          {/* Bottom spacing for keyboard */}
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
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  barcodeInputContainer: {
    flex: 1,
  },

  scanButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default AddProductScreen;