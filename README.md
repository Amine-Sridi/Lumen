# Lumen Inventory Management System

A modern React Native inventory management application with barcode scanning, product tracking, and sales recording capabilities.

## Overview

Lumen is a comprehensive inventory management system built with React Native and TypeScript. It provides businesses with tools to efficiently manage their product inventory, track stock levels, record sales, and access detailed analytics through a professional mobile interface.

## Features

### Core Functionality
- **Product Management**: Add, edit, delete, and organize products with detailed information
- **Barcode Scanning**: Scan product barcodes for quick identification and inventory management
- **Inventory Tracking**: Real-time stock level monitoring with automatic updates
- **Sales Recording**: Record sales transactions with detailed history and analytics
- **User Management**: Complete user profiles, settings, and password management
- **Dashboard Analytics**: Visual overview of business performance and key metrics

### Technical Features
- **Secure Authentication**: JWT-based login system with secure token storage
- **Professional UI**: Drawer navigation with clean, responsive design
- **Real-time Updates**: Live data synchronization with backend
- **Error Handling**: Comprehensive error management and user feedback
- **TypeScript**: Full type safety throughout the application

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Drawer Navigator)
- **State Management**: Context API with custom hooks
- **Styling**: StyleSheet with centralized theme system
- **Camera**: Expo Camera for barcode scanning
- **Storage**: Expo SecureStore for secure data persistence
- **HTTP Client**: Axios for API communication
- **Backend**: Node.js/Express with PostgreSQL database

## Project Structure

```
app/
├── components/          # Reusable UI components
├── context/            # State management (Auth, Products, Inventory, Sales)
├── navigation/         # Navigation configuration
├── Screens/           # Application screens
├── services/          # API communication layer
├── Styles/           # Theme and styling system
└── types/           # TypeScript type definitions

backend/
├── src/
│   ├── controllers/   # API route handlers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication and validation
│   └── config/       # Database and app configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android emulator
- PostgreSQL database (for backend)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lumen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file:
   ```env
   DB_HOST=localhost
   DB_NAME=lumen_inventory
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

## Configuration

### API Configuration
Update the API URL in service files if needed:
```typescript
// Default: http://192.168.0.193:3000/api
const API_BASE_URL = 'your_api_url_here';
```

### Theme Customization
Modify colors, typography, and spacing in `app/Styles/theme.ts`:
```typescript
export const colors = {
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  // ... more colors
};
```

## Usage

### Getting Started
1. **Registration**: Create a new account or login with existing credentials
2. **Dashboard**: View inventory overview and business analytics
3. **Add Products**: Manually add products or scan barcodes
4. **Manage Inventory**: Track stock levels and adjust quantities
5. **Record Sales**: Process sales transactions and update inventory
6. **Analytics**: View sales history and performance metrics

### Key Screens
- **Dashboard**: Business overview with key metrics
- **Products**: Product catalog with search and filtering
- **Add Product**: Create new products with barcode scanning
- **Inventory**: Stock level monitoring and management
- **Sales**: Record transactions and view history
- **Profile**: User account management and settings

## API Documentation

For detailed API endpoints and integration guide, see [API_DOCS.md](./API_DOCS.md).

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /products` - Retrieve products
- `POST /products` - Create new product
- `POST /inventory/adjust` - Adjust stock levels
- `POST /sales` - Record sale transaction

## Development

### Code Style Guidelines
- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add meaningful comments

### State Management
The app uses Context API for state management:
```typescript
const { products, isLoading, fetchProducts } = useProducts();
const { inventory, updateInventory } = useInventory();
const { recordSale } = useSales();
const { authState, onLogin } = useAuth();
```

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Camera permissions**: Ensure permissions are configured in `app.json`
3. **API connection**: Verify backend server is running and accessible
4. **Build errors**: Check TypeScript types and dependencies

### Debug Tools
- React Native Debugger for component inspection
- Flipper for network monitoring
- Expo Dev Tools for development server management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Create an issue in the repository
- Review the API documentation
- Check the troubleshooting section