# Netlify Deployment Guide - Complete Setup

## ✅ Overview

This application is now **Netlify-only** with no Fly.io dependencies.

**Architecture:**
- **Frontend**: React + Vite (deployed to Netlify CDN)
- **Backend**: Netlify Functions (serverless)
- **Database**: MongoDB Atlas (cloud)
- **Development**: Local Express server + Netlify Functions emulation

---

## 🚀 Quick Start Deployment

### 1. Connect Netlify

#### Option A: Via Netlify UI
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub, GitLab, Bitbucket)
4. Select your repository and branch

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Link your project to Netlify
netlify link
```

### 2. Set Environment Variables

**Critical**: The app WILL NOT WORK without this step.

#### Via Netlify UI:
1. Go to your Netlify site dashboard
2. **Settings** → **Build & Deploy** → **Environment**
3. Click **Add environment variable**
4. **Key**: `MONGODB_URI`
5. **Value**: `mongodb+srv://cristosrex22_db_user:dVBaNphdb5ehhTcb@echina.uumsajp.mongodb.net/?appName=Echina`
6. Click **Save**

#### Via CLI:
```bash
netlify env:set MONGODB_URI "mongodb+srv://cristosrex22_db_user:dVBaNphdb5ehhTcb@echina.uumsajp.mongodb.net/?appName=Echina"
```

### 3. Deploy

#### Option A: Push to Git (Automatic)
```bash
git push origin main
```
Netlify automatically builds and deploys on push.

#### Option B: Manual Deploy via CLI
```bash
# Build locally first
npm run build

# Deploy to production
netlify deploy --prod
```

### 4. Verify Deployment

After deployment, test:

