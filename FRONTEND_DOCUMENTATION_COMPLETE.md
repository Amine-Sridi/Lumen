# Lumen Inventory Management App - Complete Frontend Documentation

## 🎯 Overview for Backend Developers

This document provides comprehensive documentation for backend developers who need to implement the API and database layer for the Lumen Inventory Management application. The frontend is fully implemented and ready for integration.

## 📱 Application Architecture

The Lumen app is a React Native/Expo application built with TypeScript, featuring:

- **Professional drawer navigation** with sidebar menu
- **Complete authentication system** (JWT-based)
- **Independent registration process** with validation
- **Responsive layouts** with centered cards and adaptive buttons
- **Product management** with barcode scanning
- **Inventory tracking** with stock alerts
- **Sales recording** and analytics
- **Comprehensive error handling** and user feedback

## 🔑 Key Implementation Patterns

### Authentication Flow
1. User registers/logs in → JWT token received
2. Token stored securely in device storage
3. Token included in all API requests via axios interceptor
4. Token refresh handled automatically
5. Demo mode available for testing without backend

### Data Flow Architecture
1. **UI Components** trigger actions
2. **Context Providers** manage state
3. **Service Layer** handles API calls
4. **Backend API** processes requests
5. **Database** persists data

## 📊 Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  business_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  barcode VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category VARCHAR(100),
  brand VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, barcode) -- Barcode unique per user
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  maximum_stock INTEGER CHECK (maximum_stock IS NULL OR maximum_stock >= minimum_stock),
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id) -- One inventory record per product
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stock Adjustments Table (Audit Trail)
```sql
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('addition', 'subtraction', 'sale', 'damage', 'expired')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL CHECK (new_quantity >= 0),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX idx_stock_adjustments_created_at ON stock_adjustments(created_at);
```

## 🚀 API Endpoints Implementation Guide

### Base Configuration
- **Base URL**: `https://your-api-domain.com/api`
- **Authentication**: Bearer JWT token in Authorization header
- **Content-Type**: `application/json`
- **Response Format**: Always return `ApiResponse<T>` format

### Authentication Endpoints

#### POST /auth/register
```typescript
// Request body
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
}

// Response
{
  success: true,
  data: {
    user: User,
    token: string,
    refreshToken: string
  }
}
```

#### POST /auth/login
```typescript
// Request body
{
  email: string;
  password: string;
}

// Response
{
  success: true,
  data: {
    user: User,
    token: string,
    refreshToken: string
  }
}
```

#### POST /auth/refresh
```typescript
// Request body
{
  refreshToken: string;
}

// Response
{
  success: true,
  data: {
    token: string,
    refreshToken: string
  }
}
```

### Product Endpoints

#### GET /products
- **Query params**: `page`, `limit`
- **Filter by**: Current user only
- **Include**: Inventory data via JOIN
- **Order by**: `created_at DESC`

#### GET /products/search
- **Query params**: `q` (search term)
- **Search in**: name, description, barcode, category, brand
- **Filter by**: Current user only

#### GET /products/barcode/:barcode
- **Critical for**: Barcode scanning functionality
- **Filter by**: Current user and exact barcode match
- **Return 404**: If not found

#### POST /products
- **Create product AND initial inventory** in single transaction
- **Validate**: Unique barcode per user
- **Set**: `userId` from JWT token

#### PUT /products/:id
- **Verify**: Product belongs to current user
- **Update**: Only provided fields (partial update)

#### DELETE /products/:id
- **Check**: Product has no sales history (optional business rule)
- **Cascade delete**: Related inventory records

### Inventory Endpoints

#### GET /inventory
- **Filter by**: Current user's products (JOIN)
- **Order by**: `quantity ASC` (low stock first)
- **Include**: Product details

#### GET /inventory/low-stock
- **Filter**: `quantity <= minimum_stock`
- **Order by**: `(quantity/minimum_stock) ASC`

#### POST /inventory/adjust
- **Use transaction**:
  1. Lock inventory record
  2. Calculate new quantity
  3. Validate `new_quantity >= 0`
  4. Update inventory
  5. Create audit trail entry

#### GET /inventory/stats
- **Calculate**:
  - Total products, quantity, value
  - Low stock count, out of stock count
  - Category breakdown

### Sales Endpoints

#### POST /sales
- **CRITICAL TRANSACTION**:
  1. Verify product belongs to user
  2. Check inventory availability
  3. Create sale record
  4. Update inventory (subtract quantity)
  5. Create stock adjustment log

#### GET /sales/summary
- **Query params**: `startDate`, `endDate`
- **Calculate**: Total sales, revenue, top products, daily breakdown
- **Optimize**: Use database aggregations

