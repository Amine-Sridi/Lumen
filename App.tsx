import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './app/context/AuthContext';
import { ProductProvider } from './app/context/ProductContext';
import { InventoryProvider } from './app/context/InventoryContext';
import { SalesProvider } from './app/context/SalesContext';
import { AppNavigator } from './app/navigation/AppNavigator';
import { ErrorBoundary } from './app/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProductProvider>
          <InventoryProvider>
            <SalesProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </SalesProvider>
          </InventoryProvider>
        </ProductProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
