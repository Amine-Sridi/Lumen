/**
 * App Navigator - Enhanced with Drawer Navigation
 * Professional navigation structure with sidebar/drawer layout
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../Styles/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CustomDrawer } from '../components/CustomDrawer';

// Import screens
import LoginScreen from '../Screens/Login';
import RegisterScreen from '../Screens/Register';
import DashboardScreen from '../Screens/Dashboard';
import ProductListScreen from '../Screens/ProductList';
import AddProductScreen from '../Screens/AddProduct';
import ScanBarcodeScreen from '../Screens/ScanBarcode';
import ProductDetailsScreen from '../Screens/ProductDetails';
import RecordSaleScreen from '../Screens/RecordSale';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/**
 * Main App Screens with Drawer Navigation
 */
const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false, // We'll use our custom HeaderView
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Products" 
        component={ProductListScreen}
        options={{
          drawerLabel: 'Products',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{
          drawerLabel: 'Add Product',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Scanner" 
        component={ScanBarcodeScreen}
        options={{
          drawerLabel: 'Barcode Scanner',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Sales" 
        component={RecordSaleScreen}
        options={{
          drawerLabel: 'Record Sale',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

/**
 * Stack Navigator for Modal Screens
 */
const AppStack: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{
          title: 'Product Details',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Main App Navigator
 */
export const AppNavigator: React.FC = () => {
  const { authState } = useAuth();

  if (authState?.isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <NavigationContainer>
      {authState?.authenticated ? (
        <AppStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};