# Lumen Inventory Management System - Backend Integration Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Authentication Flow](#authentication-flow)
5. [Frontend State Management](#frontend-state-management)
6. [Error Handling](#error-handling)
7. [Database Schema](#database-schema)
8. [Implementation Examples](#implementation-examples)

## System Overview

The Lumen Inventory Management System is a React Native application built with TypeScript and Expo. The frontend expects a RESTful API backend with JWT-based authentication. The application manages products, inventory tracking, sales recording, and user authentication.

### Key Technologies
- **Frontend**: React Native with TypeScript, Expo
- **Navigation**: React Navigation (Drawer Navigation)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: Expo SecureStore for sensitive data

### Base Configuration
- **API Base URL**: `http://localhost:3000/api` (configurable in `AuthContext.tsx`)
- **Authentication**: JWT tokens stored in secure storage
- **Content Type**: `application/json`

## API Endpoints

### Authentication Endpoints

#### POST /api/auth
**Purpose**: User login authentication
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Success Response** (200):
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "createdAt": "ISO_date_string",
    "updatedAt": "ISO_date_string"
  }
}
```
**Error Response** (401):
```json
{
  "message": "Invalid credentials"
}
```

#### POST /api/users
**Purpose**: User registration
**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```
**Success Response** (201):
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "createdAt": "ISO_date_string",
  "updatedAt": "ISO_date_string"
}
```

#### POST /api/auth/refresh
**Purpose**: Refresh JWT token
**Request Body**:
```json
{
  "token": "current_jwt_token"
}
```
**Success Response** (200):
```json
{
  "token": "new_jwt_token",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "createdAt": "ISO_date_string",
    "updatedAt": "ISO_date_string"
  }
}
```

### Product Management Endpoints

#### GET /api/products
**Purpose**: Retrieve all products for authenticated user
**Headers**: `Authorization: Bearer <token>`
**Success Response** (200):
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "barcode": "string",
    "price": "number",
    "category": "string",
    "brand": "string",
    "imageUrl": "string",
    "createdAt": "ISO_date_string",
    "updatedAt": "ISO_date_string",
    "userId": "string"
  }
]
```

#### POST /api/products
**Purpose**: Create new product
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "barcode": "string",
  "price": "number",
  "category": "string",
  "brand": "string",
  "imageUrl": "string",
  "initialQuantity": "number"
}
```

#### GET /api/products/:id
**Purpose**: Get specific product details
**Headers**: `Authorization: Bearer <token>`
**Success Response** (200): Same as product object above

#### PUT /api/products/:id
**Purpose**: Update product information
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Partial product object (only fields to update)

#### DELETE /api/products/:id
**Purpose**: Delete a product
**Headers**: `Authorization: Bearer <token>`
**Success Response** (204): No content

### Inventory Management Endpoints

#### GET /api/inventory
**Purpose**: Get all inventory items for authenticated user
**Headers**: `Authorization: Bearer <token>`
**Success Response** (200):
```json
[
  {
    "id": "string",
    "productId": "string",
    "quantity": "number",
    "minimumStock": "number",
    "maximumStock": "number",
    "lastRestocked": "ISO_date_string",
    "createdAt": "ISO_date_string",
    "updatedAt": "ISO_date_string",
    "product": {
      // Product object (optional, for joined queries)
    }
  }
]
```

#### PUT /api/inventory/:productId
**Purpose**: Update inventory quantities
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "quantity": "number",
  "minimumStock": "number",
  "maximumStock": "number"
}
```

#### POST /api/inventory/adjust
**Purpose**: Record stock adjustments
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "productId": "string",
  "quantity": "number",
  "type": "addition|subtraction|sale|damage|expired",
  "reason": "string"
}
```

### Sales Management Endpoints

#### GET /api/sales
**Purpose**: Get all sales records
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`: Page number for pagination
- `limit`: Number of records per page
- `startDate`: Filter sales from date
- `endDate`: Filter sales to date

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "string",
      "productId": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalAmount": "number",
      "saleDate": "ISO_date_string",
      "notes": "string",
      "userId": "string",
      "product": {
        // Product object (optional)
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### POST /api/sales
**Purpose**: Record a new sale
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "productId": "string",
  "quantity": "number",
  "unitPrice": "number", // Optional, will use product price if not provided
  "notes": "string"
}
```

#### GET /api/sales/summary
**Purpose**: Get sales analytics summary
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `period`: "week|month|quarter|year"
- `startDate`: Custom start date
- `endDate`: Custom end date

**Success Response** (200):
```json
{
  "totalSales": "number",
  "totalRevenue": "number",
  "topProducts": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": "number",
      "revenue": "number"
    }
  ],
  "salesByDate": [
    {
      "date": "YYYY-MM-DD",
      "sales": "number",
      "revenue": "number"
    }
  ]
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;              // Primary key
  email: string;           // Unique, required
  firstName?: string;      // Optional
  lastName?: string;       // Optional
  phone?: string;          // Optional
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model
```typescript
interface Product {
  id: string;              // Primary key
  name: string;            // Required
  description?: string;    // Optional
  barcode: string;         // Unique within user scope
  price: number;           // Required, decimal
  category?: string;       // Optional
  brand?: string;          // Optional
  imageUrl?: string;       // Optional, URL to image
  createdAt: Date;
  updatedAt: Date;
  userId: string;          // Foreign key to User
}
```

