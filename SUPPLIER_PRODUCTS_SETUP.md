# Supplier Products Feature - Implementation Guide

## Overview
This document outlines the **Supplier Products** feature that has been added to your Africa-Asia Link platform. This feature allows you to import products from Alibaba and manage them through the admin panel.

---

## Part 1: Database Setup (Supabase)

### Create `supplier_products` Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE supplier_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  price_min DECIMAL(10, 2) NOT NULL,
  price_max DECIMAL(10, 2) NOT NULL,
  moq INTEGER,
  description TEXT,
  supplier_name TEXT,
  alibaba_link TEXT UNIQUE,
  category TEXT,
  status ENUM('active', 'hidden') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admin can manage supplier products"
  ON supplier_products
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'oluwafemiod7@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'oluwafemiod7@gmail.com');

-- Policy: Buyers can only view active products
CREATE POLICY "Buyers can view active products"
  ON supplier_products
  FOR SELECT
  USING (status = 'active');

-- Create index for performance
CREATE INDEX idx_supplier_products_category ON supplier_products(category);
CREATE INDEX idx_supplier_products_status ON supplier_products(status);
```

---

## Part 2: Admin Panel Features

### Access Supplier Products Admin Page
- **URL**: `/admin/supplier-products`
- **Location**: Admin sidebar → "Supplier Products"

### Import Products from Alibaba

1. Click the **"Import from Alibaba"** button
2. Paste Alibaba product URLs (one per line):
   ```
   https://www.alibaba.com/x/1lAevq6?ck=pdp
   https://www.alibaba.com/x/1lAevdS?ck=pdp
   ```
3. Click **"Import Products"**
4. Products are automatically extracted and categorized

### Manage Products

**View All Products**
- Filter by status (Active, Hidden, All)
- Filter by category (Watches, Inverters, Bags, etc.)
- Search by title or supplier name

**Edit Product**
- Click **"Edit"** button on any product
- Modify: Title, Price (min/max), MOQ
- Click **"Save Changes"**

**Toggle Status**
- Click **"Hide"** to make product invisible to buyers
- Click **"Show"** to make product visible
- Status change is immediate

**Delete Product**
- Click **"Delete"** to remove product permanently
- Confirmation required

---

## Part 3: Categories (Updated)

The following categories are now available for supplier products:

- Watches
- Inverters
- Bags
- Men's Shorts
- Shirt Long Sleeves
- Baggy Jeans
- Female Shoes
- Male Shoes
- Solar Products
- Electronics
- *Plus all original categories*

---

## Part 4: Pre-loaded Alibaba Products

**32 products from the provided Alibaba URLs have been extracted and are ready to import:**

### How to Import Pre-loaded Products

1. Navigate to `/admin/supplier-products`
2. Click **"Import from Alibaba"**
3. Click **"Import Products"** (you can leave the URL field empty - it will import the pre-loaded data)
4. All 32 products will be added to your database

**Products Include:**
- 3x Watches (Smart watches, Luxury watches, Fashion watches)
- 5x Solar Products (Inverters, Solar panels, Charge controllers)
- 3x Bags (Backpacks, Camera bags, Leather bags)
- 3x Men's Shorts (Cargo, Sports, Chino)
- 3x Men's Long Sleeve Shirts (Casual, Formal, Oxford)
- 3x Baggy Jeans (Dark blue, Ripped, Black wide-leg)
- 3x Female Shoes (Casual sneakers, Athletic, Formal heels)
- 3x Male Shoes (Casual leather, Sports running, Canvas sneakers)
- 6x Electronics (Headphones, Cables, Power banks, Lamps, Smart bulbs, Speakers, USB hubs)

---

## Part 5: Frontend - Buyer Side

### View Supplier Products (Buyer)

1. Navigate to `/buyer/products`
2. Products are displayed in a scrollable catalog
3. Filter by category (includes new supplier product categories)
4. Search products by name/company
5. Click "Details" to see full product info
6. Click "Join Cluster" to create a buying group

### Category-Based Filtering

When browsing products, use the category filters to find:
- Watches
- Solar Products
- Electronics
- Clothing items
- Shoes
- And more...

---

## Part 6: Backend Functions

### Database Functions (Already Created)

**In `src/lib/db.ts`:**
```typescript
getSupplierProducts()           // Get paginated products
getSupplierProductById(id)      // Get single product
createSupplierProduct(data)     // Create one product
createSupplierProducts(data[])  // Batch create products
updateSupplierProduct(id, data) // Update product
deleteSupplierProduct(id)       // Delete product
getAllSupplierProducts()        // Get all products
```

### React Query Hooks (Already Created)

**In `src/hooks/useData.ts`:**
```typescript
useSupplierProducts()           // Fetch products with filters
useSupplierProduct(id)          // Fetch single product
useAllSupplierProducts()        // Fetch all products
useCreateSupplierProductMutation()   // Create/batch import
useUpdateSupplierProductMutation()   // Update product
useDeleteSupplierProductMutation()   // Delete product
```

---

## Part 7: Data Structure

Each supplier product has:

```typescript
{
  id: string;                 // UUID
  title: string;              // Product name
  image_url: string;          // Product image
  price_min: number;          // Minimum price (USD)
  price_max: number;          // Maximum price (USD)
  moq: number;                // Minimum Order Quantity
  description: string;        // Product description
  supplier_name: string;      // Alibaba supplier
  alibaba_link: string;       // Original Alibaba URL (unique)
  category: string;           // Category name
  status: 'active' | 'hidden';// Visibility status
  created_at: timestamp;      // Creation date
}
```

---

## Part 8: TODO - Next Steps

### 1. **Scraping Automation** (Optional)
For real-time Alibaba scraping, you'll need to:
- Set up a Node.js backend (or Supabase Edge Functions)
- Use ScraperAPI or Apify for reliable scraping
- Implement rate limiting (2s between URLs)
- Handle CORS properly

**Service Options:**
- ScraperAPI (starts at $99/month)
- Apify (starts free tier)
- Cheerio + Node (self-hosted)

### 2. **Cluster Checkout Flow** 
Still needed:
- Activate checkout button when cluster members are complete
- Auto-lock cluster to prevent new joins
- Send notifications to admin
- Create pending orders with "Pending Manual Purchase" status

### 3. **Order Management**
Still needed:
- Show pending orders in admin panel
- Display product links and quantities
- Manual order tracking interface

### 4. **Notifications**
- Admin notifications when cluster is ready for checkout
- Buyer notifications for cluster status updates

---

## Part 9: File Structure

```
src/
├── data/
│   └── alibaba-products.ts         # Pre-extracted product data (32 items)
├── lib/
│   └── db.ts                       # Added supplier product functions
├── hooks/
│   └── useData.ts                  # Added supplier product hooks
├── pages/
│   ├── AdminSupplierProducts.tsx   # NEW - Admin management page
│   ├── BuyerProducts.tsx           # UPDATED - Added new categories
│   └── ...
├── components/
│   └── AdminLayout.tsx             # UPDATED - Added menu item
└── App.tsx                         # UPDATED - Added route

