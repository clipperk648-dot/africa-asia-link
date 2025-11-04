# Authentication System Verification & Real-Time Data Synchronization

## System Overview

The Echina application uses a complete authentication system with real-time data synchronization:

- **Database**: MongoDB (Atlas)
- **Backend**: Express.js (local) + Netlify Functions (production)
- **Frontend**: React with React Query for data fetching
- **Authentication**: Email/password + Google OAuth
- **Real-time**: React Query with 5-second refetch intervals
- **Sessions**: Browser localStorage with 24-hour expiry

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Login/SignUp Pages                                      │   │
│  │  ├─ src/pages/Login.tsx (Email + Google OAuth)          │   │
│  │  └─ src/pages/SignUp.tsx (Registration)                 │   │
│  │                                                           │   │
│  │  Authentication Library                                  │   │
│  │  └─ src/lib/auth.ts                                     │   │
│  │     ├─ registerUser()                                    │   │
│  │     ├─ loginUser()                                       │   │
│  │     ├─ googleOAuthLogin()                                │   │
│  │     ├─ getCurrentUserData()                              │   │
│  │     └─ Session Management (localStorage)                │   │
│  │                                                           │   │
│  │  Data Fetching                                           │   │
│  │  └─ src/hooks/useData.ts (React Query)                  │   │
│  │     ├─ useProducts() - 5s refetch                        │   │
│  │     ├─ useOrders() - 5s refetch                          │   │
│  │     ├─ useWalletBalance() - 5s refetch                   │   │
│  │     └─ useSocialPosts() - 5s refetch                     │   │
│  └──────────────────────────���───────────────────────────────┘   │
│              ↓ HTTP Requests with JSON                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│          Backend API Layer (Express/Netlify Functions)           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Authentication Endpoints                                  │  │
│  │  ├─ POST /api/auth/register - Create user + wallet        │  │
│  │  ├─ POST /api/auth/login - Verify credentials            │  │
│  │  ├─ POST /api/auth/google - OAuth callback               │  │
│  │  ├─ GET /api/auth/user/:id - Fetch user data             │  │
│  │  └─ GET /api/health - Database connectivity check         │  │
│  │                                                            │  │
│  │  Data Endpoints (via Netlify Functions)                    │  │
│  │  ├─ GET/POST /api/products - Product management           │  │
│  │  ├─ GET/POST /api/orders - Order management               │  │
│  │  ├─ GET/POST /api/wallet-* - Wallet operations            │  │
│  │  └─ GET/POST /api/messages - Messaging                    │  │
│  │                                                            │  │
│  │  Session Management                                       │  │
│  │  └─ createSessionToken() - Base64 JWT-like tokens         │  │
│  └────────────────────────────────────────────────────────────┘  │
│              ↓ MongoDB Queries                                    │
└──────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────���──────────────────┐
│                    MongoDB Database (Atlas)                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Collections                                               │  │
│  │  ├─ users - User accounts + OAuth info                    │  │
│  │  ├─ wallets - User wallet balances                        │  │
│  │  ├─ products - Product listings                           │  │
│  │  ├─ orders - Purchase orders                              │  │
│  │  ├─ transactions - Wallet history                         │  │
│  │  ├─ messages - User messaging                             │  │
│  │  ├─ social_posts - Community feed                         │  │
│  │  └─ clans - Collaborative groups                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────���─────────────────────────────────────┘
```

## Authentication Flow

### 1. Registration Flow

```
User → SignUp Page → registerUser() → /api/auth/register → MongoDB
                                                    ↓
                                         Create User Document
                                         Create Wallet Document
                                         Generate Session Token
                                                    ↓
                                    Return User Data + Token
                                                    ↓
                        Save to localStorage (echina_user, echina_session)
                                                    ↓
                                    Redirect to Dashboard
```

### 2. Login Flow

```
User → Login Page → loginUser() → /api/auth/login → MongoDB
                                              ↓
                                    Find User by Email
                                    Verify Password Hash
                                    Verify User Role
                                              ↓
                                  Generate Session Token
                                              ↓
                            Return User Data + Token
                                              ↓
                    Save to localStorage (echina_user, echina_session)
                                              ↓
                              Redirect to Correct Dashboard
                              (Industry if role="industry", Buyer if role="buyer")
```

### 3. Google OAuth Flow

```
User → Click "Sign in with Google" → Google Sign-In SDK
                                            ↓
                              User authorizes in Google popup
                                            ↓
                                  Google returns ID token
                                            ↓
                        googleOAuthLogin() → /api/auth/google
                                            ↓
                              Find or Create User
                              Update OAuth fields
                              Create Wallet (if new)
                                            ↓
                            Return User Data + Token
                                            ↓
                  Save to localStorage (echina_user, echina_session)
                                            ↓
                          Redirect to Dashboard
