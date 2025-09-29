/**
 * Core type definitions for the Lumen Inventory Management System
 * 
 * This file defines all TypeScript interfaces and types used throughout the application.
 * These types serve as the contract between frontend and backend, ensuring type safety
 * and consistent data structures across the entire system.
 * 
 * Categories:
 * - User and Authentication types
 * - Product and Inventory types  
 * - Sales and Transaction types
 * - API Response types
 * - Navigation types
 * - UI Component types
 * - Utility types
 * 
 * Backend developers should ensure API responses match these exact type definitions.
 */

// User and Authentication Related Types
// These interfaces define the structure for user accounts and authentication data

export interface User {
  id: string;              // Unique identifier (UUID recommended)
  email: string;           // User's email address (must be unique)
  firstName?: string;      // User's first name (optional)
  lastName?: string;       // User's last name (optional) 
  phone?: string;          // User's phone number (optional, international format)
  businessName?: string;   // Business name (optional)
  businessType?: string;   // Business type/industry (optional)
  businessAddress?: string; // Business address (optional)
  lastLoginAt?: Date;      // Last login timestamp (optional)
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last account update timestamp
}

// Authentication state interface - tracks current user session
export interface AuthState {
  token: string | null;              // JWT authentication token
  authenticated: boolean | null;     // Authentication status (null = checking, true = authenticated, false = not authenticated)
  user?: User | null;               // Current user data (undefined = not loaded, null = no user)
  isLoading?: boolean;              // Loading state for auth operations
}

// Login credentials interface - data required for user login
export interface LoginCredentials {
  email: string;           // User's email address
  password: string;        // User's password (plain text, will be hashed by backend)
}

// Registration credentials interface - extends login credentials with additional user data
export interface RegisterCredentials extends LoginCredentials {
  firstName?: string;      // User's first name (optional but recommended)
  lastName?: string;       // User's last name (optional but recommended)
  phone?: string;          // User's phone number (optional)
}

// Product and Inventory Related Types
// These interfaces define the structure for product catalog and inventory management

export interface Product {
  id: string;              // Unique product identifier (UUID recommended)
  name: string;            // Product name/title (required)
  description?: string;    // Detailed product description (optional)
  barcode: string;         // Product barcode/SKU (must be unique per user)
  price: number;           // Product price (decimal, represents currency units)
  category?: string;       // Product category for organization (optional)
  brand?: string;          // Product brand/manufacturer (optional)
  imageUrl?: string;       // URL to product image (optional)
  createdAt: Date;         // Product creation timestamp
  updatedAt: Date;         // Last product update timestamp
  userId: string;          // Foreign key to User who owns this product
}

// Interface for creating new products - includes initial inventory quantity
export interface CreateProductRequest {
  name: string;            // Product name (required)
  description?: string;    // Product description (optional)
  barcode: string;         // Product barcode (required, must be unique per user)
  price: number;           // Product price (required, positive number)
  category?: string;       // Product category (optional)
  brand?: string;          // Product brand (optional)
  imageUrl?: string;       // Product image URL (optional)
  initialQuantity: number; // Starting inventory quantity (required, non-negative)
}

// Interface for updating existing products - all fields optional
export interface UpdateProductRequest {
  name?: string;           // Updated product name
  description?: string;    // Updated product description
  price?: number;          // Updated product price
  category?: string;       // Updated product category
  brand?: string;          // Updated product brand
  imageUrl?: string;       // Updated product image URL
}

// Inventory management interface - tracks stock levels for products
export interface InventoryItem {
  id: string;              // Unique inventory record identifier
  productId: string;       // Foreign key to Product (one-to-one relationship)
  quantity: number;        // Current stock quantity (non-negative integer)
  minimumStock: number;    // Minimum stock level for low stock alerts (non-negative)
  maximumStock?: number;   // Maximum stock level (optional, for reorder management)
  lastRestocked?: Date;    // Timestamp of last restock operation (optional)
  createdAt: Date;         // Inventory record creation timestamp
  updatedAt: Date;         // Last inventory update timestamp
  product?: Product;       // Associated product data (populated via JOIN)
}

// Interface for updating inventory levels
export interface UpdateInventoryRequest {
  quantity?: number;       // New current quantity
  minimumStock?: number;   // New minimum stock threshold
  maximumStock?: number;   // New maximum stock level
}

