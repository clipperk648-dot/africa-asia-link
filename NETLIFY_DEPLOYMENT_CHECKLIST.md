# Netlify Deployment Checklist for Authentication & MongoDB

## Pre-Deployment Verification (Local)

### ✅ Backend Server
- [x] Express server runs on `npm run dev:all`
- [x] MongoDB connection successful with correct URI from .env
- [x] Health endpoint available at `http://localhost:3001/api/health`
- [x] Authentication endpoints accessible:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - POST `/api/auth/google`
  - GET `/api/auth/user/:id`

### ✅ Frontend
- [x] Vite dev server runs on `npm run dev`
- [x] Auth API URL correctly configured in `.env`
- [x] Login page loads at `/`
- [x] Sign up page loads at `/signup`
- [x] API calls use correct base URL

### ✅ Database
- [x] MongoDB Atlas cluster created
- [x] Database user created with correct credentials
- [x] IP whitelist configured (0.0.0.0/0 for Netlify)
- [x] Connection string format verified: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

## Local Testing Checklist

Before deploying to Netlify, verify all these flows work locally:

### User Registration Flow
- [ ] Visit http://localhost:8080
- [ ] Click "Sign Up" / navigate to `/signup`
- [ ] Enter valid data:
  - Name: "Test Seller"
  - Email: "seller@test.com"
  - Phone: "+1234567890"
  - Password: "TestPassword123!"
  - Role: "I'm a Seller"
- [ ] Click "Create Account"
- [ ] Verify success message
- [ ] Check user created in MongoDB Atlas dashboard

### User Login Flow
- [ ] Visit http://localhost:8080
- [ ] Enter credentials:
  - Email: "seller@test.com"
  - Password: "TestPassword123!"
  - Role: "I'm a Seller"
- [ ] Click "Sign In"
- [ ] Verify redirect to `/industry` dashboard
- [ ] Check user session in browser localStorage

### Role Switching
- [ ] Test both "I'm a Seller" and "I'm a Buyer" roles
- [ ] Verify each role redirects to correct dashboard
- [ ] Verify error if wrong role is selected

### Error Handling
- [ ] Test invalid email format
- [ ] Test password too short
- [ ] Test non-matching password confirmation
- [ ] Test duplicate email registration
- [ ] Test invalid login credentials
- [ ] Verify error messages displayed correctly

### Google OAuth (Optional)
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in .env
- [ ] Test Google Sign-In button
- [ ] Verify OAuth flow completes
- [ ] Verify user data saved correctly

## Netlify Configuration

### Step 1: Connect Repository

```bash
# Link Netlify
netlify link

# Or connect via Netlify UI
# Go to netlify.com > New site > Connect to Git
```

### Step 2: Set Environment Variables in Netlify

**Via Netlify UI:**
1. Go to your site settings
2. **Build & Deploy** → **Environment**
3. Add environment variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://username:password@cluster.mongodb.net/echina?appName=Echina`

**Via Netlify CLI:**
```bash
netlify env:set MONGODB_URI "mongodb+srv://username:password@cluster.mongodb.net/echina?appName=Echina"
```

**Verify Environment Variables:**
```bash
netlify env:list
```

### Step 3: Verify Build Configuration

Your `netlify.toml` should have:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[functions]
  node_bundler = "esbuild"
  directory = "netlify/functions"
  external_node_modules = ["mongoose"]
```

## Build & Deploy

### Local Build Test

Before deploying, test the build locally:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build for production
npm run build

# Check output
ls -la dist/
ls -la functions/ || ls -la .netlify/functions/
```

### Deploy to Netlify

```bash
# Option 1: Using Netlify CLI
npm run build
netlify deploy --prod

# Option 2: Push to Git (if auto-deploy enabled)
git add .
git commit -m "Deploy with MongoDB authentication"
git push origin main
```

### Verify Deployment

After deployment, check:

1. **Build Status**
   - Go to Netlify dashboard
   - **Deploys** tab shows green checkmark
   - No build errors in logs

2. **Environment Variables**
   - Verify MONGODB_URI is set in **Build & Deploy** → **Environment**
   - Not visible in build logs (should be masked)

3. **Site Accessibility**
   - Visit your Netlify domain: `https://your-site.netlify.app/`
   - Frontend loads successfully
   - No CORS errors in browser console

## Post-Deployment Testing

### Test Authentication on Netlify

#### 1. Health Check
```bash
# Check backend connectivity
curl https://your-site.netlify.app/api/health

# Expected response:
# {
#   "status": "ok",
#   "message": "Backend server is running",
#   "database": "connected",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

#### 2. Registration Test
- [ ] Visit https://your-site.netlify.app/signup
- [ ] Create new user account
- [ ] Verify user appears in MongoDB Atlas
- [ ] Check user data is complete (email, name, phone, role)
- [ ] Check wallet was created for user

#### 3. Login Test
- [ ] Visit https://your-site.netlify.app/
- [ ] Log in with registered account
- [ ] Verify dashboard loads
- [ ] Check session token in browser localStorage
- [ ] Verify user ID is accessible

#### 4. Error Handling
- [ ] Test wrong password
- [ ] Test non-existent email
- [ ] Test duplicate registration
- [ ] Verify error messages display correctly

#### 5. Database Connectivity
- [ ] Check MongoDB Atlas metrics dashboard
- [ ] Verify connection count > 0
- [ ] Check for any connection errors in logs
- [ ] Monitor response times

#### 6. Function Logs
```bash
# View Netlify function logs
netlify logs functions

