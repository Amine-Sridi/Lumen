# API Documentation for Backend Development

This document provides detailed API specifications for the Lumen Inventory Management System backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Login user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### POST /auth/register
Register new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <current_token>
```

### Product Endpoints

#### GET /products
Get all products for authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "barcode": "1234567890123",
      "price": 29.99,
      "category": "Electronics",
      "brand": "Brand Name",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "userId": "user_id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /products
Create new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "barcode": "1234567890123",
  "price": 29.99,
  "category": "Electronics",
  "brand": "Brand Name",
  "imageUrl": "https://example.com/image.jpg",
  "initialQuantity": 10
}
```

#### GET /products/:id
Get product by ID.

#### PUT /products/:id
Update product.

#### DELETE /products/:id
Delete product.

### Inventory Endpoints

#### GET /inventory
Get all inventory items.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "inventory_id",
      "productId": "product_id",
      "quantity": 25,
      "minimumStock": 5,
      "maximumStock": 100,
      "lastRestocked": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": "product_id",
        "name": "Product Name",
        "barcode": "1234567890123"
      }
    }
  ]
}
```

#### POST /inventory/adjust
Adjust inventory levels.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 5,
  "type": "addition",
  "reason": "Restocking"
}
```

### Sales Endpoints

#### GET /sales
Get all sales records.

#### POST /sales
Record new sale.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "unitPrice": 29.99,
  "notes": "Customer purchase"
}
```

#### GET /sales/summary
Get sales summary and analytics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": 150,
    "totalRevenue": 4497.50,
    "topProducts": [
      {
        "productId": "product_id",
        "productName": "Product Name",
        "quantity": 25,
        "revenue": 749.75
      }
    ],
    "salesByDate": [
      {
        "date": "2024-01-01",
        "sales": 10,
        "revenue": 299.90
      }
    ]
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  image_url VARCHAR(500),
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 0,
  maximum_stock INT,
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Notes

1. **Authentication**: Use JWT tokens with appropriate expiration times
2. **Data Validation**: Validate all input data before processing
3. **Error Handling**: Return consistent error responses
4. **Pagination**: Implement pagination for list endpoints
5. **Search**: Support text search across product names and descriptions
6. **Security**: Implement rate limiting and input sanitization
7. **Database**: Use transactions for operations affecting multiple tables

## Testing

Recommended test scenarios:
- User registration and login flow
- Product CRUD operations
- Inventory adjustments and stock tracking
- Sales recording and reporting
- Authentication token management
- Error handling for invalid requests