```

### 4. Real-Time Data Sync Flow

```
Dashboard Mounted
        ↓
useData Hooks Initialize
        ↓
useProducts() → /api/products → MongoDB
useOrders() → /api/orders → MongoDB
useWalletBalance() → /api/wallet-balance → MongoDB
useSocialPosts() → /api/social-posts → MongoDB
        ↓
Display Data
        ↓
(Every 5 seconds)
        ↓
Refetch Data from API
        ↓
Update UI with Latest Data
```

## Session Management

### Session Storage Structure

```javascript
// In browser localStorage:

// User data
localStorage.echina_user = {
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "buyer",
  "oauthProvider": "google" // optional
}

// Session token
localStorage.echina_session = {
  "userId": "507f1f77bcf86cd799439011",
  "timestamp": 1705332600000 // for 24-hour expiry
}
```

### Session Validation

- **Duration**: 24 hours from session creation
- **Location**: Browser localStorage
- **Expiry**: Checked on app initialization
- **Cleanup**: Automatic on logout or expiry

### Session Retrieval

```javascript
// Get current session
const session = getSession(); // Returns AuthUser or null

// Check if user is logged in
const isAuthenticated = session !== null;

// Access user data
if (session) {
  console.log(`Logged in as: ${session.name} (${session.role})`);
}
```

## Real-Time Data Synchronization

### React Query Configuration

The application uses React Query for server state management with:

- **Refetch Interval**: 5 seconds for products, orders, posts, wallet
- **Automatic Refetching**: On window focus
- **Mutation-Triggered Refetch**: After create/update/delete operations
- **Cache Strategy**: Stale-while-revalidate

### Refetch Configuration

```typescript
// Example from useData.ts
useProducts: {
  queryKey: ["products"],
  refetchInterval: 5000,  // Refetch every 5 seconds
  staleTime: 0,           // Always consider data stale
}

useOrders: {
  queryKey: ["orders", userId],
  refetchInterval: 5000,  // Refetch every 5 seconds
  enabled: !!userId,      // Only refetch if userId exists
}

