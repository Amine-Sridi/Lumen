import axios, { AxiosResponse } from 'axios';
import { InventoryItem, UpdateInventoryRequest, StockAdjustment, ApiResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api';

class InventoryService {
  private baseURL = `${API_BASE_URL}/inventory`;

  private async getAuthHeaders() {
    let token;
    
    try {
      // Try SecureStore first (primary storage method)
      token = await SecureStore.getItemAsync('lumen_jwt_token');
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      token = await AsyncStorage.getItem('accessToken');
    }
    
    // If still no token, try AsyncStorage as final fallback
    if (!token) {
      token = await AsyncStorage.getItem('accessToken');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getInventory(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(this.baseURL, { headers });

      // Handle the backend's response structure
      const inventory = response.data?.data?.items || response.data?.data || response.data || [];

      return {
        success: true,
        data: Array.isArray(inventory) ? inventory : [],
        message: 'Inventory fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getInventoryByProductId(productId: string): Promise<ApiResponse<InventoryItem>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/${productId}`, { headers });

      // Handle the backend's response structure
      const inventoryItem = response.data?.data || response.data;

      return {
        success: true,
        data: inventoryItem,
        message: 'Inventory item fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateInventory(productId: string, data: UpdateInventoryRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.put(`${this.baseURL}/${productId}`, data, { headers });

      // Handle the backend's response structure
      const inventoryItem = response.data?.data || response.data;

      return {
        success: true,
        data: inventoryItem,
        message: 'Inventory updated successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async adjustStock(adjustment: StockAdjustment): Promise<ApiResponse<InventoryItem>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.post(`${this.baseURL}/adjust`, adjustment, { headers });

      // Handle the backend's response structure
      const inventoryItem = response.data?.data || response.data;

      return {
        success: true,
        data: inventoryItem,
        message: 'Stock adjusted successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/low-stock`, { headers });

      // Handle the backend's response structure
      const lowStockItems = response.data?.data?.items || response.data?.data || response.data || [];

      return {
        success: true,
        data: Array.isArray(lowStockItems) ? lowStockItems : [],
        message: 'Low stock items fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getInventoryHistory(productId: string, days: number = 30): Promise<ApiResponse<any[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any[]> = await axios.get(
        `${this.baseURL}/history/${productId}?days=${days}`,
        { headers }
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

  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        return {
          success: false,
          error: 'Invalid token - Please log in again',
        };
      } else if (error.response.status === 403) {
        return {
          success: false,
          error: 'Access denied - Insufficient permissions',
        };
      }
      
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error occurred',
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error - please check your connection',
      };
    } else {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export const inventoryService = new InventoryService();