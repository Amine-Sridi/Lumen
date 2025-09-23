/**
 * Inventory Service
 * 
 * BACKEND INTEGRATION GUIDE:
 * This service manages inventory levels and stock tracking operations.
 * Critical for maintaining accurate stock counts and preventing overselling.
 * 
 * KEY PATTERNS FOR BACKEND DEVELOPERS:
 * - Inventory operations must be atomic (use database transactions)
 * - Stock adjustments must maintain audit trails for accountability
 * - Low stock alerts require real-time monitoring capabilities
 * - Concurrent inventory updates require proper locking mechanisms
 * - Integration with sales operations for automatic stock deduction
 */

import axios, { AxiosResponse } from 'axios';
import { InventoryItem, UpdateInventoryRequest, StockAdjustment, ApiResponse, PaginatedResponse } from '../types';
import { API_URL } from '../context/AuthContext';

class InventoryService {
  private baseURL = `${API_URL}/inventory`;

  /**
   * Get paginated list of inventory items
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/inventory?page=1&limit=50
   * - Filter inventory by current user's products (JOIN with products table)
   * - Include product details in response (product name, barcode, category)
   * - Order by quantity ASC to show low stock items first
   * - Support optional filtering by low stock, out of stock, category
   */
  async getInventory(page: number = 1, limit: number = 50): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    try {
      const response: AxiosResponse<PaginatedResponse<InventoryItem>> = await axios.get(
        `${this.baseURL}?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        data: response.data,
        message: 'Inventory fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get inventory item by product ID
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/inventory/product/:productId
   * - Verify product belongs to current user
   * - Return inventory record with product details
   * - Return 404 if product not found or doesn't belong to user
   * - Include lastRestocked timestamp and stock adjustment history summary
   */
  async getInventoryByProductId(productId: string): Promise<ApiResponse<InventoryItem>> {
    try {
      const response: AxiosResponse<InventoryItem> = await axios.get(`${this.baseURL}/product/${productId}`);

      return {
        success: true,
        data: response.data,
        message: 'Inventory item fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Update inventory item
   * 
   * BACKEND IMPLEMENTATION:
   * - PUT /api/inventory/product/:productId
   * - Verify product belongs to current user
   * - Validate input data (quantity >= 0, minimumStock >= 0)
   * - Update inventory record with new values
   * - Update lastRestocked timestamp if quantity is increased
   * - Log stock adjustment for audit trail
   * - Return updated inventory data
   */
  async updateInventory(productId: string, data: UpdateInventoryRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const response: AxiosResponse<InventoryItem> = await axios.put(`${this.baseURL}/product/${productId}`, data);

      return {
        success: true,
        data: response.data,
        message: 'Inventory updated successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Adjust stock quantity
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/inventory/adjust
   * - Verify product belongs to current user
   * - Use database transaction:
   *   1. Check current inventory level
   *   2. Calculate new quantity (current + adjustment.quantity)
   *   3. Validate new quantity >= 0 (prevent negative inventory)
   *   4. Update inventory quantity
   *   5. Create stock adjustment log entry with userId, timestamp, reason
   * - Update lastRestocked if adjustment type is 'addition'
   * - Support different adjustment types (addition, subtraction, sale, damage, expired)
   */
  async adjustStock(adjustment: StockAdjustment): Promise<ApiResponse<InventoryItem>> {
    try {
      const response: AxiosResponse<InventoryItem> = await axios.post(`${this.baseURL}/adjust`, adjustment);

      return {
        success: true,
        data: response.data,
        message: 'Stock adjusted successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get items with low stock
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/inventory/low-stock
   * - Filter by current user's products
   * - WHERE quantity <= minimumStock
   * - Include product details (name, barcode, category)
   * - Order by (quantity/minimumStock) ASC to show most critical items first
   * - Critical for proactive inventory management and reordering
   */
  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const response: AxiosResponse<InventoryItem[]> = await axios.get(`${this.baseURL}/low-stock`);

      return {
        success: true,
        data: response.data,
        message: 'Low stock items fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Create initial inventory for a product
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/inventory
   * - Verify product exists and belongs to current user
   * - Check if inventory record already exists (prevent duplicates)
   * - Create inventory record with:
   *   - productId, quantity, minimumStock, maximumStock (optional)
   *   - createdAt, updatedAt, lastRestocked (set to current time)
   * - Create initial stock adjustment log entry
   * - Return created inventory record
   * - This is typically called when creating a new product
   */
  async createInventory(productId: string, initialQuantity: number, minimumStock: number = 10): Promise<ApiResponse<InventoryItem>> {
    try {
      const response: AxiosResponse<InventoryItem> = await axios.post(this.baseURL, {
        productId,
        quantity: initialQuantity,
        minimumStock,
      });

      return {
        success: true,
        data: response.data,
        message: 'Inventory created successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get inventory history for a product
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/inventory/history/:productId?days=30
   * - Verify product belongs to current user
   * - Query stock_adjustments table for the last N days
   * - Include adjustment type, quantity change, reason, timestamp, user
   * - Order by timestamp DESC (most recent first)
   * - Useful for audit trails and identifying inventory patterns
   * - Consider pagination for products with high activity
   */
  async getInventoryHistory(productId: string, days: number = 30): Promise<ApiResponse<any[]>> {
    try {
      const response: AxiosResponse<any[]> = await axios.get(
        `${this.baseURL}/history/${productId}?days=${days}`
      );

      return {
        success: true,
        data: response.data,
        message: 'Inventory history fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Bulk update inventory
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/inventory/bulk-update
   * - Verify all products belong to current user
   * - Use database transaction for all updates:
   *   1. Lock all inventory records to prevent concurrent modifications
   *   2. Validate all quantity values >= 0
   *   3. Update all inventory records
   *   4. Create bulk stock adjustment log entries
   * - Rollback transaction if any update fails
   * - Return updated inventory items
   * - Useful for periodic stock counts and bulk restocking
   */
  async bulkUpdateInventory(updates: Array<{ productId: string; quantity: number }>): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const response: AxiosResponse<InventoryItem[]> = await axios.post(`${this.baseURL}/bulk-update`, {
        updates,
      });

      return {
        success: true,
        data: response.data,
        message: 'Bulk inventory update completed successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get inventory statistics
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/inventory/stats
   * - Filter by current user's products
   * - Calculate aggregations:
   *   - totalProducts: COUNT(*)
   *   - totalQuantity: SUM(quantity)
   *   - totalValue: SUM(quantity * product.price)
   *   - lowStockCount: COUNT where quantity <= minimumStock
   *   - outOfStockCount: COUNT where quantity = 0
   *   - topCategories: GROUP BY product.category, SUM(quantity)
   * - Useful for dashboard analytics and business intelligence
   */
  async getInventoryStats(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/stats`);

      return {
        success: true,
        data: response.data,
        message: 'Inventory statistics fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * 
   * BACKEND ERROR SCENARIOS:
   * - 400: Invalid inventory data, negative quantities
   * - 404: Product not found or doesn't belong to user
   * - 409: Concurrent inventory modification conflicts
   * - 422: Business rule violations (insufficient stock for sale)
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

export const inventoryService = new InventoryService();