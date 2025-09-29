# Backend Setup and Deployment Guide

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lumen_inventory
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   
   # JWT
   JWT_ACCESS_SECRET=your_very_long_random_access_secret_key_here
   JWT_REFRESH_SECRET=your_very_long_random_refresh_secret_key_here
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS
   CORS_ORIGIN=http://localhost:19006
   ```

## Database Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE lumen_inventory;
   ```

2. Run migrations to create tables:
   ```bash
   npx sequelize-cli db:migrate
   ```

3. (Optional) Run seeders if available:
   ```bash
   npx sequelize-cli db:seed:all
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - Logout user

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create new product
- GET `/api/products/:id` - Get product by ID
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product
- GET `/api/products/barcode/:barcode` - Get product by barcode

### Inventory
- GET `/api/inventory` - Get all inventory items
- GET `/api/inventory/:productId` - Get inventory for specific product
- PUT `/api/inventory/:productId` - Update inventory quantity
- POST `/api/inventory/adjust` - Adjust inventory with reason
- GET `/api/inventory/low-stock` - Get low stock items
- GET `/api/inventory/history/:productId` - Get inventory adjustment history

### Sales
- GET `/api/sales` - Get all sales
- POST `/api/sales` - Create new sale
- GET `/api/sales/:id` - Get sale by ID
- GET `/api/sales/stats/summary` - Get sales summary statistics

## Frontend Integration

Update your React Native frontend API base URL to point to your backend:

In your frontend `app/services/*.ts` files, update the base URL:
```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // For development
// or
const API_BASE_URL = 'https://your-backend-domain.com/api'; // For production
```

## Security Features

- JWT authentication with access and refresh tokens
- Password hashing with bcrypt
- Rate limiting on all routes
- CORS protection
- Helmet security headers
- Input validation with Joi schemas

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details if available"
}
```

## Database Schema

The backend uses PostgreSQL with the following main tables:
- `users` - User accounts
- `products` - Product catalog
- `inventory` - Stock levels and management
- `sales` - Sales transactions
- `stock_adjustments` - Inventory adjustment history

## Development

### Adding New Migrations
```bash
npx sequelize-cli migration:generate --name migration-name
```

### Rolling Back Migrations
```bash
npx sequelize-cli db:migrate:undo
```

### Database Reset (Development Only)
```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

## Troubleshooting

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in `.env` file
   - Kill existing process on the port

3. **CORS Issues**:
   - Update CORS_ORIGIN in `.env` to match your frontend URL
   - For React Native development, use your local IP address

## Production Deployment

1. Set NODE_ENV=production in your environment
2. Use a proper process manager like PM2
3. Set up proper logging
4. Use environment-specific database credentials
5. Configure proper CORS origins
6. Set up SSL/TLS certificates
7. Use strong JWT secrets

Your backend is now fully functional and ready to integrate with your React Native frontend!