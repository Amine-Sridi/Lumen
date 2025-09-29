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
   * Fetch sales
   */
  const fetchSales = async (page: number = 1, limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await salesService.getSales();
      
      if (response.success && response.data) {
        // Ensure sales is always an array
        const safeSales = Array.isArray(response.data) ? response.data : [];
        setSales(safeSales);
      } else {
        setSales([]); // Set empty array on error to prevent undefined
        setError(response.error || 'Failed to fetch sales');
      }
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setSales([]); // Ensure array on error
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
        setSales(prev => {
          const safeSales = Array.isArray(prev) ? prev : [];
          return [response.data!, ...safeSales];
        });
        
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
        // If the API endpoint doesn't exist (404), calculate summary locally
        if (response.error?.includes('404') || response.error?.toLowerCase().includes('not found')) {
          console.warn('Sales summary endpoint not available, calculating locally');
          calculateLocalSummary();
        } else {
          setError(response.error || 'Failed to fetch sales summary');
        }
      }
    } catch (err: any) {
      console.warn('Sales summary endpoint error, falling back to local calculation');
      calculateLocalSummary();
    }
  };

  /**
   * Calculate sales summary locally from current sales data
   */
  const calculateLocalSummary = (): void => {
    const safeSales = Array.isArray(sales) ? sales : [];
    
    const totalSales = safeSales.length;
    const totalRevenue = safeSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    
    // Calculate top products by revenue
    const productStats = safeSales.reduce((acc, sale) => {
      const productId = sale.productId;
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: sale.product?.name || 'Unknown Product',
          quantity: 0,
          revenue: 0,
        };
      }
      acc[productId].quantity += sale.quantity || 0;
      acc[productId].revenue += sale.totalAmount || 0;
      return acc;
    }, {} as Record<string, any>);
    
    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
    
    // Calculate sales by date for the last 7 days
    const salesByDate: Array<{date: string; sales: number; revenue: number}> = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const daySales = safeSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.toDateString() === date.toDateString();
      });
      
      salesByDate.push({
        date: dateStr,
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
      });
    }
    
    const summary: SalesSummary = {
      totalSales,
      totalRevenue,
      topProducts,
      salesByDate,
    };
    
    setSalesSummary(summary);
  };

  /**
   * Get sales within a specific date range (placeholder for future implementation)
   */
  const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, just fetch all sales and filter by date on client side
      const response = await salesService.getSales();
      
      if (response.success && response.data) {
        // Ensure response.data is an array
        const safeSales = Array.isArray(response.data) ? response.data : [];
        const filteredSales = safeSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= startDate && saleDate <= endDate;
        });
        setSales(filteredSales);
      } else {
        setSales([]); // Set empty array on error to prevent undefined
        setError(response.error || 'Failed to fetch sales by date range');
      }
    } catch (err: any) {
      console.error('Error fetching sales by date range:', err);
      setSales([]); // Ensure array on error
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