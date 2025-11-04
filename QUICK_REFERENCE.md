# Quick Reference Guide - Authentication & MongoDB

## ✅ Current Status

| Component | Status | Location |
|-----------|--------|----------|
| MongoDB Atlas | ✅ Configured | Cloud |
| Express Backend | ✅ Running | localhost:3001 |
| Frontend Dev Server | ✅ Running | localhost:8080 |
| Authentication | ✅ Working | src/lib/auth.ts |
| Real-Time Sync | ✅ Configured | 5s refetch interval |
| Netlify Functions | ✅ Ready | netlify/functions/ |
| Documentation | ✅ Complete | 5 guides created |

## 🚀 Getting Started (Development)

### Start Everything
```bash
npm run dev:all
```

This starts:
- Frontend on http://localhost:8080
- Backend on http://localhost:3001
- MongoDB connection active

### Test Authentication
1. Visit http://localhost:8080
2. Click "Sign Up" or use existing account
3. Create/login with test account
4. Verify dashboard loads
5. Check MongoDB Atlas for user data

## 🌍 Deployment (Netlify)

### Pre-Deployment (One Time)

1. **Set MongoDB Environment Variable**
   ```bash
   # Option A: Netlify CLI
   netlify env:set MONGODB_URI "mongodb+srv://cristosrex22_db_user:***@echina.uumsajp.mongodb.net/?appName=Echina"
   
   # Option B: Netlify UI
   # Settings > Build & Deploy > Environment > Add environment variable
   # Key: MONGODB_URI
   # Value: Your connection string
   ```

2. **Link Your Repository** (if not already linked)
   ```bash
   netlify link
   ```

### Deploy

```bash
# Test build locally
npm run build

# Deploy
netlify deploy --prod

# Or push to main (if auto-deploy enabled)
git push origin main
```

### Verify Deployment

1. Visit your Netlify domain
2. Check `/api/health` endpoint shows "database: connected"
3. Test login/register
4. Check MongoDB Atlas metrics

## 📚 Documentation Map

| Document | Purpose | When to Use |
|----------|---------|------------|
| MONGODB_NETLIFY_SETUP.md | Complete setup guide | First-time setup |
| NETLIFY_DEPLOYMENT_CHECKLIST.md | Step-by-step deployment | Before deploying to Netlify |
| AUTHENTICATION_VERIFICATION.md | Technical details | Understanding system |
| AUTHENTICATION_SETUP_SUMMARY.md | Overview & reference | General overview |
| QUICK_REFERENCE.md | This document | Quick lookup |

## 🔑 Key Environment Variables

### Local Development (.env)
```
MONGODB_URI=mongodb+srv://cristosrex22_db_user:***@echina.uumsajp.mongodb.net/?appName=Echina
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001
```

### Netlify (Dashboard > Settings > Build & Deploy > Environment)
```
MONGODB_URI=mongodb+srv://cristosrex22_db_user:***@echina.uumsajp.mongodb.net/?appName=Echina
VITE_GOOGLE_CLIENT_ID=your-google-id (optional)
```

## 🧪 Testing Checklist

### Local Development
- [ ] `npm run dev:all` starts without errors
- [ ] Both servers show connection logs
- [ ] Can access http://localhost:8080
- [ ] Can create account
- [ ] Can login with credentials
- [ ] Dashboard loads and shows data
- [ ] Data refreshes every 5 seconds

### Before Deploying
- [ ] MONGODB_URI set in Netlify dashboard
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint warnings: `npm run lint`
- [ ] Build output in `dist/` folder

### After Deploying
- [ ] Site loads without errors
- [ ] `/api/health` returns "database: connected"
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Data persists in MongoDB
- [ ] No CORS errors in console

## 🐛 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| "MONGODB_URI not set" | Check .env file exists, or set in Netlify dashboard |
| "Can't connect to MongoDB" | Verify IP is whitelisted in MongoDB Atlas (Network Access) |
| "Backend not running" | Run `npm run dev:all` instead of just `npm run dev` |
| "Login fails" | Check MongoDB Atlas dashboard for user data |
| "Data not updating" | Check browser network tab (refetch every 5s?) |
| "Functions timeout" | Check MongoDB connection or query performance |

