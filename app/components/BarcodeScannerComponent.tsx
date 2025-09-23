/**
 * Barcode Scanner Component
 * Handles barcode scanning with camera integration and permissions
 * Note: This is a placeholder implementation. Full functionality requires expo-camera and expo-barcode-scanner packages.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../Styles/theme';
import { Button } from './Button';
import { Input } from './Input';

interface BarcodeScannerComponentProps {
  onBarcodeScanned: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export const BarcodeScannerComponent: React.FC<BarcodeScannerComponentProps> = ({
  onBarcodeScanned,
  onClose,
  isActive,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());
      setManualBarcode('');
    } else {
      Alert.alert('Error', 'Please enter a barcode');
    }
  };

  const handleTestBarcode = (testCode: string) => {
    onBarcodeScanned(testCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barcode Scanner</Text>
        <Button
          title="Close"
          onPress={onClose}
          variant="secondary"
          size="small"
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.scannerPlaceholder}>
          <Ionicons name="camera-outline" size={64} color={colors.textLight} />
          <Text style={styles.placeholderText}>
            Camera scanner will be available when expo-camera is properly configured
          </Text>
        </View>
        
        <View style={styles.manualInput}>
          <Text style={styles.sectionTitle}>Manual Barcode Entry</Text>
          <Input
            label="Barcode"
            placeholder="Enter barcode manually"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="default"
          />
          <Button
            title="Submit Barcode"
            onPress={handleManualSubmit}
            variant="primary"
            fullWidth
          />
        </View>
        
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test Barcodes</Text>
          <Text style={styles.sectionDescription}>
            Use these sample barcodes for testing:
          </Text>
          
          <View style={styles.testButtons}>
            <Button
              title="Test Product 1 (123456789012)"
              onPress={() => handleTestBarcode('123456789012')}
              variant="outline"
              size="small"
            />
            <Button
              title="Test Product 2 (987654321098)"
              onPress={() => handleTestBarcode('987654321098')}
              variant="outline"
              size="small"
            />
            <Button
              title="Test Product 3 (456789123456)"
              onPress={() => handleTestBarcode('456789123456')}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  
  scannerPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 200,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  
  manualInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  testSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  
  testButtons: {
    gap: spacing.sm,
  },
});