# Vercel Deployment Guide - Complete Setup

## ✅ Overview

This application is now fully configured for **Vercel** with serverless API routes.

**Architecture:**
- **Frontend**: React + Vite (deployed to Vercel CDN)
- **Backend**: Vercel API Routes (serverless)
- **Database**: MongoDB Atlas (cloud)
- **Development**: Local Express server + Vercel API local emulation

---

## 🚀 Quick Start Deployment

### 1. Connect Vercel

#### Option A: Via Vercel UI
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your Git repository (GitHub, GitLab, Bitbucket)
4. Select your repository and branch
5. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy project
vercel
```

### 2. Set Environment Variables

**Critical**: The app WILL NOT WORK without this step.

#### Via Vercel Dashboard:
1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Click **Add New Environment Variable**
4. **Name**: `MONGODB_URI`
5. **Value**: Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
6. **Select environments**: Check Production, Preview, and Development
7. Click **Save**

#### Via Vercel CLI:
```bash
vercel env add MONGODB_URI
# Then paste your MongoDB URI when prompted
```

### 3. Deploy

#### Option A: Automatic (Recommended)
Push to your main branch - Vercel automatically builds and deploys:
```bash
git push origin main
```

#### Option B: Manual Deploy via CLI
```bash
# Build and deploy
vercel --prod
```

### 4. Verify Deployment

After deployment, test:

```bash
# Check health endpoint
curl https://your-project.vercel.app/api/health

# Expected response:
# {
#   "status": "ok",
#   "message": "Backend server is running",
#   "database": "connected",
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

---

## 📋 Pre-Deployment Checklist

### Local Testing

- [ ] `npm run dev:all` starts without errors
- [ ] Frontend loads on http://localhost:8080
- [ ] Backend runs on http://localhost:3001
- [ ] MongoDB connected message appears
- [ ] Can create test account via signup
- [ ] Can login with credentials
- [ ] Dashboard shows data

### Build Testing

```bash
# Test production build
npm run build
npm run preview
```

- [ ] No build errors
- [ ] Frontend loads from `/dist`
- [ ] No TypeScript errors: `npm run type-check`

### Configuration Check

- [ ] `vercel.json` exists in root (contains rewrites, headers, env)
- [ ] `api/` directory exists with all endpoints
- [ ] `api/lib/mongodb.js` contains MongoDB connection
- [ ] All auth functions exist in `api/auth/`
- [ ] `.env` has MONGODB_URI (local dev only, not committed)

---

## 🔧 Configuration Files