### Inventory Model
```typescript
interface InventoryItem {
  id: string;              // Primary key
  productId: string;       // Foreign key to Product
  quantity: number;        // Current stock quantity
  minimumStock: number;    // Low stock alert threshold
  maximumStock?: number;   // Optional maximum stock level
  lastRestocked?: Date;    // Optional last restock date
  createdAt: Date;
  updatedAt: Date;
}
```

### Sale Model
```typescript
interface Sale {
  id: string;              // Primary key
  productId: string;       // Foreign key to Product
  quantity: number;        // Quantity sold
  unitPrice: number;       // Price per unit at time of sale
  totalAmount: number;     // quantity * unitPrice
  saleDate: Date;          // When the sale occurred
  notes?: string;          // Optional sale notes
  userId: string;          // Foreign key to User
}
```

## Authentication Flow

### 1. Initial App Load
- App checks for stored JWT token in SecureStore
- If token exists, sets Authorization header and validates token
- If token is invalid, redirects to login screen
- If no token, shows login screen

### 2. Login Process
- User submits credentials via Login screen
- Frontend sends POST request to `/api/auth`
- Backend validates credentials and returns JWT + user data
- Frontend stores token securely and user data
- Sets Axios default Authorization header
- Navigates to main app (Dashboard)

### 3. Registration Process
- User fills registration form in Register screen
- Frontend sends POST request to `/api/users`
- Backend creates user and returns user data (no auto-login)
- User is redirected to login screen to sign in

### 4. Token Management
- JWT token is included in all authenticated requests
- Frontend implements token refresh mechanism
- On token expiry, attempts refresh before logout
- On authentication failure, clears stored data and redirects to login

## Frontend State Management

### Context Providers
The app uses React Context for state management:

#### AuthContext
- Manages user authentication state
- Handles login, logout, registration
- Stores user data and authentication token
- Provides authentication methods to components

#### ProductContext (to be implemented)
- Manages product data and operations
- Handles CRUD operations for products
- Caches product data for performance

#### InventoryContext (to be implemented)
- Manages inventory state and operations
- Handles stock level tracking
- Provides low stock alerts

#### SalesContext (to be implemented)
- Manages sales data and analytics
- Handles sales recording
- Provides sales summaries and reports

### Expected Data Flow
1. Components consume contexts via hooks (useAuth, useProducts, etc.)
2. Contexts make API calls using service layers
3. Responses update context state
4. Components re-render with updated data

## Error Handling

### API Error Format
All error responses should follow this format:
```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE", // Optional error code
  "details": {} // Optional additional error details
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **204**: Success with no content
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (duplicate data)
- **500**: Internal server error

### Frontend Error Handling
- Network errors are caught and displayed to users
- Authentication errors trigger logout
- Validation errors are shown in forms
- General errors show alert dialogs

## Database Schema

### Recommended Tables

#### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### products
```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  image_url VARCHAR(500),
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_barcode_per_user (barcode, user_id)
);
```

#### inventory
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
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_inventory (product_id)
);
```

#### sales
```sql
CREATE TABLE sales (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP NOT NULL,
  notes TEXT,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### stock_adjustments (Optional tracking table)
```sql
CREATE TABLE stock_adjustments (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  quantity_change INT NOT NULL, -- Positive for additions, negative for subtractions
  adjustment_type ENUM('addition', 'subtraction', 'sale', 'damage', 'expired') NOT NULL,
  reason TEXT,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Implementation Examples

### Backend Route Example (Node.js/Express)
```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get products endpoint
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { userId: req.user.id }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Create product endpoint
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, description, barcode, price, category, brand, imageUrl, initialQuantity } = req.body;
    
    // Create product
    const product = await Product.create({
      name, description, barcode, price, category, brand, imageUrl,
      userId: req.user.id
    });
    
    // Create inventory entry
    await Inventory.create({
      productId: product.id,
      quantity: initialQuantity || 0,
      minimumStock: 0
    });
    
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Barcode already exists for this user' });
    } else {
      res.status(500).json({ message: 'Error creating product' });
    }
  }
});
```

### Business Logic Requirements

#### Inventory Updates
- When a sale is recorded, automatically reduce inventory quantity
- Prevent sales if insufficient stock
- Generate low stock alerts when quantity <= minimumStock
- Track stock adjustments for audit purposes

#### User Data Isolation
- All data must be scoped to the authenticated user
- Users cannot access other users' data
- Implement proper authorization checks

#### Data Validation
- Validate email format and uniqueness
- Ensure positive values for prices and quantities
- Validate barcode uniqueness per user
- Sanitize input data to prevent injection attacks

#### Performance Considerations
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Consider caching for dashboard statistics
- Optimize queries with proper JOINs

## Security Requirements

### Authentication
- Use bcrypt for password hashing (minimum 10 rounds)
- Implement JWT with reasonable expiry times
- Validate token on every protected endpoint
- Implement refresh token mechanism

### Data Protection
- Use HTTPS in production
- Implement input validation and sanitization
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for API endpoints

### CORS Configuration
- Configure CORS to allow frontend domain
- Restrict allowed origins in production
- Handle preflight requests properly

This documentation provides the foundation for implementing the backend API that the Lumen frontend expects. The frontend is designed to be robust and handle various error conditions gracefully.