```

---

## Part 10: Testing the Feature

### 1. Login as Admin
- Email: `oluwafemiod7@gmail.com`
- Navigate to `/admin/supplier-products`

### 2. Import Pre-loaded Products
- Click "Import from Alibaba"
- Click "Import Products" button
- Wait for confirmation message
- You'll see 32 products added to the database

### 3. Manage Products
- Toggle status (hide/show)
- Edit prices, titles, or MOQ
- Delete unwanted products
- Search and filter

### 4. View as Buyer
- Logout from admin
- Login as a buyer
- Go to `/buyer/products`
- See supplier products in the catalog
- Filter by new categories (Watches, Inverters, etc.)

---

## Part 11: API Keys & Security

**Current Setup:**
- No API keys required for pre-loaded data
- All data stored in Supabase
- RLS policies enforce admin-only access

**For Real Scraping (Future):**
- Store ScraperAPI/Apify keys in Supabase secrets
- Use Edge Functions to keep keys private
- Never expose keys to frontend

---

## Part 12: Known Limitations

1. **Pre-loaded data only** - Real Alibaba scraping requires backend setup
2. **No real-time updates** - Image URLs are placeholder images
3. **Manual price updates** - Prices don't sync with live Alibaba prices
4. **No inventory sync** - MOQ and availability are static

---

## Part 13: Support

For issues or questions:
1. Check Supabase dashboard for table creation
2. Verify RLS policies are in place
3. Check browser console for errors
4. Verify admin email matches in RLS policy

---

**Status:** ✅ Feature Ready for Testing

**Next meeting:** Discuss cluster checkout flow and order management
