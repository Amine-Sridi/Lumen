/**
 * Sales Context
 * Provides sales state management and analytics
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale, CreateSaleRequest, SalesSummary, ApiResponse, PaginatedResponse } from '../types';
import { salesService } from '../services/SalesService';

interface SalesContextType {
  sales: Sale[];
  salesSummary: SalesSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // Sales operations
  fetchSales: (page?: number, limit?: number) => Promise<void>;
  getSaleById: (id: string) => Promise<Sale | null>;
  createSale: (saleData: CreateSaleRequest) => Promise<ApiResponse<Sale>>;
  getSalesSummary: (startDate?: Date, endDate?: Date) => Promise<void>;
  getSalesByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  
  // State management
  clearError: () => void;
  refreshSales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | null>(null);

export const useSales = (): SalesContextType => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

interface SalesProviderProps {
  children: ReactNode;
}

export const SalesProvider: React.FC<SalesProviderProps> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
    getSalesSummary();
  }, []);

  /**
   * Fetch sales with pagination
   */
  const fetchSales = async (page: number = 1, limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await salesService.getSales(page, limit);
      
      if (response.success && response.data) {
        setSales(response.data.data);
      } else {
        setError(response.error || 'Failed to fetch sales');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get a single sale by ID
   */
  const getSaleById = async (id: string): Promise<Sale | null> => {
    try {
      const response = await salesService.getSaleById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch sale');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    }
  };

  /**
   * Create a new sale
   */
  const createSale = async (saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await salesService.createSale(saleData);
      
      if (response.success && response.data) {
        // Add the new sale to the local state
        setSales(prev => [response.data!, ...prev]);
        
        // Refresh sales summary to include the new sale
        await getSalesSummary();
      } else {
        setError(response.error || 'Failed to create sale');
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
   * Get sales summary and analytics
   */
  const getSalesSummary = async (startDate?: Date, endDate?: Date): Promise<void> => {
    try {
      const response = await salesService.getSalesSummary(startDate, endDate);
      
      if (response.success && response.data) {
        setSalesSummary(response.data);
      } else {
        setError(response.error || 'Failed to fetch sales summary');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  /**
   * Get sales within a specific date range
   */
  const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await salesService.getSalesByDateRange(startDate, endDate);
      
      if (response.success && response.data) {
        setSales(response.data);
      } else {
        setError(response.error || 'Failed to fetch sales by date range');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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
   * Refresh sales data
   */
  const refreshSales = async (): Promise<void> => {
    await Promise.all([
      fetchSales(),
      getSalesSummary(),
    ]);
  };

  const value: SalesContextType = {
    sales,
    salesSummary,
    isLoading,
    error,
    fetchSales,
    getSaleById,
    createSale,
    getSalesSummary,
    getSalesByDateRange,
    clearError,
    refreshSales,
  };

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};