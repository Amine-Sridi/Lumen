/**
 * Sales Service
 * 
 * BACKEND INTEGRATION GUIDE:
 * This service handles all sales transaction operations and analytics.
 * Critical for revenue tracking, inventory management, and business intelligence.
 * 
 * KEY PATTERNS FOR BACKEND DEVELOPERS:
 * - Sales operations must update inventory levels atomically (use database transactions)
 * - All sales must be tied to authenticated users (userId from JWT token)
 * - When creating sales, verify product ownership and inventory availability
 * - Sales analytics require aggregation queries for business intelligence
 * - Historical data preservation is critical for business reporting
 */

import axios, { AxiosResponse } from 'axios';
import { Sale, CreateSaleRequest, SalesSummary, ApiResponse, PaginatedResponse } from '../types';
import { API_URL } from '../context/AuthContext';

class SalesService {
  private baseURL = `${API_URL}/sales`;

  /**
   * Get paginated list of sales
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales?page=1&limit=50
   * - Filter sales by current user (from JWT token)
   * - Include product data (JOIN with products table)
   * - Order by saleDate DESC (most recent first)
   * - Return paginated results with total count
   */
  async getSales(page: number = 1, limit: number = 50): Promise<ApiResponse<PaginatedResponse<Sale>>> {
    try {
      const response: AxiosResponse<PaginatedResponse<Sale>> = await axios.get(
        `${this.baseURL}?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        data: response.data,
        message: 'Sales fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single sale by ID
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/:id
   * - Verify sale belongs to current user
   * - Include full product details
   * - Return 404 if not found or not owned by user
   */
  async getSaleById(id: string): Promise<ApiResponse<Sale>> {
    try {
      const response: AxiosResponse<Sale> = await axios.get(`${this.baseURL}/${id}`);

      return {
        success: true,
        data: response.data,
        message: 'Sale fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new sale
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/sales
   * - CRITICAL: Use database transaction for the following operations:
   *   1. Verify product belongs to user and exists
   *   2. Check inventory availability (quantity >= saleQuantity)
   *   3. Create sale record with userId from JWT token
   *   4. Update inventory quantity (subtract sold quantity)
   *   5. Calculate totalAmount = (unitPrice || product.price) * quantity
   * - Set saleDate to current timestamp
   * - Return created sale with product data
   * - Rollback transaction on any failure
   */
  async createSale(saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    try {
      const response: AxiosResponse<Sale> = await axios.post(this.baseURL, saleData);

      return {
        success: true,
        data: response.data,
        message: 'Sale recorded successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get sales summary and analytics
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/summary?startDate=2024-01-01&endDate=2024-12-31
   * - Filter by current user and optional date range
   * - Calculate aggregations:
   *   - totalSales: COUNT(*)
   *   - totalRevenue: SUM(totalAmount)
   *   - topProducts: GROUP BY productId, SUM(quantity), SUM(totalAmount)
   *   - salesByDate: GROUP BY DATE(saleDate), COUNT(*), SUM(totalAmount)
   * - Optimize with database indexes on userId, saleDate, productId
   */
  async getSalesSummary(startDate?: Date, endDate?: Date): Promise<ApiResponse<SalesSummary>> {
    try {
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/summary?${queryString}` : `${this.baseURL}/summary`;

      const response: AxiosResponse<SalesSummary> = await axios.get(url);

      return {
        success: true,
        data: response.data,
        message: 'Sales summary fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get sales within a specific date range
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/date-range?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
   * - Filter by current user AND saleDate between startDate and endDate
   * - Include product data (JOIN)
   * - Order by saleDate DESC
   * - Useful for generating reports for specific periods
   */
  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Sale[]>> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response: AxiosResponse<Sale[]> = await axios.get(`${this.baseURL}/date-range?${params}`);

      return {
        success: true,
        data: response.data,
        message: 'Sales by date range fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get sales by product ID
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/product/:productId
   * - Verify product belongs to current user
   * - Filter sales by current user AND productId
   * - Include product data
   * - Order by saleDate DESC
   * - Useful for analyzing product performance
   */
  async getSalesByProduct(productId: string): Promise<ApiResponse<Sale[]>> {
    try {
      const response: AxiosResponse<Sale[]> = await axios.get(`${this.baseURL}/product/${productId}`);

      return {
        success: true,
        data: response.data,
        message: 'Sales by product fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get daily sales report
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/daily-report/2024-01-15
   * - Filter by current user AND DATE(saleDate) = provided date
   * - Return summary with:
   *   - totalSales: COUNT(*)
   *   - totalRevenue: SUM(totalAmount)
   *   - salesByHour: GROUP BY HOUR(saleDate) for hourly breakdown
   *   - topProducts: most sold products for that day
   */
  async getDailySalesReport(date: Date): Promise<ApiResponse<any>> {
    try {
      const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/daily-report/${dateString}`);

      return {
        success: true,
        data: response.data,
        message: 'Daily sales report fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get monthly sales report
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/monthly-report/2024/1
   * - Filter by current user AND YEAR(saleDate) = year AND MONTH(saleDate) = month
   * - Return comprehensive monthly analytics:
   *   - totalSales, totalRevenue for the month
   *   - dailyBreakdown: sales and revenue for each day of the month
   *   - categoryBreakdown: if products have categories
   *   - monthOverMonth comparison if previous month data exists
   */
  async getMonthlySalesReport(year: number, month: number): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/monthly-report/${year}/${month}`);

      return {
        success: true,
        data: response.data,
        message: 'Monthly sales report fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get top selling products
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/sales/top-products?limit=10&startDate=2024-01-01&endDate=2024-12-31
   * - Filter by current user and optional date range
   * - GROUP BY productId
   * - Calculate: SUM(quantity) as totalQuantitySold, SUM(totalAmount) as totalRevenue
   * - ORDER BY totalQuantitySold DESC or totalRevenue DESC
   * - LIMIT to specified number
   * - Include product details (name, category, etc.)
   */
  async getTopSellingProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const response: AxiosResponse<any[]> = await axios.get(`${this.baseURL}/top-products?${params}`);

      return {
        success: true,
        data: response.data,
        message: 'Top selling products fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel a sale (if supported by backend)
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/sales/:id/cancel
   * - Verify sale belongs to current user
   * - Check if sale can be cancelled (recent sale, within cancellation period)
   * - Use database transaction:
   *   1. Update sale status to 'cancelled'
   *   2. Restore inventory quantity (add back the sold quantity)
   *   3. Log cancellation reason and timestamp
   * - Return updated sale data
   * - Consider business rules for cancellation limits
   */
  async cancelSale(saleId: string, reason: string): Promise<ApiResponse<Sale>> {
    try {
      const response: AxiosResponse<Sale> = await axios.post(`${this.baseURL}/${saleId}/cancel`, { reason });

      return {
        success: true,
        data: response.data,
        message: 'Sale cancelled successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * 
   * BACKEND ERROR SCENARIOS:
   * - 400: Invalid sale data, insufficient inventory
   * - 404: Sale not found or doesn't belong to user
   * - 409: Inventory conflict (concurrent sales)
   * - 422: Business rule violations (negative inventory, etc.)
   */
  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error occurred',
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error - please check your connection',
      };
    } else {
      // Other error
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export const salesService = new SalesService();