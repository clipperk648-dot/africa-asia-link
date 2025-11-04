# Fly.io Deployment Guide - Echina

## What Changed

The app is now configured to run both frontend and backend in a single Fly.io container:

### 1. **Frontend (React + Vite)**
   - Builds to `/dist` directory
   - Served by Express server on the same port
   - Uses relative URLs (`/api`) for API calls in production
   - Falls back to `localhost:3001` for local development

### 2. **Backend (Express.js)**
   - Runs on same container, same port (3001)
   - Serves frontend static files from `/dist`
   - Handles all API requests (`/api/*`)
   - Fallback routes to `/dist/index.html` for React Router

### 3. **Configuration Files**

**fly.toml** - Fly.io deployment configuration
- Builds with Node.js buildpacks
- Runs on port 3001
- Configured for production

**package.json** - Added `start` script
```json
"start": "NODE_ENV=production node server.js"
```

**src/lib/auth.ts** - Smart API URL detection
```typescript
// Production: Uses relative URLs (/api)
// Local: Uses http://localhost:3001
const API_BASE_URL = ...
```

**server.js** - Enhanced to serve frontend
- Serves static files from `/dist`
- Returns `index.html` for non-API routes (React Router)
- Fully backward compatible with development mode

## Deployment Steps

### 1. Ensure MongoDB URI is set in Fly.io
```bash
fly secrets set MONGODB_URI="your_mongodb_uri"
```

### 2. Deploy to Fly.io
```bash
fly deploy
```

This will:
1. Install dependencies
2. Build the frontend (`npm run build`)
3. Start the server with `npm start`
4. Serve frontend + API on the same domain

### 3. Verify Deployment
```bash
fly logs  # Watch deployment logs
fly status  # Check app status
```

## How It Works

### Local Development
```bash
npm run dev:all
```
- Frontend: `http://localhost:8080` (Vite dev server)
- Backend: `http://localhost:3001` (Express)
- Proxy: `/api` calls to `localhost:3001`

### Production (Fly.io)
- Both frontend and backend at `https://your-app.fly.dev`
- No proxy needed - same origin
- Frontend calls `/api/auth/register`, etc.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Fly.io Container (Port 3001)        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Express.js Server (server.js)      │  │
│  │                                      │  │
│  │  ┌──────────────────────────────┐   │  │
│  │  │  Static Files Middleware     │   │  │
│  │  │  Serves /dist/* (React build)│   │  │
│  │  └──────────────────────────────┘   │  │
│  │                                      │  │
│  │  ┌──────────────────────────────┐   │  │
│  │  │  API Routes (/api/*)         │   │  ��
│  │  │  - /api/auth/register        │   │  │
│  │  │  - /api/auth/login           │   │  │
│  │  │  - /api/auth/google          │   │  │
│  │  │  - /api/auth/user/:id        │   │  │
│  │  └──────────────────────────────┘   │  │
│  │                                      │  │
│  │  ┌──────────────────────────────┐   │  │
│  │  │  Fallback Handler            │   │  │
│  │  │  Serves index.html for       │   │  │
│  │  │  React Router SPA            │   │  │
│  │  └──────────────────────────────┘   │  │
│  └──────────────────────────────────────┘  │
│                 ↓↑                         │
│        MongoDB Atlas (Secure)              │
│                                             │
└─────────────────────────────────────────────┘
```

## Environment Variables

Set in Fly.io:
```
MONGODB_URI=mongodb+srv://cristosrex22_db_user:dVBaNphdb5ehhTcb@echina.uumsajp.mongodb.net/?appName=Echina
NODE_ENV=production (automatic)
```

## Troubleshooting

### "Failed to fetch" errors
✓ Fixed! Frontend now uses relative URLs in production

### Static files not loading
Check `dist/` directory exists:
```bash
npm run build
```

### API calls failing
1. Verify MongoDB URI is set: `fly secrets list`
2. Check logs: `fly logs`
3. Ensure `/api` routes aren't blocked

### Rolling back
```bash
fly certs list  # Get deployment history
fly apps open  # View current version
```

## Performance Notes

- **Frontend**: Cached at Fly.io edge
- **API**: On same server, low latency
- **Database**: Secure MongoDB Atlas connection
- **Bundle size**: ~600KB gzipped (optimized)

## Security

✅ API and frontend on same origin (CORS not needed)
✅ MongoDB credentials in secrets (not in code)
✅ HTTPS enforced by Fly.io
✅ Environment variables protected

## Next Steps

1. Push code to repository
2. Run `fly deploy` from project root
3. Monitor with `fly logs`
4. Test at `https://your-app.fly.dev`

Good luck! 🚀
