import axios, { AxiosResponse } from 'axios';
import { Sale, CreateSaleRequest, SalesSummary, ApiResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api';

class SalesService {
  private baseURL = `${API_BASE_URL}/sales`;

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

  async getSales(): Promise<ApiResponse<Sale[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(this.baseURL, { headers });

      // Handle the backend's response structure
      const sales = response.data?.data?.items || response.data?.data || response.data || [];

      return {
        success: true,
        data: Array.isArray(sales) ? sales : [],
        message: 'Sales fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getSaleById(id: string): Promise<ApiResponse<Sale>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/${id}`, { headers });

      // Handle the backend's response structure
      const sale = response.data?.data || response.data;

      return {
        success: true,
        data: sale,
        message: 'Sale fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createSale(saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.post(this.baseURL, saleData, { headers });

      // Handle the backend's response structure
      const sale = response.data?.data || response.data;

      return {
        success: true,
        data: sale,
        message: 'Sale recorded successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getSalesSummary(startDate?: Date, endDate?: Date): Promise<ApiResponse<SalesSummary>> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}/stats/summary?${queryString}` : `${this.baseURL}/stats/summary`;

      const response: AxiosResponse<any> = await axios.get(url, { headers });

      // Handle the backend's response structure
      const salesSummary = response.data?.data || response.data;

      return {
        success: true,
        data: salesSummary,
        message: 'Sales summary fetched successfully',
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

export const salesService = new SalesService();