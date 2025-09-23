/**
 * Product Service
 * 
 * BACKEND INTEGRATION GUIDE:
 * This service handles all product-related API operations. It defines the expected
 * REST API endpoints and data formats that the backend must implement.
 * 
 * KEY PATTERNS FOR BACKEND DEVELOPERS:
 * - All requests include JWT token in Authorization header (handled by axios interceptor)
 * - All responses follow ApiResponse<T> format (success/error wrapper)
 * - User context is provided via JWT token - extract userId from token payload
 * - Pagination uses standard page/limit query parameters
 * - Error handling expects specific HTTP status codes for different scenarios
 */

import axios, { AxiosResponse } from 'axios';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse, PaginatedResponse } from '../types';
import { API_URL } from '../context/AuthContext';

class ProductService {
  private baseURL = `${API_URL}/products`;

  /**
   * Get paginated list of products
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/products?page=1&limit=50
   * - Filter products by current user (from JWT token)
   * - Return paginated results with total count
   * - Include inventory data if available (JOIN with inventory table)
   */
  async getProducts(page: number = 1, limit: number = 50): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const response: AxiosResponse<PaginatedResponse<Product>> = await axios.get(
        `${this.baseURL}?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        data: response.data,
        message: 'Products fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Search products by name or barcode
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/products/search?q=searchTerm
   * - Search in name, description, barcode, category, brand fields
   * - Case-insensitive search using ILIKE (PostgreSQL) or LIKE (MySQL)
   * - Filter by current user only
   * - Limit results to prevent large response sizes
   */
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const response: AxiosResponse<Product[]> = await axios.get(
        `${this.baseURL}/search?q=${encodeURIComponent(query)}`
      );

      return {
        success: true,
        data: response.data,
        message: 'Products searched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single product by ID
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/products/:id
   * - Verify product belongs to current user
   * - Return 404 if not found or not owned by user
   * - Include related inventory data if available
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response: AxiosResponse<Product> = await axios.get(`${this.baseURL}/${id}`);

      return {
        success: true,
        data: response.data,
        message: 'Product fetched successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get a product by barcode
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/products/barcode/:barcode
   * - Search by barcode field (exact match)
   * - Filter by current user only
   * - Return 404 if not found (handled specially in frontend)
   * - Critical for barcode scanning functionality
   */
  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const response: AxiosResponse<Product> = await axios.get(
        `${this.baseURL}/barcode/${encodeURIComponent(barcode)}`
      );

      return {
        success: true,
        data: response.data,
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

  /**
   * Create a new product
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/products
   * - Validate all required fields (name, barcode, price, initialQuantity)
   * - Ensure barcode is unique per user
   * - Set userId from JWT token
   * - Create product record AND initial inventory record
   * - Use database transaction to ensure data consistency
   * - Return created product with generated ID and timestamps
   */
  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response: AxiosResponse<Product> = await axios.post(this.baseURL, productData);

      return {
        success: true,
        data: response.data,
        message: 'Product created successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Update an existing product
   * 
   * BACKEND IMPLEMENTATION:
   * - PUT /api/products/:id
   * - Verify product belongs to current user
   * - Validate updated fields (price > 0, etc.)
   * - If barcode is changed, ensure new barcode is unique per user
   * - Update only provided fields (partial update)
   * - Update updatedAt timestamp
   * - Return updated product data
   */
  async updateProduct(id: string, productData: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const response: AxiosResponse<Product> = await axios.put(`${this.baseURL}/${id}`, productData);

      return {
        success: true,
        data: response.data,
        message: 'Product updated successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a product
   * 
   * BACKEND IMPLEMENTATION:
   * - DELETE /api/products/:id
   * - Verify product belongs to current user
   * - Check if product has sales history (prevent deletion if sales exist)
   * - Delete related inventory records first (cascade delete)
   * - Return 204 No Content on success
   * - Consider soft delete for audit trail
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Get products by category
   * 
   * BACKEND IMPLEMENTATION:
   * - GET /api/products/category/:category
   * - Filter by category field and current user
   * - Case-insensitive category matching
   * - Return empty array if no products in category
   * - Useful for category-based inventory management
   */
  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      const response: AxiosResponse<Product[]> = await axios.get(
        `${this.baseURL}/category/${encodeURIComponent(category)}`
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

  /**
   * Upload product image
   * 
   * BACKEND IMPLEMENTATION:
   * - POST /api/products/:id/image
   * - Accept multipart/form-data with image file
   * - Validate file type (JPEG, PNG, WebP)
   * - Validate file size (max 5MB recommended)
   * - Store image in cloud storage (AWS S3, Cloudinary, etc.)
   * - Update product.imageUrl with public URL
   * - Return new imageUrl in response
   * - Consider image optimization/resizing
   */
  async uploadProductImage(productId: string, imageFile: FormData): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const response: AxiosResponse<{ imageUrl: string }> = await axios.post(
        `${this.baseURL}/${productId}/image`,
        imageFile,
        {
          headers: {
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

  /**
   * Handle API errors consistently
   * 
   * BACKEND ERROR HANDLING:
   * - Return appropriate HTTP status codes
   * - Use consistent error response format: { success: false, error: string, code?: string }
   * - Common status codes:
   *   - 400: Bad Request (validation errors)
   *   - 401: Unauthorized (invalid/expired token)
   *   - 403: Forbidden (access denied)
   *   - 404: Not Found (resource doesn't exist or not owned by user)
   *   - 409: Conflict (duplicate barcode, etc.)
   *   - 500: Internal Server Error
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

export const productService = new ProductService();