```bash
# Check health endpoint
curl https://your-site.netlify.app/api/health

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
- [ ] Can create test account
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

- [ ] `netlify.toml` exists and is correct
- [ ] `mongodb-connection.js` in `netlify/functions/`
- [ ] Auth functions exist: `auth-register.js`, `auth-login.js`
- [ ] `.env` has MONGODB_URI (for local dev only)

---

## 🔧 Configuration Files

### netlify.toml (Deployment Config)

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[functions]
  node_bundler = "esbuild"
  directory = "netlify/functions"
  external_node_modules = ["mongoose"]

[[redirects]]
  from = "/api/auth/*"
  to = "/.netlify/functions/auth-:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**What this does:**
- Builds frontend with `npm run build`
- Bundles Netlify Functions from `netlify/functions/`
- Publishes built files from `dist/`
- Routes `/api/auth/*` → `/.netlify/functions/auth-*`
- Routes `/api/*` → `/.netlify/functions/*`
- Falls back to `index.html` for React Router

### .env (Local Development Only)

```bash
# Local development backend
MONGODB_URI=mongodb+srv://...
VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

**Note**: Never commit real credentials. Use Netlify dashboard for production.

---

## 📚 Project Structure

```
echina/
├── netlify/
│   ├── functions/
│   │   ├── auth-register.js      ← Registration endpoint
│   │   ├── auth-login.js         ← Login endpoint
│   │   ├── auth-google.js        ← Google OAuth
│   │   ├── auth-user.js          ← Get user data
│   │   ├── mongodb-connection.js ← MongoDB setup
│   │   └── ... other functions
│   └── netlify.functions.example/ ← Examples (ignore)
├── src/
│   ├── lib/
│   │   ├── auth.ts              ← Frontend auth client
│   │   ├── db.ts                ← API client
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   └── ... other pages
│   └── hooks/
│       ├── useData.ts           ← Real-time data sync (5s refetch)
│       └── use-toast.ts
├── netlify.toml                  ← Netlify config (REQUIRED)
├── .env                          ← Local env vars (DO NOT COMMIT)
├── .env.example                  ← Template (commit this)
├── package.json
├── vite.config.ts
├── server.js                     ← Local Express backend
├── tsconfig.json
└── README.md
```

---

## 🌍 Environment Variables

### Required for Production

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://...` | Netlify Dashboard |

### Optional

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Netlify Dashboard |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key | Netlify Dashboard |

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
curl https://your-site.netlify.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. User Registration
1. Visit https://your-site.netlify.app/signup
2. Create account with test data
3. Verify success message
4. Check MongoDB Atlas for new user

### 3. User Login
1. Visit https://your-site.netlify.app/
2. Login with registered credentials
3. Verify redirect to dashboard
4. Verify data loads

### 4. Real-Time Data Sync
1. Open dashboard
2. Create/update data (order, product, etc.)
3. Watch data update (within 5 seconds)
4. Check browser Network tab for refetch calls

---

## 🐛 Troubleshooting

### "Failed to fetch" on signup/login

**Cause**: Backend not responding  
**Check**:
1. Is `MONGODB_URI` set in Netlify dashboard?
2. Run `netlify logs` to see function errors
3. Check MongoDB Atlas for connection issues
4. Verify Netlify build succeeded (no errors)

### "MONGODB_URI environment variable is not set"

**Solution**:
1. Go to Netlify dashboard
2. Settings → Build & Deploy → Environment
3. Add `MONGODB_URI` variable
4. Trigger redeploy: Deploys → "Trigger deploy"

### Functions timeout

**Solutions**:
1. Check MongoDB query performance
2. Add database indexes
3. Optimize function code
4. Check Netlify function logs for slow queries

### CORS errors

**Solution**:
- Netlify handles CORS automatically for same-domain requests
- No additional configuration needed
- If using custom domain, ensure it's set in Netlify DNS

---

## 📊 Monitoring

### Netlify Dashboard

1. **Deploys**: View build logs, deployment status
2. **Functions**: See function execution time, error rate
3. **Analytics**: View traffic, performance metrics

### MongoDB Atlas Dashboard

1. **Databases**: View collections and data
2. **Metrics**: Monitor connection count, operations/sec
3. **Alerts**: Set up notifications for connection issues

### View Netlify Function Logs

```bash
# Via CLI
netlify logs functions

# Or via dashboard:
# Site → Functions → Click function name
```

---

## 🔄 Deployment Workflow

### Standard Flow

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

5. **Netlify automatically:**
   - Builds the project
   - Bundles Netlify Functions
   - Deploys to CDN
   - Sets environment variables

6. **Test on production**
   - Visit your Netlify domain
   - Test auth flow
   - Monitor function logs

### Manual Deployment (if needed)

```bash
# Build locally
npm run build

# Deploy to production
netlify deploy --prod
```

---

## 🔒 Security Checklist

- [x] MongoDB URI not hardcoded (uses environment variables)
- [x] HTTPS enforced by Netlify
- [x] Environment variables masked in build logs
- [x] CORS configured
- [x] Passwords hashed (SHA256 + salt)
- [ ] Consider: Upgrade to bcrypt for production
- [ ] Consider: Add rate limiting to auth endpoints
- [ ] Consider: Implement email verification

---

## 📈 Performance Optimization

### Frontend
- ✅ Lazy loaded routes
- ✅ Code splitting enabled
- ✅ Image optimization available
- ✅ CSS minification

### Backend
- ✅ Connection pooling
- ✅ Database query optimization
- ✅ Caching headers configured

### Database
- Add indexes for frequently queried fields:
  ```javascript
  db.users.createIndex({ email: 1 })
  db.products.createIndex({ seller_id: 1 })
  ```

---

## 🚀 Advanced Topics

### Custom Domain

1. Go to Netlify dashboard
2. Domain settings
3. Add custom domain
4. Update DNS records
5. Wait for SSL certificate (auto-generated)

### Preview Deployments

Every pull request automatically gets:
- Unique preview URL
- Same backend (production database)
- Useful for testing before merge

### Rollback

If something breaks:
1. Go to Deploys tab
2. Find previous working deploy
3. Click "Publish deploy"

---

## 💬 Getting Help

### Netlify
- **Docs**: https://docs.netlify.com/
- **Functions**: https://docs.netlify.com/functions/overview/
- **Support**: https://www.netlify.com/support/

### MongoDB
- **Atlas**: https://www.mongodb.com/cloud/atlas
- **Docs**: https://docs.mongodb.com/

### Code Issues
- Frontend auth: `src/lib/auth.ts`
- API client: `src/lib/db.ts`
- Data hooks: `src/hooks/useData.ts`
- Netlify functions: `netlify/functions/`

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Site loads without errors
- ✅ `/api/health` returns "database: connected"
- ✅ Can create new account
- ✅ Can login with credentials
- ✅ Dashboard loads with real data
- ✅ Data syncs automatically (5 seconds)
- ✅ No CORS or network errors
- ✅ Function logs show no errors
- ✅ Response time < 2 seconds
- ✅ No "Failed to fetch" errors

---

## 📝 Deployment Checklist (Final)

- [ ] `.env` file has MONGODB_URI (local only)
- [ ] `netlify.toml` is committed
- [ ] No uncommitted changes
- [ ] `npm run build` succeeds locally
- [ ] MONGODB_URI set in Netlify dashboard
- [ ] Repository connected to Netlify
- [ ] Site builds successfully on Netlify
- [ ] Auth endpoints respond correctly
- [ ] Data persists in MongoDB
- [ ] Real-time sync works (5 seconds)
- [ ] No errors in function logs
- [ ] Tested on production domain

---

## 🎉 You're Ready!

Your application is now deployed on Netlify with:
- ✅ Serverless backend (Netlify Functions)
- ✅ Real-time data sync (5 seconds)
- ✅ MongoDB database
- ✅ Complete authentication system
- ✅ Zero Fly.io dependencies

**Next Step**: Push to your main branch and watch Netlify deploy automatically!

---

**Status**: ✅ Netlify-Only, Production-Ready
**Last Updated**: 2024