## 📞 Support Quick Links

### MongoDB
- Atlas Dashboard: https://cloud.mongodb.com/
- Documentation: https://docs.mongodb.com/
- Troubleshooting: https://docs.mongodb.com/manual/faq/

### Netlify
- Dashboard: https://app.netlify.com/
- Functions Docs: https://docs.netlify.com/functions/
- Build Logs: Settings > Build & Deploy > Deploys

### Code
- Auth Implementation: src/lib/auth.ts
- API Client: src/lib/db.ts
- Data Hooks: src/hooks/useData.ts
- Backend: server.js
- Netlify Functions: netlify/functions/

## 🎯 Common Tasks

### Enable Google Sign-In
1. Get Client ID from Google Cloud Console
2. Set `VITE_GOOGLE_CLIENT_ID` in .env and Netlify
3. Test "Sign in with Google" button

### Monitor Database Performance
1. Go to MongoDB Atlas dashboard
2. Click "Monitoring" → "Metrics"
3. Watch connection count, operations/sec, storage

### View Function Logs
```bash
# Netlify CLI
netlify logs functions

# Or check in Netlify UI
# Site > Functions > Click function name
```

### Clear Netlify Cache Before Deploying
```bash
# Netlify UI: Deploys > Trigger deploy > Clear cache and redeploy

# Or CLI:
netlify deploy --prod --clear-cache
```

### Emergency Rollback
1. Go to Netlify dashboard
2. Click "Deploys" tab
3. Find previous working deploy
4. Click "Publish deploy"

## 💡 Pro Tips

1. **Test Locally First**
   - Always test authentication locally before deploying
   - Use `npm run dev:all` to run both servers

2. **Environment Variables**
   - Never commit .env with real passwords
   - Use Netlify dashboard for production secrets
   - Keep development and production passwords separate

3. **Real-Time Data**
   - 5-second refetch is good balance between freshness and performance
   - Adjust `refetchInterval` in src/hooks/useData.ts if needed
   - Watch network tab to verify refetch is happening

4. **Debugging**
   - Use browser DevTools Network tab to inspect API calls
   - Check MongoDB Atlas dashboard for data
   - Use `netlify logs` to see function errors
   - Enable Sentry for error tracking (future)

5. **Performance**
   - Monitor function execution time in Netlify dashboard
   - Check MongoDB slow query logs
   - Use `npm run build:analyze` to check bundle size

## 📊 Architecture at a Glance

```
Browser (http://localhost:8080)
    ↓ HTTP
Express Server (http://localhost:3001)
    ↓ Mongoose
MongoDB Atlas (Cloud)

---

Browser (https://your-site.netlify.app)
    ↓ HTTP
Netlify Functions (/.netlify/functions/*)
    ↓ Mongoose
MongoDB Atlas (Cloud)
```

## ✨ What's Included

### Authentication
- ✅ Email/password registration & login
- ✅ Google OAuth ready (needs VITE_GOOGLE_CLIENT_ID)
- ✅ Role-based access (industry/buyer)
- ✅ Session management with 24h expiry
- ✅ Automatic wallet creation

### Real-Time Features
- ✅ Products sync every 5 seconds
- ✅ Orders sync every 5 seconds
- ✅ Wallet updates every 5 seconds
- ✅ Automatic cache invalidation

### Developer Features
- ✅ TypeScript for type safety
- ✅ React Query for state management
- ✅ Proper error handling
- ✅ Environment variable management
- ✅ Hot reload in development

## 🚨 Important Reminders

1. ⚠️ Never commit .env files with real passwords
2. ⚠️ Always set MONGODB_URI in Netlify before deploying
3. ⚠️ Test locally with `npm run dev:all` before deploying
4. ⚠️ Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Netlify)
5. ⚠️ Monitor function logs after deployment

## 🎉 You're All Set!

Your authentication system is:
- ✅ Fully configured
- ✅ Running locally
- ✅ Ready to deploy
- ✅ Documented

**Next Step**: Follow NETLIFY_DEPLOYMENT_CHECKLIST.md to deploy to production!

---

**Need help?** Check the relevant documentation file or refer to the External Resources section above.

Last Updated: 2024
