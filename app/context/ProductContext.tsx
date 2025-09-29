/**
 * Product Context
 * Provides product state management for the inventory system
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse, PaginatedResponse } from '../types';
import { productService } from '../services/ProductService';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Product operations
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
  createProduct: (productData: CreateProductRequest) => Promise<ApiResponse<Product>>;
  updateProduct: (id: string, productData: UpdateProductRequest) => Promise<ApiResponse<Product>>;
  deleteProduct: (id: string) => Promise<ApiResponse<void>>;
  
  // State management
  clearError: () => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Fetch products
   */
  const fetchProducts = async (page: number = 1, limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.getProducts(page, limit);
      
      if (response.success && response.data) {
        // Ensure we always set an array
        const productsArray = Array.isArray(response.data) ? response.data : [];
        setProducts(productsArray);
      } else {
        setError(response.error || 'Failed to fetch products');
        setProducts([]); // Ensure products is always an array
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search products by name or barcode
   */
  const searchProducts = async (query: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.searchProducts(query);
      
      if (response.success && response.data) {
        // Ensure we always set an array
        const productsArray = Array.isArray(response.data) ? response.data : [];
        setProducts(productsArray);
      } else {
        setError(response.error || 'Failed to search products');
        setProducts([]); // Ensure products is always an array
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get a single product by ID
   */
  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      const response = await productService.getProductById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch product');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    }
  };

  /**
   * Get a product by barcode
   */
  const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const response = await productService.getProductByBarcode(barcode);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Don't set error for barcode not found - this is expected behavior
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    }
  };

  /**
   * Create a new product
   */
  const createProduct = async (productData: CreateProductRequest): Promise<ApiResponse<Product>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.createProduct(productData);
      
      if (response.success && response.data) {
        // Add the new product to the local state with safety check
        setProducts(prev => {
          const safeProducts = Array.isArray(prev) ? prev : [];
          return [...safeProducts, response.data!];
        });
      } else {
        setError(response.error || 'Failed to create product');
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing product
   */
  const updateProduct = async (id: string, productData: UpdateProductRequest): Promise<ApiResponse<Product>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.updateProduct(id, productData);
      
      if (response.success && response.data) {
        // Update the product in local state with safety check
        setProducts(prev => {
          const safeProducts = Array.isArray(prev) ? prev : [];
          return safeProducts.map(product => 
            product.id === id ? response.data! : product
          );
        });
      } else {
        setError(response.error || 'Failed to update product');
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a product
   */
  const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.deleteProduct(id);
      
      if (response.success) {
        // Remove the product from local state with safety check
        setProducts(prev => {
          const safeProducts = Array.isArray(prev) ? prev : [];
          return safeProducts.filter(product => product.id !== id);
        });
      } else {
        setError(response.error || 'Failed to delete product');
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Refresh products list
   */
  const refreshProducts = async (): Promise<void> => {
    await fetchProducts();
  };

  const value: ProductContextType = {
    products,
    isLoading,
    error,
    fetchProducts,
    searchProducts,
    getProductById,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    refreshProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};