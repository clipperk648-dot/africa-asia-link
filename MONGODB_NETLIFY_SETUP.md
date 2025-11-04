# MongoDB & Authentication Setup Guide for Netlify

## Overview

This application uses **MongoDB** (via Mongoose) as the primary database for all operations including authentication, user management, products, orders, wallets, and messages. The system works both locally (Express server) and in production (Netlify Functions).

## Prerequisites

1. MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
2. Netlify account with CLI installed
3. Node.js 18+ and npm

## Step 1: Set Up MongoDB Atlas

### Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (free tier available)
4. Configure cluster settings:
   - Provider: AWS/GCP/Azure (choose closest region)
   - Cluster tier: M0 Sandbox (free)
   - Name: `echina` (or your preferred name)

### Create Database User

1. In MongoDB Atlas, go to **Database Access**
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `echina_user` (or your preferred)
5. Generate secure password (save this!)
6. Built-in Role: `readWriteAnyDatabase`

### Get Connection String

1. Go to **Databases** → Click "Connect" on your cluster
2. Select "Drivers" (Node.js)
3. Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname?appName=Echina`
4. Replace:
   - `username` with your database user
   - `password` with your secure password
   - `cluster` with your cluster name
   - `dbname` with database name (e.g., `echina`)

### Configure IP Access

1. Go to **Network Access**
2. Click "Add IP Address"
3. For Netlify deployments, allow all IPs (0.0.0.0/0) - this is safe with proper authentication
4. Click "Confirm"

## Step 2: Configure Local Development

### 1. Create .env File

```bash
# Copy template
cp .env.example .env

# Update with your MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/echina?appName=Echina
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001
```

### 2. Verify MongoDB Connection

```bash
# Start dev server (runs both frontend and backend)
npm run dev:all

# You should see:
# ✓ Environment variables loaded from .env file
# ✓ MongoDB connected successfully
# 🚀 Backend server running on http://localhost:3001
```

### 3. Test Authentication Locally

The authentication endpoints are available:

- **Register**: `POST /api/auth/register`
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "User Name",
    "phone": "+1234567890",
    "role": "buyer" // or "industry"
  }
  ```