#### GET /sales/top-products
- **Group by**: `product_id`
- **Calculate**: `SUM(quantity)`, `SUM(total_amount)`
- **Order by**: Total quantity or revenue

## 🔒 Security Implementation

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1640998800,
  "type": "access"
}
```

### Security Headers
```javascript
// CORS configuration
app.use(cors({
  origin: ['http://localhost:19000', 'exp://'], // Expo development
  credentials: true
}));

// Security headers
app.use(helmet());
```

### Rate Limiting
```javascript
// Apply rate limiting to auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts'
});

app.use('/api/auth', authLimiter);
```

## ⚡ Performance Optimization

### Database Optimization
1. **Index Critical Columns**: `user_id`, `product_id`, `barcode`, `sale_date`
2. **Use Prepared Statements**: Prevent SQL injection and improve performance
3. **Connection Pooling**: Configure appropriate pool size
4. **Query Optimization**: Use EXPLAIN to analyze slow queries

### Caching Strategy
1. **User Sessions**: Redis for JWT token blacklisting
2. **Product Data**: Cache frequently accessed products
3. **Analytics Data**: Cache daily/monthly reports with TTL

### File Upload (Product Images)
1. **Storage**: Use cloud storage (AWS S3, Cloudinary)
2. **Validation**: File type, size limits
3. **Processing**: Image optimization/resizing
4. **CDN**: Serve images via CDN for performance

## 🧪 Testing Requirements

### Unit Tests
- **Service Layer**: Test all API endpoints
- **Database Layer**: Test CRUD operations
- **Authentication**: Test token generation/validation
- **Business Logic**: Test inventory deduction logic

### Integration Tests
- **Full User Flow**: Registration → Product Creation → Sale Recording
- **Transaction Testing**: Ensure inventory consistency
- **Error Scenarios**: Invalid data, insufficient inventory

### Load Testing
- **Concurrent Sales**: Test inventory locking mechanisms
- **API Performance**: Measure response times under load
- **Database Performance**: Monitor query execution times

## 🚨 Error Handling Standards

### HTTP Status Codes
- **200**: Success
- **201**: Resource created
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (access denied)
- **404**: Not found
- **409**: Conflict (duplicate barcode, insufficient inventory)
- **422**: Unprocessable entity (business rule violations)
- **500**: Internal server error

### Error Response Format
```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE_FOR_FRONTEND",
  "details": {
    "field": "Specific validation error"
  }
}
```

## 📝 Environment Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lumen_inventory
DB_USER=lumen_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔄 Deployment Checklist

### Pre-deployment
- [ ] Database migrations executed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Logging system configured

### Post-deployment
- [ ] Health check endpoint working
- [ ] Authentication flow tested
- [ ] Database connectivity verified
- [ ] File upload functionality tested
- [ ] Error logging working
- [ ] Performance monitoring active

## 📈 Monitoring and Logging

### Application Logging
```javascript
// Request logging
app.use(morgan('combined'));

// Error logging
app.use((err, req, res, next) => {
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
    endpoint: req.path,
    method: req.method
  });
});
```

### Health Check Endpoint
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: await checkDatabaseConnection(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  res.json(health);
});
```

## 🎁 Frontend Features Ready for Integration

The frontend is fully implemented with:

✅ **Professional drawer navigation** with sidebar menu  
✅ **Complete authentication system** with registration  
✅ **Responsive product cards** and layouts  
✅ **Barcode scanning capability** with camera integration  
✅ **Inventory management** with low stock alerts  
✅ **Sales recording** with real-time inventory updates  
✅ **Analytics dashboard** with charts and reports  
✅ **Error handling** with user-friendly messages  
✅ **Loading states** and offline capability  
✅ **Form validation** with real-time feedback  
✅ **Professional UI** with consistent theming  

## 🤝 Integration Support

### Frontend Service Files
All API integration patterns are documented in:
- `app/services/ProductService.ts` - Product CRUD operations
- `app/services/SalesService.ts` - Sales and analytics
- `app/services/InventoryService.ts` - Stock management
- `app/context/AuthContext.tsx` - Authentication flow

### Type Definitions
Complete TypeScript interfaces in:
- `app/types/index.ts` - All data models and API contracts

### Backend Integration Guide
Comprehensive API documentation in:
- `BACKEND_INTEGRATION_GUIDE.md` - Complete API specification

The frontend is production-ready and waiting for your backend implementation. All API calls, data structures, error handling, and user flows are fully implemented and tested.

## 📞 Development Support

For questions about frontend implementation or API integration requirements, refer to:
1. **Detailed code comments** in all service files
2. **Type definitions** with comprehensive documentation
3. **BACKEND_INTEGRATION_GUIDE.md** for API specifications
4. **This documentation** for overall architecture

The frontend code is self-documenting with extensive comments explaining the expected backend behavior for seamless integration.