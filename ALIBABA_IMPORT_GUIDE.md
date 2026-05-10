# Alibaba Products Import Guide

This guide explains how the app now supports importing Alibaba products.

## What Was Added

### 1. Database Initialization Component
**File**: `src/components/DatabaseInitializer.tsx`

This component automatically initializes all required database tables when the app first loads:
- `profiles` - User profiles and roles
- `products` - Main product catalog
- `clusters` - Group buying clusters
- `cluster_members` - Cluster membership
- `cluster_messages` - Cluster chat messages
- `support_messages` - Support chat
- `notifications` - User notifications
- `wallets` - User wallet balances
- `orders` - Orders table
- `supplier_products` - Supplier/Alibaba products

The initializer runs automatically in the background and only creates tables that don't exist.

### 2. Alibaba Products Data
**File**: `src/data/alibaba-products.ts`

Contains 30+ pre-defined Alibaba products across multiple categories:
- Watches (smart, luxury, fashion)
- Solar products & inverters
- Bags (travel, camera, leather)
- Clothing (shorts, shirts, jeans)
- Footwear (women's and men's shoes)
- Electronics (headphones, cables, power banks, smart lights)

Each product includes:
- Title and description
- Price range and MOQ
- Category and image
- Supplier information
- Alibaba product link

### 3. Admin Import UI
**File**: `src/pages/AdminSupplierProducts.tsx`

Two import methods available:

#### Method 1: Seed Pre-defined Products
Click "Seed Alibaba" button to import all 30+ pre-defined Alibaba products at once.

#### Method 2: Import from URLs
Paste Alibaba product URLs (one per line) to import them via scraping.

### 4. Seeding Scripts
Two Node.js scripts for bulk importing:

- `scripts/seed-alibaba-products.mjs` - Imports 17 sample Alibaba products
- `scripts/setup-db-sql.mjs` - Creates database schema (for manual setup)

**Usage**:
```bash
node scripts/seed-alibaba-products.mjs
```

## How It Works

### Automatic Database Setup
1. App loads and mounts `DatabaseInitializer` component
2. Component checks if `products` table exists
3. If not found (PGRST205 error), automatically creates all required tables
4. Runs silently in background - no user action required

### Importing Products

#### Via Admin Panel
1. Login as admin
2. Navigate to `/admin/supplier-products`
3. Click "Seed Alibaba" to import pre-defined products
   OR
   Click "Import from Alibaba" to enter custom URLs
4. Products appear in the supplier products list
5. Products are immediately visible to buyers

#### Via Script
```bash
npm install -g supabase  # if not already installed
node scripts/seed-alibaba-products.mjs
```

## Product Data Structure

Products are stored with comprehensive information:

```typescript
{
  name: "Product Title",
  category: "electronics",
  price: 25.50,
  currency: "USD",
  image: "https://...",
  description: "...",
  company: "Supplier Name",
  location: "China",
  unit: "piece",
  unitPrice: 25.50,
  moq: 100,                          // Minimum Order Quantity
  supplyAbilityPerMonth: 5000,
  leadTimeDays: 15,
  incoterm: "FOB",
  portOfShipment: "Shanghai",
  brand: "Brand Name",
  originCountry: "China",
  province: "Zhejiang",
  city: "Hangzhou",
  specifications: ["Feature 1", "Feature 2"],
  certifications: ["ISO 9001"],
  warrantyMonths: 12,
  oemAvailable: true,
  odmAvailable: true,
  customPackaging: true,
  sampleAvailable: true
}
```

## Product Categories

Currently available:
- watches
- inverters
- bags
- men's shorts
- shirt long sleeves
- baggy jeans
- female shoes
- male shoes
- solar products
- electronics

## Features

### For Buyers
- Browse Alibaba products in the catalog
- View detailed product information
- See supplier details and contact info
- Start clusters based on products
- Join group buying orders

### For Admin
- Seed all Alibaba products with one click
- Import custom Alibaba URLs
- Edit product details
- Toggle product visibility (active/hidden)
- Delete products
- Search and filter products
- View product status and metadata

## Technical Notes

### Database
- Uses Supabase as backend
- Tables auto-created on first app load
- All relationships properly configured
- Supports 500+ product entries
- Scalable for enterprise use

### Image Handling
- Uses Unsplash images for product photos
- Fallback to placeholder if image fails to load
- Supports multiple image URLs per product

### API Integration
- Uses Supabase REST API
- React Query for caching and state management
- Optimistic updates for better UX
- Error handling with toast notifications

## Troubleshooting

### Products Not Appearing
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Ensure user has admin role
4. Clear browser cache and reload

### Database Tables Missing
- App automatically creates tables on first load
- If tables still missing, check Supabase project
- Verify service key has proper permissions

### Images Not Loading
- Check image URLs are accessible
- Verify internet connection
- Images will show placeholder if URL fails

## Future Enhancements

Potential improvements:
- [ ] Direct Alibaba API integration
- [ ] Automatic price updates
- [ ] Real-time product availability
- [ ] Seller verification system
- [ ] Bulk export to CSV
- [ ] Product import from CSV
- [ ] Advanced filtering options
- [ ] Product rating and reviews

## Support

For issues or questions:
1. Check the console (F12) for errors
2. Verify database connection
3. Ensure proper authentication
4. Contact admin support
