# Deployment Guide - Frontend & Backend Separation

## Architecture Overview

This project now uses a separated architecture:
- **Frontend**: React + Vite (deploy to Netlify/Vercel)
- **Backend**: Express.js + MongoDB (deploy to Railway/Render/own server)
- **Database**: MongoDB Atlas (hosted)

## Local Development

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (already configured)
- Environment variables in `.env` file

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Ensure `VITE_API_URL=http://localhost:3001`
   - Ensure `MONGODB_URI` is set to your MongoDB connection string

3. **Run both frontend & backend**
   ```bash
   npm run dev:all
   ```
   This runs:
   - Vite frontend on `http://localhost:8080`
   - Express backend on `http://localhost:3001`

### Separate Commands

- **Frontend only**: `npm run dev`
- **Backend only**: `npm run dev:server`
- **Build frontend**: `npm run build`

## Production Deployment

### Backend Deployment (Choose one option)

#### Option 1: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Create new project → GitHub repo → Select this repo
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `PORT`: Railway will assign this (or use 3001)
4. Deploy automatically when you push to main

#### Option 2: Render
1. Go to [Render.com](https://render.com)
2. Create new Web Service → Connect GitHub
3. Select this repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables as above
7. Deploy

#### Option 3: Your Own Server
1. SSH into your server
2. Clone this repo
3. Install Node.js 20+
4. Run:
   ```bash
   npm install
   npm run build
   NODE_ENV=production node server.js
   ```
5. Set up reverse proxy (nginx/Apache) if needed

### Frontend Deployment (Netlify/Vercel)

#### On Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Click "New site from Git" → Select this repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://api.yourdomain.com`)
   - `VITE_GOOGLE_CLIENT_ID`: If using Google OAuth
6. Deploy

#### On Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import this project
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables (same as Netlify)
6. Deploy

## Environment Variables

### Frontend (Netlify/Vercel Dashboard)
```
VITE_API_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here (optional)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here (optional)
```

### Backend (Railway/Render/Your Server)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
NODE_ENV=production
PORT=3001
```

## Important Notes

✅ **All serverless functions removed** - No more `/netlify/functions`
✅ **Backend is now self-contained** - Use Express server for all API routes
✅ **Frontend is frontend-only** - All API calls go to backend URL
✅ **Environment-based configuration** - Uses `VITE_API_URL` to switch backends

## Testing After Deployment

1. Check frontend loads: `https://your-netlify-domain.com`
2. Test API health: `https://your-api-domain.com/api/health`
3. Try login/signup
4. Verify Google OAuth works (if configured)

## Troubleshooting

### "Cannot connect to backend"
- Check `VITE_API_URL` is set correctly in Netlify/Vercel
- Verify backend is running: `curl https://your-backend-domain.com/api/health`
- Check CORS headers in Express are allowing frontend domain

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas allows connections from your server IP
- Ensure database exists in MongoDB Atlas

### "CORS errors"
- Backend is configured with `cors()` middleware
- Ensure `origin: true` in server.js if you need custom origins

## API Endpoints

All endpoints are on your backend server:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/user/:id
GET    /api/health
```

## Deployment Checklist

- [ ] Backend deployed to Railway/Render/Your Server
- [ ] Backend URL added to frontend environment
- [ ] Frontend deployed to Netlify/Vercel
- [ ] Test login/signup works
- [ ] Test Google OAuth works
- [ ] Monitor backend logs
- [ ] Set up automatic deployments (CI/CD)

## Support

For issues:
1. Check backend logs: `railway logs` or server dashboard
2. Check frontend console: Browser DevTools
3. Verify environment variables are set correctly
4. Test API directly: `curl https://your-backend-domain.com/api/health`