# Or check individual function:
netlify logs functions/auth-login
```

## Troubleshooting Deployment Issues

### Issue: "MONGODB_URI environment variable is not set"

**Solution:**
1. Verify environment variable is set in Netlify dashboard
2. Trigger a redeploy after setting environment variables
3. Check `netlify env:list` to confirm it's set
4. Clear build cache: **Deploys** → **Trigger deploy** → **Clear cache and redeploy**

### Issue: "MongoDB connection timeout"

**Possible causes:**
1. MongoDB Atlas IP whitelist not configured
   - Solution: Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0
2. Wrong connection string format
   - Verify: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?appName=Echina`
3. MongoDB cluster is paused
   - Solution: Resume cluster in MongoDB Atlas

### Issue: "CORS errors in browser console"

**Solution:**
1. Frontend is making requests to wrong API URL
2. Check Netlify domain in auth.ts API URL logic
3. Verify API base URL resolves to correct function
4. Check redirects in netlify.toml are correct

### Issue: "Functions timeout (>10 seconds)"

**Solutions:**
1. Optimize MongoDB queries
2. Add database indexes:
   ```javascript
   db.users.createIndex({ email: 1 })
   db.products.createIndex({ seller_id: 1 })
   ```
3. Implement connection pooling (already done in mongodb-connection.js)
4. Cache frequent queries

### Issue: "Netlify Functions not working"

**Debug steps:**
1. Check function logs: `netlify logs functions`
2. Verify function is deployed: Go to site → **Functions** tab
3. Test function directly:
   ```bash
   curl https://your-site.netlify.app/.netlify/functions/health
   ```
4. Check package.json has required dependencies

## Performance Optimization

### Database Optimization
1. Add indexes to frequently queried fields
2. Enable MongoDB Atlas monitoring
3. Use connection pooling (configured in code)
4. Implement caching for read-heavy operations

### Function Optimization
1. Keep functions under 5 seconds execution
2. Minimize database queries per request
3. Cache static data (products, categories)
4. Use timeouts to prevent hanging requests

### Frontend Optimization
1. Lazy load routes with React.lazy
2. Use code splitting for large bundles
3. Implement service workers for offline support
4. Optimize images with WebP/AVIF

## Security Checklist

- [ ] MongoDB password is strong (auto-generated from Atlas)
- [ ] Connection string not hardcoded in frontend
- [ ] Environment variables masked in build logs
- [ ] HTTPS enabled on Netlify domain
- [ ] CORS headers properly configured
- [ ] No sensitive data in error messages
- [ ] Session tokens properly secured
- [ ] Password hashing implemented (SHA256 + salt)
- [ ] Consider upgrade to bcrypt for production

## Monitoring & Maintenance

### Weekly Tasks
- [ ] Check Netlify function execution metrics
- [ ] Monitor MongoDB connection count
- [ ] Review error logs

### Monthly Tasks
- [ ] Check bundle size with `npm run build:analyze`
- [ ] Review database query performance
- [ ] Update dependencies: `npm outdated`
- [ ] Review security vulnerabilities: `npm audit`

### Quarterly Tasks
- [ ] Review and optimize database indexes
- [ ] Performance analysis with Lighthouse
- [ ] Cost review (MongoDB Atlas, Netlify)
- [ ] User feedback and feature requests

## Rollback Procedures

If something goes wrong after deployment:

### Quick Rollback
```bash
# Go to Netlify dashboard > Deploys
# Click on previous working deploy
# Click "Publish deploy"
```

### Full Rollback with Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Netlify auto-redeploys with new commit
```

## Success Criteria

Your deployment is successful when:

✅ Frontend loads without errors  
✅ Login/Register pages are accessible  
✅ Users can create accounts  
✅ Users can log in with credentials  
✅ MongoDB database stores user data  
✅ User sessions persist correctly  
✅ API health check returns "connected"  
✅ No CORS or network errors  
✅ Response time < 2 seconds  
✅ Function logs show no errors  

## Next Steps

After successful deployment:

1. **Set up monitoring**
   - Enable Netlify Analytics
   - Set up MongoDB Atlas alerts
   - Configure Sentry for error tracking

2. **Optimize performance**
   - Implement caching headers
   - Add database indexes
   - Enable CDN caching for static assets

3. **Enhance security**
   - Upgrade to bcrypt password hashing
   - Add rate limiting to auth functions
   - Implement 2FA for sensitive operations

4. **Add features**
   - Implement password reset via email
   - Add email verification
   - Implement Google OAuth properly
   - Add user profile management

## Support & Documentation

- **Netlify Docs**: https://docs.netlify.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **Function Debugging**: https://docs.netlify.com/functions/overview/#netlify-cli

## Questions?

Refer to:
- `MONGODB_NETLIFY_SETUP.md` - Detailed MongoDB setup
- `.env.example` - Environment variable template
- `netlify.toml` - Netlify configuration
- `netlify/functions/` - Function implementations
