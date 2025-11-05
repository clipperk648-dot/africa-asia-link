# Mock Authentication System - Setup & Usage

## Overview

The application is now running in **mock mode** with no authentication barriers. Users are automatically logged in with mock data when they access the app.

**Status**: ✅ No login required | Users can access all features | Mock data provided

---

## What's Included

### Auto-Login System
- Users are automatically logged in when they access the app
- No login page required
- No barriers to entry

### Mock Users
The system comes with two pre-configured users:

#### Buyer User (Default)
```
Email: buyer@echina.com
Name: John Buyer
Role: buyer
Phone: +234 801 234 5678
ID: user_buyer_001
```

#### Industry/Seller User
```
Email: seller@echina.com
Name: Chen Wei
Role: industry
Phone: +86 138 1234 5678
ID: user_industry_001
```

### Mock Data
- **5 Products**: Various items (ceramics, steel, machinery, textiles, electronics)
- **3 Orders**: Sample orders with different statuses
- **1 Clan**: "Builders United" with members and contributions
- **2 Social Posts**: User posts with likes and comments
- **Wallet**: Balance of ₦5,000,000 (NGN)
- **3 Transactions**: Deposit and payment history

---

## How It Works

### 1. Auto-Login on App Load
When the app starts:
1. `App.tsx` initializes and calls `initializeMockAuth()`
2. System checks if user has existing session in localStorage
3. If no session: Auto-creates session with buyer user
4. User is immediately logged in

### 2. Mock Data for All API Calls
All API calls return mock data:
- `getProducts()` → Returns 5 mock products
- `getOrders()` → Returns mock orders for user
- `getWalletBalance()` → Returns ₦5,000,000
- `createProduct()` → Adds to mock products array
- `createOrder()` → Adds to mock orders
- etc.

### 3. No API Backend Required
- No database connection needed
- No backend server required
- All data stored in memory + localStorage
- Functions simulate network delay (500ms) for realism

---

## File Structure

```
src/
├── lib/
│   ├── auth.ts           ← Added: initializeMockAuth(), autoLoginWithMockData()
│   └── db.ts             ← Replaced: All functions return mock data
├── utils/
│   └── mockData.ts       ← NEW: All mock data definitions
└── App.tsx               ← Modified: Initializes mock auth on load
```

---

## Using Mock Authentication

### Access Any Page Without Login
Simply navigate to any URL - you're already logged in:
```
/buyer                    → Buyer dashboard
/industry                 → Industry dashboard
/products                 → Browse products
/orders                   → View orders
/wallet                   → Wallet operations
/social                   → Social feed
/clan                     → Clans
```

### Switch Users (Optional)
To switch to industry/seller user:

```typescript
// In browser console:
import { autoLoginWithMockData } from '@/lib/auth';
autoLoginWithMockData('industry');
location.reload();
```

### Check Current User
```typescript
// In browser console:
import { getSession } from '@/lib/auth';
const user = getSession();
console.log(user);
```

---

## Modifying Mock Data

### Add More Products
Edit `src/utils/mockData.ts`:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  // Existing products...
  {
    id: 'prod_006',
    name: 'Your Product',
    category: 'Category',
    price: 25000,
    // ... other fields
  },
];
```

### Change Wallet Balance
Edit `src/utils/mockData.ts`:

```typescript
export const MOCK_WALLET = {
  user_id: 'user_buyer_001',
  balance: 10000000,  // Change this value
  currency: 'NGN',
  updated_at: new Date().toISOString(),
};
```

### Add More Orders
```typescript
export const MOCK_ORDERS: Order[] = [
  // Existing orders...
  {
    id: 'order_004',
    buyer_id: 'user_buyer_001',
    // ... other fields
  },
];
```

---

## Testing Features

### Test Product Browsing
1. Navigate to `/buyer/products`
2. See 5 mock products
3. Click on products to view details
4. Add to cart (uses mock data)

### Test Orders
1. Navigate to `/buyer/orders`
2. See 3 mock orders
3. Check order statuses
4. Create new order (adds to mock data)

### Test Wallet
1. Navigate to `/wallet`
2. See balance: ₦5,000,000
3. Check transactions (3 mock transactions)
4. Add new transaction (updates balance)

### Test Social Features
1. Navigate to `/social`
2. See 2 social posts
3. Create post (adds to mock data)
4. Like/comment (updates mock data)

### Test Clans
1. Navigate to `/clan`
2. See "Builders United" clan
3. View members and contributions
4. Join clan (adds member to mock data)

---

## Switching to Real Backend

When your backend is ready, switch from mock data to real API calls:

### Step 1: Update db.ts
Replace mock functions with actual API calls:

```typescript
// Before (mock):
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  await delay();
  return MOCK_PRODUCTS.slice(offset, offset + limit);
};

