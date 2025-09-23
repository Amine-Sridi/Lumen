# Lumen Inventory Management System

A comprehensive React Native application for inventory management with barcode scanning, product tracking, and sales recording capabilities.

## 📱 Project Overview

Lumen is a modern inventory management system built with React Native and Expo. It provides businesses with tools to efficiently manage their product inventory, track stock levels, record sales, and analyze business performance through an intuitive mobile interface.

### Key Features

- **Product Management**: Add, edit, and track products with detailed information
- **Barcode Scanning**: Scan product barcodes for quick identification and data entry
- **Inventory Tracking**: Monitor stock levels with low-stock alerts and automatic updates
- **Sales Recording**: Record sales transactions with detailed reporting
- **User Authentication**: Secure login system with JWT tokens
- **Professional UI**: Clean, responsive design with consistent theming
- **Offline Support**: Local storage capabilities for offline functionality

## 🏗️ Architecture Overview

### Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── ProductCard.tsx
│   ├── ErrorBoundary.tsx
│   └── BarcodeScannerComponent.tsx
├── context/            # State management providers
│   ├── AuthContext.tsx
│   ├── ProductContext.tsx
│   ├── InventoryContext.tsx
│   └── SalesContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── Screens/           # Application screens
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── ProductList.tsx
│   ├── AddProduct.tsx
│   ├── ProductDetails.tsx
│   ├── ScanBarcode.tsx
│   └── RecordSale.tsx
├── services/          # API communication layer
│   ├── ProductService.ts
│   ├── InventoryService.ts
│   └── SalesService.ts
├── Styles/           # Theme and styling
│   ├── theme.ts
│   └── LoginStyle.js
└── types/           # TypeScript type definitions
    └── index.ts
```

### Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: Context API with custom hooks
- **Styling**: StyleSheet with custom theme system
- **Camera**: Expo Camera for barcode scanning
- **Storage**: Expo SecureStore for sensitive data
- **HTTP Client**: Axios for API communication

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android emulator (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lumen-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### Environment Setup

Create a `.env` file in the root directory:
```
API_URL=http://localhost:3000/api
API_KEY=your_api_key_here
```

## 🔧 Configuration

### Theme Customization

The app uses a centralized theme system located in `app/Styles/theme.ts`. You can customize:

- **Colors**: Primary, secondary, success, warning, error colors
- **Typography**: Font sizes, weights, and line heights
- **Spacing**: Consistent spacing units throughout the app
- **Border Radius**: Rounded corner configurations

```typescript
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  // ... more colors
};
```

### API Configuration

Update the API endpoints in the service files (`app/services/*.ts`):

```typescript
export const API_URL = 'https://your-backend-api.com/api';
```

## 📱 Core Features

### Authentication

- JWT-based authentication system
- Secure token storage using Expo SecureStore
- Automatic token refresh
- Login/logout functionality

### Product Management

- CRUD operations for products
- Barcode scanning for product identification
- Image upload capabilities
- Category and brand organization

### Inventory Tracking

- Real-time stock level monitoring
- Low stock alerts
- Stock adjustment recording
- Inventory history tracking

### Sales Recording

- Quick sales transaction recording
- Sales history and analytics
- Revenue tracking
- Product performance metrics

## 🔌 Backend Integration

### API Endpoints

The frontend expects the following API endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### Products
- `GET /products` - Get all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/search?q=:query` - Search products

#### Inventory
- `GET /inventory` - Get all inventory items
- `POST /inventory` - Create inventory item
- `PUT /inventory/:id` - Update inventory
- `POST /inventory/adjust` - Adjust stock levels

#### Sales
- `GET /sales` - Get all sales
- `POST /sales` - Record new sale
- `GET /sales/summary` - Get sales summary
- `GET /sales/analytics` - Get sales analytics

### Data Models

#### Product Model
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "barcode": "string",
  "price": "number",
  "category": "string",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "userId": "string"
}
```

#### Inventory Model
```json
{
  "id": "string",
  "productId": "string",
  "quantity": "number",
  "minimumStock": "number",
  "maximumStock": "number",
  "lastRestocked": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### Sale Model
```json
{
  "id": "string",
  "productId": "string",
  "quantity": "number",
  "unitPrice": "number",
  "totalAmount": "number",
  "saleDate": "date",
  "notes": "string",
  "userId": "string"
}
```

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive comments (no emojis)

### State Management

The app uses Context API for state management:

```typescript
// Using contexts in components
const { products, isLoading, fetchProducts } = useProducts();
const { inventory, updateInventory } = useInventory();
const { recordSale } = useSales();
```

### Error Handling

Implement consistent error handling:

```typescript
try {
  const result = await ProductService.createProduct(productData);
  // Handle success
} catch (error) {
  console.error('Error creating product:', error);
  Alert.alert('Error', 'Failed to create product');
}
```

### Testing

While testing files are not included in the current implementation, you should add:

- Unit tests for utility functions
- Integration tests for API services
- Component tests for UI components
- E2E tests for critical user flows

## 📦 Build and Deployment

### Development Build

```bash
expo build:android
expo build:ios
```

### Production Build

1. Configure app signing certificates
2. Update app version in `app.json`
3. Build for respective platforms
4. Submit to app stores

### Environment Variables

Configure different environments:

- **Development**: Local API endpoints
- **Staging**: Staging API endpoints
- **Production**: Production API endpoints

## 🔍 Troubleshooting

### Common Issues

1. **Camera permissions not working**
   - Ensure camera permissions are properly configured in `app.json`
   - Test on physical device (camera doesn't work in simulator)

2. **Navigation errors**
   - Verify all screen components are properly exported
   - Check navigation type definitions match screen implementations

3. **API connection issues**
   - Verify API_URL environment variable
   - Check network permissions in app configuration
   - Ensure backend API is running and accessible

### Debug Tools

- **React Native Debugger**: For debugging React components and state
- **Flipper**: For network inspection and performance monitoring
- **Expo Dev Tools**: For development server management

## 🤝 Contributing

### Development Workflow

1. Create feature branch from main
2. Implement feature following coding guidelines
3. Add/update tests as necessary
4. Update documentation
5. Submit pull request for review

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Code is properly commented
- [ ] UI follows design system
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📞 Support

For technical support or questions:

- Create an issue in the project repository
- Review existing documentation
- Contact the development team

---

## 🔄 Future Enhancements

### Planned Features

1. **Advanced Analytics**: Detailed sales and inventory analytics
2. **Multi-location Support**: Support for multiple store locations
3. **Supplier Management**: Track suppliers and purchase orders
4. **Barcode Generation**: Generate barcodes for new products
5. **Export/Import**: CSV export/import functionality
6. **Push Notifications**: Low stock and sales alerts
7. **Offline Sync**: Robust offline functionality with sync

### Technical Improvements

1. **Performance Optimization**: Implement React.memo and useMemo
2. **Testing Coverage**: Add comprehensive test suite
3. **Accessibility**: Improve accessibility features
4. **Internationalization**: Multi-language support
5. **Dark Mode**: Theme switching capabilities
6. **Caching**: Implement intelligent data caching
7. **Security**: Enhanced security measures

This documentation provides a comprehensive overview of the Lumen Inventory Management System. For specific implementation details, refer to the inline code comments and TypeScript definitions throughout the codebase.