- **Login**: `POST /api/auth/login`
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "role": "buyer"
  }
  ```

- **Google OAuth**: `POST /api/auth/google`
  ```json
  {
    "token": "google_id_token",
    "role": "buyer"
  }
  ```

- **Get User**: `GET /api/auth/user/:userId`

## Step 3: Configure Netlify Deployment

### 1. Set Environment Variables in Netlify

**Option A: Using Netlify UI**
1. Go to your Netlify site settings
2. Navigate to **Build & Deploy** → **Environment**
3. Click "Add environment variable"
4. Add:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string from Step 1

**Option B: Using Netlify CLI**
```bash
netlify env:set MONGODB_URI "mongodb+srv://username:password@cluster.mongodb.net/echina"
```

### 2. Build Configuration

The `netlify.toml` is already configured to:
- Build the React frontend with Vite
- Bundle Netlify Functions from `netlify/functions/`
- Set Node.js version 20 for compatibility

### 3. API Routing Configuration

The redirects in `netlify.toml` handle:
- `/api/auth/*` → `/.netlify/functions/auth-*`
- `/api/*` → `/.netlify/functions/*`
- `/*` → `/index.html` (React Router fallback)

## Step 4: Deploy to Netlify

### 1. Connect Repository

```bash
# Link your git repository to Netlify
netlify link

# Or manually connect via Netlify UI
```

### 2. Deploy

```bash
# Build the project
npm run build

# Deploy to production
netlify deploy --prod

# Or push to main branch (if using Git-based deployment)
git push origin main
```

### 3. Verify Deployment

After deployment, test the endpoints:

```bash
# Replace YOUR_SITE with your Netlify domain
curl -X POST https://YOUR_SITE.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass",
    "name": "Test User",
    "phone": "+1234567890",
    "role": "buyer"
  }'
```

## Netlify Functions Architecture

### Authentication Functions

- **auth-register.js**: Registers new user, creates wallet
- **auth-login.js**: Authenticates user with email/password
- **auth-google.js**: Handles Google OAuth login
- **auth-user.js**: Retrieves user data by ID

### Supporting Functions

- **mongodb-connection.js**: Manages MongoDB connection pooling
- **response-helper.js**: Standardizes JSON responses
- Other functions handle products, orders, wallets, messaging, etc.

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  name: String,
  phone: String,
  role: "industry" | "buyer",
  oauth_id: String, // for Google OAuth
  oauth_provider: String,
  created_at: Date,
  updated_at: Date
}
```

### Wallet Collection
```javascript
{
  _id: ObjectId,
  user_id: String,
  balance: Number,
  currency: String ("USD"),
  updated_at: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  buyer_id: String,
  seller_id: String,
  product_id: String,
  quantity: Number,
  total: Number,
  status: "pending" | "shipped" | "delivered" | "cancelled",
  created_at: Date,
  updated_at: Date
}
```

## Environment Variables Summary

| Variable | Dev Value | Netlify Value | Required |
|----------|-----------|---------------|----------|
| MONGODB_URI | Local/Atlas | Atlas URI | ✅ Yes |
| NODE_ENV | development | production | ⚠️ Auto |
| PORT | 3001 | Auto | ⚠️ Auto |
| VITE_API_URL | http://localhost:3001 | Auto | ❌ No |

## Troubleshooting

### MongoDB Connection Issues

**Error**: "Invalid scheme, expected connection string to start with 'mongodb://'"

- Check MONGODB_URI is correctly set in .env
- Verify MongoDB Atlas user credentials are correct
- Ensure IP address is whitelisted in MongoDB Atlas

**Error**: "Unable to connect to server at echina.mongodb.net"

- Check internet connectivity
- Verify MongoDB cluster is running
- Check MongoDB Atlas region is accessible from your location
- For Netlify, ensure MongoDB Atlas allows 0.0.0.0/0

### Authentication Issues

**Error**: "Email already registered"

- The email already exists in MongoDB
- Check MongoDB Atlas dashboard for existing users
- Use a different email or clear test data

**Error**: "Invalid credentials"

- Email/password combination is incorrect
- Verify credentials were registered successfully
- Check password hashing is consistent

### Netlify Function Timeouts

If functions timeout (>10 seconds):

1. Check MongoDB connection pooling in `mongodb-connection.js`
2. Add query indexes to frequently accessed fields
3. Implement result caching for read-heavy operations

Example index commands in MongoDB Atlas:
```javascript
db.users.createIndex({ email: 1 })
db.products.createIndex({ seller_id: 1 })
db.orders.createIndex({ buyer_id: 1, created_at: -1 })
```

## Security Considerations

### Password Hashing

The system uses SHA256 with salt for password hashing:
```javascript
crypto.createHash('sha256').update(password + 'echina_salt').digest('hex')
```

**For production**, consider upgrading to bcrypt:
```bash
npm install bcrypt
```

### Session Tokens

Sessions are created as base64-encoded JSON with 7-day expiry:
```javascript
{
  userId: String,
  email: String,
  iat: Number (issued at),
  exp: Number (expires in 7 days)
}
```

### Environment Security

- Never commit `.env` files with real credentials
- Use Netlify's environment variables dashboard
- Rotate MongoDB Atlas passwords periodically
- Enable 2FA for MongoDB Atlas account

## Real-Time Data Updates

The current implementation uses standard MongoDB queries. For real-time updates, consider:

1. **MongoDB Change Streams** (enterprise feature)
2. **Polling** (current approach, simple)
3. **WebSockets** (with Socket.io on backend)
4. **Webhooks** (for external integrations)

To implement Change Streams:
```javascript
const changeStream = db.collection('users').watch();
changeStream.on('change', (change) => {
  console.log('User data changed:', change);
});
```

## Monitoring & Analytics

### Enable MongoDB Atlas Monitoring

1. Go to MongoDB Atlas dashboard
2. **Monitoring** → **Metrics**
3. Track:
   - Connection count
   - Operations/sec
   - Network I/O
   - Storage usage

### Netlify Function Analytics

1. Go to Netlify site
2. **Functions** → **Analytics**
3. Monitor:
   - Function execution time
   - Error rate
   - Memory usage

## Performance Optimization

### Database Indexes

Create these indexes for better performance:

```javascript
// Users - by email for login
db.users.createIndex({ email: 1 }, { unique: true })

// Products - by seller
db.products.createIndex({ seller_id: 1 })

// Orders - by buyer and date
db.orders.createIndex({ buyer_id: 1, created_at: -1 })

// Transactions - by user
db.transactions.createIndex({ user_id: 1, created_at: -1 })
```

### Connection Pooling

The `mongodb-connection.js` uses connection pooling:
- Max pool size: 10
- Server selection timeout: 10 seconds
- Socket timeout: 30 seconds

Adjust these values based on your needs:
```javascript
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
})
```

## Next Steps

1. ✅ Set up MongoDB Atlas cluster
2. ✅ Configure local .env file
3. ✅ Test locally with `npm run dev:all`
4. ✅ Set environment variables in Netlify
5. ✅ Deploy to Netlify
6. ✅ Test authentication flow on deployed site
7. 📊 Monitor MongoDB metrics
8. 🔒 Implement additional security (bcrypt, 2FA, etc.)

## Support & Documentation

- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Express.js**: https://expressjs.com/

## Questions?

Refer to:
- `.env.example` for environment variable template
- `server.js` for Express backend implementation
- `netlify/functions/` for Netlify Functions implementation
- `src/lib/auth.ts` for frontend authentication client