// After (real):
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  try {
    const result = await fetch(`/api/products?limit=${limit}&offset=${offset}`);
    return result.json();
  } catch {
    return [];
  }
};
```

### Step 2: Update auth.ts
Remove auto-login:

```typescript
export const initializeMockAuth = (): AuthUser | null => {
  // Check if user already has a session
  const session = getSession();
  
  // If no session, redirect to login instead of auto-login
  if (!session) {
    // Don't auto-login - let user login normally
    return null;
  }

  return session;
};
```

### Step 3: Update App.tsx
Handle login redirect:

```typescript
const AppContent = () => {
  useEffect(() => {
    const user = initializeMockAuth();
    if (!user) {
      // Redirect to login if no session
      // window.location.href = '/login';
    }
  }, []);

  return (/* ... */);
};
```

### Step 4: Keep Login Pages
Enable Login and SignUp pages again (they're currently accessible but not required)

---

## Data Persistence

### Session Storage
- User session stored in localStorage
- Survives page refresh
- Can be cleared by user (browser settings)

### Mock Data Storage
- Products, orders, clans stored in memory
- Gets reset on page refresh
- Can be modified during session

### To Make Mock Data Persistent
Use localStorage for each data type:

```typescript
// In mockData.ts
const MOCK_PRODUCTS_STORAGE_KEY = 'echina_mock_products';

export const getMockProducts = () => {
  const stored = localStorage.getItem(MOCK_PRODUCTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_PRODUCTS;
};

export const saveMockProducts = (products: Product[]) => {
  localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};
```

---

## Console Commands

Quick testing commands in browser console:

```typescript
// Check current user
import { getSession } from '@/lib/auth';
console.log(getSession());

// Switch to seller user
import { autoLoginWithMockData } from '@/lib/auth';
autoLoginWithMockData('industry');
location.reload();

// Get all products
import { getProducts } from '@/lib/db';
getProducts().then(p => console.log(p));

// Get wallet balance
import { getWalletBalance } from '@/lib/db';
getWalletBalance('user_buyer_001').then(w => console.log(w));

// Clear session (logout)
import { clearSession } from '@/lib/auth';
clearSession();
location.reload();
```

---

## Known Limitations

1. **Data is reset on page refresh** (not persisted except session)
   - Solution: Use localStorage for persistence

2. **No real-time updates** between users
   - Solution: All users see same mock data

3. **No backend validation**
   - Solution: Add client-side validation if needed

4. **No image uploads**
   - Solution: Mock images use placeholder URLs

5. **Network delays are simulated** (500ms)
   - Solution: Realistic UX, not actual network performance

---

## Troubleshooting

### Users redirected to login
**Problem**: Users see login page despite mock auth  
**Solution**: Check that `App.tsx` properly calls `initializeMockAuth()`

### Mock data disappears after refresh
**Problem**: Data not persisting  
**Solution**: Data is in memory by design. Use localStorage to persist if needed

### Can't access protected routes
**Problem**: 404 or redirect to login  
**Solution**: Ensure user session exists - check console: `import { getSession } from '@/lib/auth'; console.log(getSession());`

### Wrong user data
**Problem**: Seeing seller data instead of buyer  
**Solution**: Switch user - see "Switch Users" section above

---

## Features Available

### ✅ Working with Mock Data
- User authentication (auto-login)
- Product browsing and details
- Order creation and tracking
- Wallet operations
- Social posts and feeds
- Clan management
- Messaging (basic)
- Analytics and dashboard
- Settings pages
- Cart functionality

### ⚠️ Limited/Offline Features
- Real-time notifications (not synced between users)
- Actual file uploads (mock only)
- Real payment processing
- Email notifications
- SMS notifications

---

## Performance Notes

- Mock data is fast (no network delay)
- Simulated 500ms delay for realistic feel
- No database queries
- All data in memory
- localStorage for session persistence

---

## Next Steps

1. **Test the app** with mock data
2. **Identify issues** if any
3. **Get backend ready** with MongoDB
4. **Switch to real API** using steps in "Switching to Real Backend"
5. **Remove mock code** when no longer needed

---

## Support

For issues with mock authentication:
1. Check browser console for errors
2. Verify session in localStorage
3. Ensure `App.tsx` initializes correctly
4. Check that all route protections work

For switching to real backend:
1. Update API endpoints in `db.ts`
2. Update authentication flow in `auth.ts`
3. Test login/signup pages
4. Verify all API calls work

---

**Status**: ✅ Mock Mode Active  
**Users Required to Login**: ❌ No  
**Authentication Barriers**: ❌ None  
**Backend Required**: ❌ No  
**Database Required**: ❌ No  

Ready to test! 🚀