useWalletBalance: {
  queryKey: ["walletBalance", userId],
  refetchInterval: 5000,  // Refetch every 5 seconds
  enabled: !!userId,      // Only refetch if userId exists
}
```

### Real-Time Updates

When user data changes (e.g., wallet balance updated):

1. **Automatic Refetch**: Every 5 seconds, latest data is fetched
2. **Smart Cache Invalidation**: After mutations, cache is invalidated
3. **UI Update**: React automatically re-renders with new data
4. **No Page Refresh Needed**: Updates happen seamlessly

Example:
```javascript
// User makes a purchase
const makePurchase = async () => {
  await createOrder({...}); // API call
  // Automatically:
  // 1. Order is created in MongoDB
  // 2. Wallet balance is updated
  // 3. useOrders() refetches and updates UI
  // 4. useWalletBalance() refetches and updates UI
  // All within 5 seconds
};
```

## Data Consistency

### During Authentication

1. **User registers**
   - User document created in MongoDB
   - Wallet document created simultaneously
   - Both operations atomic via Mongoose save()

2. **User logs in**
   - Latest user data fetched from MongoDB
   - Password verified against database
   - Session token generated with current timestamp

3. **After Login**
   - Dashboard fetches latest user data
   - All React Query hooks initialize
   - Data automatically syncs every 5 seconds

### Data Validation

- **Email uniqueness**: MongoDB unique index on users.email
- **Role validation**: Enum check (industry/buyer)
- **Password strength**: Zod validation on frontend + backend
- **Session expiry**: 24-hour validation
- **Data types**: Mongoose schema enforcement

## Error Handling

### Authentication Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| "Invalid credentials" | Wrong email/password | Verify credentials, try again |
| "Email already registered" | Duplicate email | Use different email or login |
| "Invalid role" | Role not industry/buyer | Select correct role |
| "Unable to connect to server" | Backend not running | Start backend with npm run dev:all |
| "Database error" | MongoDB not connected | Check MONGODB_URI env variable |

### Data Sync Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| "Failed to fetch products" | API not responding | Check backend logs |
| "Network error" | No internet | Check connection |
| "Timeout" | Slow response | Check database performance |

## Testing Authentication

### Manual Testing Checklist

- [ ] **Registration**
  - [ ] Create new user with industry role
  - [ ] Create new user with buyer role
  - [ ] Test validation errors (invalid email, weak password, etc.)
  - [ ] Verify user created in MongoDB

- [ ] **Login**
  - [ ] Login with registered credentials
  - [ ] Test wrong password (should fail)
  - [ ] Test non-existent email (should fail)
  - [ ] Verify redirect to correct dashboard
  - [ ] Check localStorage contains session

- [ ] **Real-Time Sync**
  - [ ] Login as buyer
  - [ ] Make a purchase (create order)
  - [ ] Watch wallet balance update (within 5 seconds)
  - [ ] Check order appears in orders list
  - [ ] Verify data consistency

- [ ] **Session**
  - [ ] Login to application
  - [ ] Refresh page (should stay logged in)
  - [ ] Wait 24+ hours (session should expire - test with mock time)
  - [ ] Logout (session cleared)

- [ ] **Google OAuth**
  - [ ] Click "Sign in with Google"
  - [ ] Authorize in Google popup
  - [ ] Verify redirect and data saved
  - [ ] Check user created with oauth_provider="google"

### Automated Testing (Future)

```javascript
// Example test file (to be created)
describe('Authentication', () => {
  test('User can register', async () => {
    const result = await registerUser({...});
    expect(result.success).toBe(true);
    expect(result.user.id).toBeDefined();
  });

  test('User can login', async () => {
    const result = await loginUser({...});
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  test('Session persists', () => {
    const session = getSession();
    expect(session).not.toBeNull();
  });

  test('Data syncs every 5 seconds', async () => {
    // Mock timer, advance 5 seconds
    jest.useFakeTimers();
    const { rerender } = render(<Dashboard />);
    jest.advanceTimersByTime(5000);
    // Verify refetch occurred
  });
});
```

## Environment Variables Summary

### Local Development (.env)

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/echina

# Server
NODE_ENV=development
PORT=3001

# Frontend API
VITE_API_URL=http://localhost:3001

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Netlify Production

```bash
# Required environment variables in Netlify Dashboard:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/echina

# Optional:
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Performance Metrics

### Target Performance

- **Login Response**: < 500ms
- **Registration Response**: < 500ms
- **Product List Load**: < 1s
- **Order Sync**: < 2s
- **Wallet Update**: < 2s (5s refetch interval)

### Monitoring

Monitor these metrics in Netlify/MongoDB Atlas dashboards:

- Function execution time
- MongoDB connection count
- Query response time
- Error rate
- Active users

## Security Considerations

### Authentication Security

- ✅ Passwords hashed with SHA256 + salt
- ✅ Session tokens generated per login
- ✅ Email validation on both frontend + backend
- ✅ Role validation prevents privilege escalation
- ✅ CORS properly configured

### Recommended Improvements

- 🔲 Upgrade to bcrypt password hashing
- 🔲 Add rate limiting to auth endpoints (prevent brute force)
- 🔲 Implement email verification
- 🔲 Add 2-factor authentication
- 🔲 Use HTTPS-only cookies for sessions (instead of localStorage)
- 🔲 Implement refresh tokens with rotating tokens

## Troubleshooting

### "Login fails with correct credentials"

1. Check MongoDB connection: Visit `http://localhost:3001/api/health`
2. Verify user exists: Check MongoDB Atlas dashboard
3. Check password format: Passwords are case-sensitive
4. Verify role matches: Role in login must match role in database

### "Session doesn't persist"

1. Check localStorage is enabled in browser
2. Verify session timestamp is recent (< 24 hours)
3. Check browser console for errors
4. Clear browser cache and login again

### "Real-time data not updating"

1. Check network tab in DevTools (requests every 5 seconds?)
2. Verify API endpoints are responding
3. Check MongoDB connection status
4. Try manual refresh: F5 or Ctrl+R

### "Google OAuth not working"

1. Set `VITE_GOOGLE_CLIENT_ID` in .env
2. Verify OAuth consent screen is configured
3. Check authorized redirect URIs in Google Cloud Console
4. Check browser console for Google SDK errors

## Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Configure local .env
3. ✅ Test authentication locally
4. ✅ Deploy to Netlify
5. ⏳ Set up monitoring (Sentry, MongoDB alerts)
6. ⏳ Implement enhanced security (bcrypt, rate limiting)
7. ⏳ Add email verification
8. ⏳ Implement password reset flow

## Support & Resources

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Express.js**: https://expressjs.com/
- **React Query**: https://tanstack.com/query/latest
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Authentication Best Practices**: https://owasp.org/www-community/attacks/authentication_cheat_sheet.html

## Questions & Issues

Refer to:
- `MONGODB_NETLIFY_SETUP.md` - MongoDB setup guide
- `NETLIFY_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `.env.example` - Environment variable template
- `src/lib/auth.ts` - Authentication implementation
- `src/hooks/useData.ts` - Real-time data synchronization
