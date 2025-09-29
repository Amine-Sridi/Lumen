/**
 * Scan Barcode Screen
 * Camera-based barcode scanning for product lookup
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { HeaderView } from '../components/HeaderView';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useProducts } from '../context/ProductContext';
import { RootStackParamList, BarcodeScanResult } from '../types';

type ScanBarcodeRouteProp = RouteProp<RootStackParamList, 'ScanBarcode'>;

const { width, height } = Dimensions.get('window');

const ScanBarcodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScanBarcodeRouteProp>();
  const { mode = 'add' } = route.params || {};
  
  const { getProductByBarcode } = useProducts();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanResult) => {
    if (scanned) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      // Look up product by barcode
      const existingProduct = await getProductByBarcode(data);
      console.log('🔍 Barcode scan result:', { barcode: data, product: existingProduct });

      if (existingProduct) {
        // Product found - handle based on mode
        if (mode === 'sale') {
          Alert.alert(
            'Product Found',
            `${existingProduct.name}\nPrice: $${existingProduct.price}`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setScanned(false),
              },
              {
                text: 'Record Sale',
                onPress: () => {
                  (navigation as any).navigate('RecordSale', { 
                    productId: existingProduct.id 
                  });
                },
              },
            ]
          );
        } else {
          // Add mode - product already exists
          Alert.alert(
            'Product Already Exists',
            `"${existingProduct.name}" is already in your inventory.`,
            [
              {
                text: 'Scan Again',
                style: 'cancel',
                onPress: () => setScanned(false),
              },
              {
                text: 'View Product',
                onPress: () => {
                  (navigation as any).navigate('ProductDetails', { 
                    productId: existingProduct.id 
                  });
                },
              },
            ]
          );
        }
      } else {
        // Product not found
        if (mode === 'sale') {
          Alert.alert(
            'Product Not Found',
            `No product found with barcode: ${data}\n\nYou need to add this product to your inventory before recording a sale.`,
            [
              {
                text: 'Scan Again',
                style: 'cancel',
                onPress: () => setScanned(false),
              },
              {
                text: 'Add to Inventory',
                onPress: () => {
                  (navigation as any).navigate('AddProduct', { 
                    scannedBarcode: data 
                  });
                },
              },
            ]
          );
        } else {
          // Add mode - create new product with this barcode
          Alert.alert(
            'New Product',
            `Create a new product with barcode: ${data}?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setScanned(false),
              },
              {
                text: 'Create Product',
                onPress: () => {
                  (navigation as any).navigate('AddProduct', { 
                    scannedBarcode: data 
                  });
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error processing scanned barcode:', error);
      
      // If barcode lookup fails, treat it as "product not found" rather than an error
      // This handles the case where the API is down or validation fails
      if (mode === 'sale') {
        Alert.alert(
          'Product Not Found',
          `Cannot find product with barcode: ${data}\n\nThe product might not be in your inventory yet.`,
          [
            {
              text: 'Scan Again',
              style: 'cancel',
              onPress: () => setScanned(false),
            },
            {
              text: 'Add to Inventory',
              onPress: () => {
                (navigation as any).navigate('AddProduct', { 
                  scannedBarcode: data 
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Add New Product',
          `Create a new product with barcode: ${data}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setScanned(false),
            },
            {
              text: 'Create Product',
              onPress: () => {
                (navigation as any).navigate('AddProduct', { 
                  scannedBarcode: data 
                });
              },
            },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Enter Barcode',
      'Type the barcode manually:',
      (text) => {
        if (text && text.trim()) {
          handleBarCodeScanned({
            type: 'manual',
            data: text.trim(),
          });
        }
      },
      'plain-text'
    );
  };

  if (hasPermission === null) {
    return (
      <>
        <HeaderView title="Barcode Scanner" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </>
    );
  }

  if (hasPermission === false) {
    return (
      <>
        <HeaderView title="Barcode Scanner" showBackButton />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="camera-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Camera Permission Required</Text>
          <Text style={styles.errorMessage}>
            Please grant camera permission to scan barcodes
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              // On iOS, this will open app settings
              if (Platform.OS === 'ios') {
                Alert.alert(
                  'Permission Required',
                  'Please go to Settings > Lumen > Camera and enable camera access.',
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <HeaderView 
        title={mode === 'sale' ? 'Scan for Sale' : 'Scan Product'} 
        showBackButton 
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Processing barcode...</Text>
        </View>
      )}

      <View style={styles.container}>
        {/* Camera View */}
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />

        {/* Scanner Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>
              {mode === 'sale' 
                ? 'Point camera at product barcode to record sale' 
                : 'Point camera at barcode to add product'
              }
            </Text>
          </View>

          {/* Scanner frame */}
          <View style={styles.scannerFrame}>
            <View style={styles.scannerCorner} />
            <View style={[styles.scannerCorner, styles.topRight]} />
            <View style={[styles.scannerCorner, styles.bottomLeft]} />
            <View style={[styles.scannerCorner, styles.bottomRight]} />
          </View>

          {/* Bottom overlay with controls */}
          <View style={styles.overlayBottom}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleManualEntry}
            >
              <Ionicons name="keypad-outline" size={24} color={colors.white} />
              <Text style={styles.controlButtonText}>Manual Entry</Text>
            </TouchableOpacity>

            {scanned && (
              <TouchableOpacity
                style={[styles.controlButton, styles.rescanButton]}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh-outline" size={24} color={colors.white} />
                <Text style={styles.controlButtonText}>Scan Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close-outline" size={24} color={colors.white} />
              <Text style={styles.controlButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  settingsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  settingsButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  overlayTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  scannerFrame: {
    alignSelf: 'center',
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 280,
    maxHeight: 280,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 0,
  },
  overlayBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  rescanButton: {
    backgroundColor: colors.primary,
  },
  controlButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default ScanBarcodeScreen;