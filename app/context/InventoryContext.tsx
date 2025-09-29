/**
 * Inventory Context
 * Provides inventory state management for stock tracking
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, UpdateInventoryRequest, StockAdjustment, ApiResponse, PaginatedResponse } from '../types';
import { inventoryService } from '../services/InventoryService';

interface InventoryContextType {
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  
  // Inventory operations
  fetchInventory: (page?: number, limit?: number) => Promise<void>;
  getInventoryByProductId: (productId: string) => Promise<InventoryItem | null>;
  updateInventory: (productId: string, data: UpdateInventoryRequest) => Promise<ApiResponse<InventoryItem>>;
  adjustStock: (adjustment: StockAdjustment) => Promise<ApiResponse<InventoryItem>>;
  getLowStockItems: () => Promise<void>;
  
  // State management
  clearError: () => void;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    getLowStockItems();
  }, []);

  /**
   * Fetch inventory items
   */
  const fetchInventory = async (page: number = 1, limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryService.getInventory();
      
      if (response.success && response.data) {
        // Ensure inventory is always an array
        const safeInventory = Array.isArray(response.data) ? response.data : [];
        setInventory(safeInventory);
      } else {
        setInventory([]); // Set empty array on error to prevent undefined
        setError(response.error || 'Failed to fetch inventory');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setInventory([]); // Ensure array on error
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get inventory item by product ID
   */
  const getInventoryByProductId = async (productId: string): Promise<InventoryItem | null> => {
    try {
      const response = await inventoryService.getInventoryByProductId(productId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch inventory item');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    }
  };

  /**
   * Update inventory item
   */
  const updateInventory = async (productId: string, data: UpdateInventoryRequest): Promise<ApiResponse<InventoryItem>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryService.updateInventory(productId, data);
      
      if (response.success && response.data) {
        // Update the inventory item in local state
        setInventory(prev => {
          const safeInventory = Array.isArray(prev) ? prev : [];
          return safeInventory.map(item => 
            item.productId === productId ? response.data! : item
          );
        });

        // Update low stock items if necessary
        await getLowStockItems();
      } else {
        setError(response.error || 'Failed to update inventory');
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
   * Adjust stock quantity
   */
  const adjustStock = async (adjustment: StockAdjustment): Promise<ApiResponse<InventoryItem>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryService.adjustStock(adjustment);
      
      if (response.success && response.data) {
        // Update the inventory item in local state
        setInventory(prev => {
          const safeInventory = Array.isArray(prev) ? prev : [];
          return safeInventory.map(item => 
            item.productId === adjustment.productId ? response.data! : item
          );
        });

        // Update low stock items if necessary
        await getLowStockItems();
      } else {
        setError(response.error || 'Failed to adjust stock');
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
   * Get items with low stock
   */
  const getLowStockItems = async (): Promise<void> => {
    try {
      const response = await inventoryService.getLowStockItems();
      
      if (response.success && response.data) {
        // Ensure low stock items is always an array
        const safeLowStockItems = Array.isArray(response.data) ? response.data : [];
        setLowStockItems(safeLowStockItems);
      } else {
        setLowStockItems([]); // Set empty array on error to prevent undefined
        setError(response.error || 'Failed to fetch low stock items');
      }
    } catch (err: any) {
      console.error('Error fetching low stock items:', err);
      setLowStockItems([]); // Ensure array on error
      setError(err.message || 'An unexpected error occurred');
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Refresh inventory data
   */
  const refreshInventory = async (): Promise<void> => {
    await Promise.all([
      fetchInventory(),
      getLowStockItems(),
    ]);
  };

  const value: InventoryContextType = {
    inventory,
    lowStockItems,
    isLoading,
    error,
    fetchInventory,
    getInventoryByProductId,
    updateInventory,
    adjustStock,
    getLowStockItems,
    clearError,
    refreshInventory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};