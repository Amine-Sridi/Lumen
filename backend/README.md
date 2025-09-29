# Lumen Backend

A complete REST API backend for the Lumen Inventory Management mobile application built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **JWT Authentication** with refresh tokens
- **Product Management** with barcode scanning support
- **Inventory Tracking** with automatic stock adjustments
- **Sales Recording** with real-time inventory deduction
- **Analytics & Reporting** with comprehensive sales data
- **Rate Limiting** and security middleware
- **Input Validation** with detailed error messages
- **Database Migrations** with Sequelize ORM
- **Comprehensive API Documentation**

## 📋 Prerequisites

- Node.js 16.x or higher
- PostgreSQL 12.x or higher
- npm or yarn package manager

## ⚙️ Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
```
Edit `.env` file with your database credentials and JWT secrets.

4. **Create PostgreSQL database:**
```sql
CREATE DATABASE lumen_inventory;
CREATE USER lumen_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lumen_inventory TO lumen_user;
```

5. **Run database migrations:**
```bash
npm run migrate
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Server will start on http://localhost:3000 with hot reloading.

### Production Mode
```bash
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get paginated products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory` - Get paginated inventory
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/out-of-stock` - Get out of stock items
- `GET /api/inventory/history/:productId` - Get inventory history
- `GET /api/inventory/product/:productId` - Get inventory by product
- `PUT /api/inventory/product/:productId` - Update inventory
- `POST /api/inventory/adjust` - Adjust stock quantity
- `POST /api/inventory/bulk-update` - Bulk update inventory

### Sales
- `GET /api/sales` - Get paginated sales
- `GET /api/sales/summary` - Get sales summary with analytics
- `GET /api/sales/date-range` - Get sales by date range
- `GET /api/sales/top-products` - Get top selling products
- `GET /api/sales/daily-report/:date` - Get daily sales report
- `GET /api/sales/monthly-report/:year/:month` - Get monthly sales report
- `GET /api/sales/product/:productId` - Get sales by product
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create new sale
- `POST /api/sales/:id/cancel` - Cancel sale

### Health Check
- `GET /health` - Server health status
- `GET /api/health` - API health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to receive access token and refresh token
2. **Include access token** in Authorization header: `Bearer <token>`
3. **Refresh token** when access token expires
4. **Logout** to invalidate refresh token

### Token Expiration
- Access Token: 1 hour
- Refresh Token: 7 days

## 💾 Database Schema

### Tables
- **users** - User accounts and profiles
- **products** - Product catalog with barcodes
- **inventory** - Stock levels and thresholds
- **sales** - Sales transactions
- **stock_adjustments** - Inventory change audit trail

### Key Features
- **User Isolation** - All data scoped to authenticated user
- **Referential Integrity** - Foreign key constraints
- **Audit Trail** - Stock adjustment logging
- **Unique Constraints** - Barcode uniqueness per user

## 🛡️ Security Features

- **JWT Authentication** with secure token generation
- **Rate Limiting** to prevent abuse
- **Input Validation** with Joi schemas  
- **SQL Injection Protection** via Sequelize ORM
- **CORS Configuration** for frontend integration
- **Helmet Security Headers**
- **Password Hashing** with bcryptjs

## 📝 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lumen_inventory
DB_USER=lumen_user
DB_PASSWORD=your_secure_password

# JWT Secrets
JWT_SECRET=your-jwt-secret-32-chars-minimum
REFRESH_TOKEN_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:19000,exp://192.168.1.100:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📊 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalItems": 100,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🚀 Deployment

### Using Docker (Recommended)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment
1. Install dependencies: `npm ci --only=production`
2. Set environment variables
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

## 🔧 Development

### Code Structure
```
src/
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── models/         # Sequelize models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── server.js       # App entry point
```

### Adding New Features
1. Create/update models in `src/models/`
2. Add business logic in `src/controllers/`
3. Define routes in `src/routes/`
4. Add validation schemas in `src/middleware/validation.js`
5. Update tests

## 📚 Frontend Integration

This backend is designed to work seamlessly with the React Native frontend:

- **API Base URL**: Update frontend `API_URL` to your backend URL
- **CORS Origins**: Add your frontend URLs to `CORS_ORIGIN`
- **WebSocket Support**: Future feature for real-time updates

### Frontend API Configuration
```typescript
// In your React Native app
export const API_URL = 'http://localhost:3000/api';
// or your production URL: 'https://your-domain.com/api'
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Add your frontend URL to `CORS_ORIGIN`
   - Check Expo development URL format

3. **JWT Token Errors**
   - Verify JWT secrets in `.env`
   - Check token expiration settings

4. **Migration Errors**
   - Drop and recreate database if needed
   - Check Sequelize configuration

### Logging
Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

## 📞 Support

For issues related to backend integration:
1. Check the comprehensive API documentation
2. Review error logs in `logs/` directory
3. Verify environment configuration
4. Test endpoints with tools like Postman

## 🎯 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Security audit

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready for Integration!** 🎉

This backend provides all the API endpoints required by your React Native frontend. Update the API URL in your frontend configuration and you're ready to go!