### vercel.json (Deployment Config)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": ["MONGODB_URI"],
  "functions": {
    "api/**/*.{js,ts}": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

**What this does:**
- Builds frontend with `npm run build`
- Outputs built files to `dist/`
- Routes `/api/:path*` to serverless functions
- Falls back to `index.html` for React Router
- Requires `MONGODB_URI` environment variable
- Sets function timeout to 60 seconds

### .env (Local Development Only)

```bash
MONGODB_URI=mongodb+srv://...
VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

**Note**: Never commit real credentials. Use Vercel dashboard for production.

---

## 📚 Project Structure

```
your-project/
├── api/
│   ├── lib/
│   │   ├── mongodb.js      ← MongoDB connection & schemas
│   │   ├── helpers.js      ← Response/CORS helpers
│   │   └── auth.js         ← Auth utilities (hashing, tokens)
│   ├── auth/
│   │   ├── register.js     ← Registration endpoint
│   │   ├── login.js        ← Login endpoint
│   │   ├── google.js       ← Google OAuth endpoint
│   │   └── user.js         ← Get user data endpoint
│   ├── health.js           ← Health check endpoint
│   ├── products.js         ← Get/create products
│   ├── orders.js           ← Get/create/update orders
│   ├── wallet.js           ← Wallet operations
│   ├── posts.js            ← Social posts
│   ├── clans.js            ← Clan management
│   ├── transactions.js     ← Transaction history
│   └── messages.js         ← Messaging
├── src/
│   ├── lib/
│   │   ├── auth.ts         ← Frontend auth client (updated for Vercel)
│   │   ├── db.ts           ← API client
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   └── ... other pages
│   └── hooks/
│       ├── useData.ts      ← Real-time data sync (5s refetch)
│       └── use-toast.ts
├── vercel.json             ← Vercel config (REQUIRED)
├── .env                    ← Local env vars (DO NOT COMMIT)
├── .env.example            ← Template (commit this)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🌍 Environment Variables

### Required for Production

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://...` | Vercel Dashboard |

### Optional

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Vercel Dashboard |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key | Vercel Dashboard |

### Local Development Only

These go in `.env` file (never commit):
```bash
MONGODB_URI=your-connection-string
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001
```

---

## 🧪 Testing After Deployment

### 1. Health Check
```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. User Registration
1. Visit https://your-project.vercel.app/signup
2. Create account with test data
3. Verify success message appears
4. Check MongoDB Atlas for new user document

### 3. User Login
1. Visit https://your-project.vercel.app/
2. Login with registered credentials
3. Verify redirect to dashboard
4. Verify data loads correctly

### 4. Real-Time Data Sync
1. Open dashboard
2. Create/update data (order, product, etc.)
3. Watch data update automatically (within 5 seconds)
4. Check browser Network tab for refetch calls every 5 seconds

### 5. Authentication Flows
- [ ] Email/Password registration works
- [ ] Email/Password login works
- [ ] Google OAuth login works (if configured)
- [ ] Session persists on page reload
- [ ] Session expires after 24 hours
- [ ] Role-based access works (industry vs buyer)

---

## 🐛 Troubleshooting

### "Failed to fetch" on signup/login

**Cause**: Backend API not responding  
**Check**:
1. Is `MONGODB_URI` set in Vercel dashboard?
2. Check Vercel Function logs:
   - Go to Vercel dashboard → Deployments → Functions tab
3. Verify MongoDB Atlas cluster is running
4. Check for CORS issues in browser console
5. Verify `.env` file has correct MongoDB URI for local testing

### "MONGODB_URI environment variable is not set"

**Solution**:
1. Go to Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add `MONGODB_URI` variable with your MongoDB connection string
4. Redeploy: Go to Deployments → Click latest deployment → Click "Redeploy"

### API Functions timeout

**Solutions**:
1. Check MongoDB connection pooling in `api/lib/mongodb.js`
2. Add indexes to frequently queried MongoDB fields
3. Optimize database queries
4. Increase function timeout in `vercel.json` (max 60 seconds)
5. Check function logs for slow operations

### CORS errors

**Solution**:
- Vercel automatically handles CORS for same-domain requests
- Check that requests use relative paths (e.g., `/api/auth/login`)
- If using custom domain, ensure CORS headers are set in API routes
- Current API routes already set correct CORS headers

### Build failures

**Check**:
1. Are all dependencies in `package.json`?
2. Run `npm run build` locally to reproduce error
3. Check build logs in Vercel dashboard
4. Verify all imports are correct
5. Run `npm run type-check` for TypeScript errors

### Can't connect to MongoDB

**Solutions**:
1. Check MongoDB URI format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
2. Verify database user exists and password is correct
3. Add Vercel IP to MongoDB Atlas Network Access whitelist:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs)
4. Check cluster is not paused
5. Verify cluster is in same region as Vercel (for better performance)

---

## 📊 Monitoring

### Vercel Dashboard

1. **Deployments**: View build logs, deployment status
2. **Functions**: See function execution time, error rate, logs
3. **Analytics**: View traffic, performance metrics
4. **Environment**: Verify all variables are set

### MongoDB Atlas Dashboard

1. **Databases**: View collections and data volume
2. **Metrics**: Monitor connection count, operations/sec
3. **Alerts**: Set up notifications for connection issues
4. **Performance**: Check query performance

### View Vercel Function Logs

```bash
# Via Vercel CLI
vercel logs functions

# Or via dashboard:
# Vercel Dashboard → Deployments → Functions tab → Click function
```

---

## 🔄 Deployment Workflow

### Standard Development Flow

1. **Develop locally**
   ```bash
   npm run dev:all
   ```

2. **Test features**
   - Create accounts
   - Login
   - Perform actions
   - Verify real-time sync

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Your message"
   ```

4. **Push to deploy**
   ```bash
   git push origin main
   ```

5. **Vercel automatically:**
   - Builds the project
   - Bundles API routes
   - Deploys to CDN
   - Sets environment variables

6. **Test on production**
   - Visit your Vercel domain
   - Test auth flow
   - Monitor function logs

### Manual Deployment (if needed)

```bash
# Build locally
npm run build

# Deploy to production
vercel --prod
```

---

## 🔒 Security Checklist

- [x] MongoDB URI not hardcoded (uses environment variables)
- [x] HTTPS enforced by Vercel (automatic)
- [x] Environment variables masked in build logs
- [x] CORS properly configured in API routes
- [x] Passwords hashed (SHA256 + salt)
- [ ] Consider: Upgrade to bcrypt for production passwords
- [ ] Consider: Add rate limiting to auth endpoints
- [ ] Consider: Implement email verification for signup
- [ ] Consider: Add refresh token rotation for OAuth

---

## 📈 Performance Optimization

### Frontend
- ✅ Lazy loaded routes
- ✅ Code splitting enabled
- ✅ Image optimization available
- ✅ CSS minification

### API Routes
- ✅ Connection pooling configured
- ✅ Database query optimization
- ✅ Response caching headers
- ✅ Function timeout: 60 seconds

### Database
Add indexes for frequently queried fields:
```javascript
// In MongoDB Atlas or via script
db.users.createIndex({ email: 1 })
db.products.createIndex({ seller_id: 1 })
db.orders.createIndex({ buyer_id: 1 })
db.orders.createIndex({ seller_id: 1 })
db.wallet.createIndex({ user_id: 1 })
```

---

## 🚀 Advanced Topics

### Custom Domain

1. Go to Vercel project settings
2. Go to Domains
3. Add custom domain
4. Update DNS records (Vercel provides instructions)
5. SSL certificate auto-generated

### Preview Deployments

Every push to non-main branches automatically gets:
- Unique preview URL
- Same backend (production database)
- Useful for testing before merge to main

### Rollback

If something breaks:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Environment-Specific Variables

Set different variables for Production, Preview, Development:
1. Vercel Dashboard → Settings → Environment Variables
2. Check boxes for desired environments
3. Variables automatically applied to each environment

---

## 💬 Getting Help

### Vercel
- **Docs**: https://vercel.com/docs
- **API Routes**: https://vercel.com/docs/concepts/functions/serverless-functions
- **Support**: https://vercel.com/support
- **Status**: https://www.vercelstatus.com/

### MongoDB
- **Atlas**: https://www.mongodb.com/cloud/atlas
- **Docs**: https://docs.mongodb.com/
- **University**: https://learn.mongodb.com/

### Code Issues
- Frontend auth: `src/lib/auth.ts`
- API client: `src/lib/db.ts`
- Data hooks: `src/hooks/useData.ts`
- API routes: `api/`

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Site loads without errors
- ✅ `/api/health` returns "database: connected"
- ✅ Can create new account
- ✅ Can login with credentials
- ✅ Dashboard loads with real data
- ✅ Data syncs automatically (5 seconds)
- ✅ No CORS or network errors in console
- ✅ Function logs show no errors
- ✅ Response time < 2 seconds
- ✅ No "Failed to fetch" errors

---

## 📋 Deployment Checklist (Final)

- [ ] `.env` file has MONGODB_URI (local only)
- [ ] `vercel.json` is committed
- [ ] `api/` directory exists with all endpoints
- [ ] No uncommitted changes
- [ ] `npm run build` succeeds locally
- [ ] MONGODB_URI set in Vercel Dashboard environment
- [ ] GitHub/GitLab repository connected to Vercel
- [ ] Site builds successfully on Vercel
- [ ] Auth endpoints respond correctly
- [ ] Data persists in MongoDB
- [ ] Real-time sync works (5 seconds)
- [ ] No errors in Function logs
- [ ] Tested on production domain
- [ ] Custom domain configured (if desired)

---

## 🎉 You're Ready!

Your application is now deployed on Vercel with:
- ✅ Serverless API routes (no infrastructure to manage)
- ✅ Real-time data sync (5 seconds)
- ✅ MongoDB database
- ✅ Complete authentication system
- ✅ Automatic scaling
- ✅ Git-based deployments
- ✅ Edge caching

**Next Steps**:
1. Connect your Git repository to Vercel
2. Set `MONGODB_URI` environment variable
3. Push to main branch
4. Watch Vercel deploy automatically!

---

**Status**: ✅ Vercel-Ready, Production-Ready
**Last Updated**: 2024