// Interface for recording stock adjustments (additions, subtractions, etc.)
export interface StockAdjustment {
  productId: string;       // Product being adjusted
  quantity: number;        // Quantity change (positive for additions, negative for subtractions)
  type: 'addition' | 'subtraction' | 'sale' | 'damage' | 'expired'; // Reason for adjustment
  reason?: string;         // Additional details about the adjustment (optional)
}

// Sales transaction interface - records all purchase transactions
export interface Sale {
  id: string;              // Unique sale transaction identifier
  productId: string;       // Foreign key to Product being sold
  quantity: number;        // Number of units sold (positive integer)
  unitPrice: number;       // Price per unit at time of sale (preserves historical pricing)
  totalAmount: number;     // Total amount for this sale (unitPrice * quantity)
  saleDate: Date;          // Transaction timestamp
  notes?: string;          // Additional sale notes (optional)
  userId: string;          // Foreign key to User who processed the sale
  product?: Product;       // Associated product data (populated via JOIN)
}

// Interface for creating new sales transactions
export interface CreateSaleRequest {
  productId: string;       // Product being sold (required)
  quantity: number;        // Quantity being purchased (required, positive integer)
  unitPrice?: number;      // Override price (optional, uses product price if not provided)
  notes?: string;          // Sale notes (optional)
}

// Sales analytics interface - provides sales performance metrics
export interface SalesSummary {
  totalSales: number;      // Total number of sale transactions
  totalRevenue: number;    // Total revenue amount from all sales
  topProducts: Array<{     // Best-selling products by revenue
    productId: string;     // Product identifier
    productName: string;   // Product display name
    quantity: number;      // Total quantity sold
    revenue: number;       // Total revenue from this product
  }>;
  salesByDate: Array<{     // Daily sales breakdown
    date: string;          // Date in YYYY-MM-DD format
    sales: number;         // Number of transactions on this date
    revenue: number;       // Total revenue on this date
  }>;
}

// Standard API response wrapper - all API endpoints return this format
export interface ApiResponse<T> {
  success: boolean;        // Indicates if the request was successful
  data?: T;               // Response data (present on success)
  message?: string;        // Success message or additional info
  error?: string;          // Error message (present on failure)
}

// Detailed error information for API responses
export interface ApiError {
  message: string;         // Human-readable error message
  code?: string;          // Error code for programmatic handling (e.g., 'INVALID_CREDENTIALS')
  details?: any;          // Additional error details or validation errors
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Products: undefined;
  Scanner: undefined;
  Sales: undefined;
  AddProduct: { scannedBarcode?: string } | undefined;
  ProductDetails: { productId: string };
  Home: undefined;
  ScanBarcode: { mode: 'add' | 'sale' };
  RecordSale: { productId: string };
  EditProduct: { productId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Sales: undefined;
  Scanner: { mode?: 'add' | 'sale' };
};

// Component prop types
export interface ProductCardProps {
  product: Product;
  inventory?: InventoryItem;
  onPress?: (product: Product) => void;
  showInventory?: boolean;
}

export interface InventoryCardProps {
  item: InventoryItem;
  onPress?: (item: InventoryItem) => void;
  showLowStock?: boolean;
}

export interface SaleCardProps {
  sale: Sale;
  onPress?: (sale: Sale) => void;
}

// Scanner types
export interface BarcodeScanResult {
  type: string;
  data: string;
}

export interface ScannerPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

// Form types
export interface FormField {
  value: string;
  error?: string;
  touched?: boolean;
}

export interface ProductFormData {
  name: FormField;
  description: FormField;
  barcode: FormField;
  price: FormField;
  category: FormField;
  brand: FormField;
  initialQuantity: FormField;
}

export interface SaleFormData {
  quantity: FormField;
  unitPrice: FormField;
  notes: FormField;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AppState {
  auth: AuthState;
  products: {
    items: Product[];
    loading: boolean;
    error?: string | null;
  };
  inventory: {
    items: InventoryItem[];
    loading: boolean;
    error?: string | null;
  };
  sales: {
    items: Sale[];
    summary?: SalesSummary;
    loading: boolean;
    error?: string | null;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Theme and styling types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}