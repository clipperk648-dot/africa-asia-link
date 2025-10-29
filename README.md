# TradeLink - International Trade Platform

A premier platform connecting Chinese manufacturers with Nigerian buyers, streamlining international trade with verified partners.

## Project Overview

TradeLink is a comprehensive e-commerce and social trading platform that bridges the gap between industrial suppliers and buyers. It features:

- **Seller (Industry) Dashboard**: Manage products, inventory, and analytics
- **Buyer Dashboard**: Browse products, manage orders, and track shipments
- **Social Feed**: Connect with trading partners and share updates
- **Wallet System**: Secure payment and transaction management
- **Investment Module**: Explore investment opportunities
- **Clan Buying**: Pool resources with other buyers for bulk purchases
- **Real-time Notifications**: Stay updated on orders and messages

## Technologies Used

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion and custom Canvas animations
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components for routes
├── lib/             # Utility functions and mock database
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
├── types/           # TypeScript type definitions
├── styles/          # Global styles
└── config/          # App configuration
```

## Features

### For Sellers (Industry)
- Product management and inventory tracking
- Sales analytics and performance metrics
- Customer network management
- Order fulfillment tracking
- Product ratings and reviews

### For Buyers
- Browse extensive product catalog
- Advanced search and filtering
- Secure shopping cart and checkout
- Order tracking and history
- Product comparisons and reviews
- Clan buying groups for bulk purchases

### Social & Community
- Trading partner social feed
- Direct messaging and chat
- Activity notifications
- User profiles and connections
- Video feed content

### Wallet & Payments
- Secure wallet management
- Multiple payment methods
- Transaction history
- Deposit and withdrawal options
- Wallet-to-wallet transfers

## Development

### Available Scripts

```sh
npm run dev       # Start development server with HMR
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
npm run type-check # Run TypeScript type checking
```

### Environment Configuration

The application is configured to work with Netlify Functions for the backend. Update environment variables as needed for your deployment environment.

## Building & Deployment

### Production Build

```sh
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment

The application is optimized for deployment on Netlify with integrated serverless functions:

1. Push your changes to the repository
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy your changes

## Performance Optimizations

The application includes several optimizations:

- **Code Splitting**: Vendor code split into separate chunks for better caching
- **Image Optimization**: Lazy loading and format selection (WebP/AVIF)
- **Canvas Rendering**: GPU-accelerated particle animations with reduced motion support
- **Tree Shaking**: Unused code elimination during build
- **Minification**: Terser configuration for optimal bundle size

## Contributing

When contributing to this project:

1. Create a new branch for your feature
2. Follow the existing code style and patterns
3. Ensure all tests pass and types are correct
4. Submit a pull request with a clear description

## Architecture Notes

### Product Sync Mechanism

Products created by sellers (industry users) are automatically visible to all buyers (buyer users) through a shared mock database layer. This ensures data consistency across both user types.

### Authentication

The application uses a mock authentication system for development. Replace with proper authentication (e.g., Supabase, Firebase) for production.

### Data Storage

Currently uses in-memory mock database for development. For production, integrate with a backend database system and API.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

## License

This project is proprietary and confidential.
