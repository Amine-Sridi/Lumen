import axios, { AxiosResponse } from 'axios';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse, PaginatedResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.0.193:3000/api';

class ProductService {
  private baseURL = `${API_BASE_URL}/products`;

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

  async getProducts(page: number = 1, limit: number = 50): Promise<ApiResponse<Product[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseURL}?page=${page}&limit=${limit}`,
        { headers }
      );

      // Handle the backend's nested response structure
      const products = response.data?.data?.items || response.data || [];
      
      return {
        success: true,
        data: Array.isArray(products) ? products : [],
        message: 'Products fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseURL}/search?q=${encodeURIComponent(query)}`,
        { headers }
      );

      // Handle the backend's response structure
      const products = response.data?.data || response.data || [];
      
      return {
        success: true,
        data: Array.isArray(products) ? products : [],
        message: 'Products searched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(`${this.baseURL}/${id}`, { headers });

      // Handle the backend's response structure
      const product = response.data?.data || response.data;

      return {
        success: true,
        data: product,
        message: 'Product fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseURL}/barcode/${encodeURIComponent(barcode)}`,
        { headers }
      );

      // Handle the backend's response structure
      const product = response.data?.data || response.data;

      return {
        success: true,
        data: product,
        message: 'Product found by barcode',
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Product not found',
        };
      }
      return this.handleError(error);
    }
  }

  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.post(this.baseURL, productData, { headers });

      // Handle the backend's response structure
      const product = response.data?.data || response.data;

      return {
        success: true,
        data: product,
        message: 'Product created successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<any> = await axios.put(`${this.baseURL}/${id}`, productData, { headers });

      // Handle the backend's response structure
      const product = response.data?.data || response.data;

      return {
        success: true,
        data: product,
        message: 'Product updated successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(`${this.baseURL}/${id}`, { headers });

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response: AxiosResponse<Product[]> = await axios.get(
        `${this.baseURL}/category/${encodeURIComponent(category)}`,
        { headers }
      );

      return {
        success: true,
        data: response.data,
        message: 'Products by category fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async uploadProductImage(productId: string, imageFile: FormData): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
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

      const response: AxiosResponse<{ imageUrl: string }> = await axios.post(
        `${this.baseURL}/${productId}/image`,
        imageFile,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Product image uploaded successfully',
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

export const productService = new ProductService();