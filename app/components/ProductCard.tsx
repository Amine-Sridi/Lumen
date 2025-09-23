/**
 * Product Card Component
 * Displays product information in a card format
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, InventoryItem } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../Styles/theme';

interface ProductCardProps {
  product: Product;
  inventory?: InventoryItem;
  onPress?: (product: Product) => void;
  showInventory?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inventory,
  onPress,
  showInventory = true,
}) => {
  const getStockStatus = () => {
    if (!inventory) return 'unknown';
    if (inventory.quantity === 0) return 'outOfStock';
    if (inventory.quantity <= inventory.minimumStock) return 'lowStock';
    return 'inStock';
  };

  const getStockColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'outOfStock':
        return colors.error;
      case 'lowStock':
        return colors.warning;
      case 'inStock':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStockText = () => {
    if (!inventory) return 'No inventory data';
    const status = getStockStatus();
    switch (status) {
      case 'outOfStock':
        return 'Out of Stock';
      case 'lowStock':
        return `Low Stock (${inventory.quantity})`;
      case 'inStock':
        return `In Stock (${inventory.quantity})`;
      default:
        return 'Unknown';
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={32} color={colors.textLight} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
        
        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        
        <View style={styles.details}>
          {product.category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.category}</Text>
            </View>
          )}
          
          {product.brand && (
            <Text style={styles.brand}>{product.brand}</Text>
          )}
        </View>
        
        {showInventory && (
          <View style={styles.footer}>
            <View style={styles.stockContainer}>
              <View style={[styles.stockIndicator, { backgroundColor: getStockColor() }]} />
              <Text style={[styles.stockText, { color: getStockColor() }]}>
                {getStockText()}
              </Text>
            </View>
            
            <Text style={styles.barcode}>{product.barcode}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  
  imageContainer: {
    height: 120,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  
  content: {
    padding: spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  
  tagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textOnPrimary,
  },
  
  brand: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  
  stockText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  barcode: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: 'monospace',
  },
});