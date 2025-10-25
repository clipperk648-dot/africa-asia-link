# Netlify Deployment Setup Guide

## Prerequisites

1. Neon PostgreSQL database connection string
2. Netlify account and CLI installed (`npm install -g netlify-cli`)
3. Node.js 18+ and npm

## Environment Variables

Before deploying to Netlify, set up the following environment variables:

### In Netlify Dashboard:

1. Go to your Netlify site settings
2. Navigate to **Build & Deploy** → **Environment**
3. Add the following environment variable:

```
DATABASE_URL = postgresql://neondb_owner:npg_7molOKHjIg1a@ep-bold-sea-adkxpuli-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Or via Netlify CLI:

```bash
netlify env:set DATABASE_URL "postgresql://neondb_owner:..."
```

## Database Setup

The app uses Neon PostgreSQL with the following tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(12, 2),
  company VARCHAR(255),
  location VARCHAR(255),
  image TEXT,
  description TEXT,
  seller_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Social Posts Table
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Deployment Steps

### 1. Link your repository to Netlify

```bash
netlify link
```

### 2. Deploy to Netlify

```bash
npm run build
netlify deploy --prod
```

Or simply push to your Git repository if you have Netlify connected to your Git provider.

### 3. Test the deployment

Visit your Netlify domain and verify:
- ✅ Frontend loads correctly
- ✅ Products are fetched (from database or mock data)
- ✅ API endpoints respond at `/.netlify/functions/*`

## Troubleshooting

### Database Connection Issues

If you see "using mock data" messages in console:

1. Check that `DATABASE_URL` environment variable is set in Netlify
2. Verify the connection string is correct
3. Check that Neon database is accessible from Netlify region
4. Review Netlify function logs: `netlify logs functions`

### Build Errors

If the build fails:

1. Check that all dependencies are installed: `npm install`
2. Verify TypeScript compilation: `npm run build`
3. Check `netlify build` output for specific errors

### Function Timeout

If Netlify Functions timeout (>10 seconds):

1. Optimize database queries
2. Add indexes to frequently queried columns
3. Consider caching strategies

## Local Development

### Using Netlify Functions Locally

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start dev server with functions
netlify dev
```

This will run both the frontend (Vite) and backend functions locally.

### Environment Variables for Local Development

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:8888/.netlify/functions
DATABASE_URL=postgresql://...
```

## Performance Optimization

The app includes:
- ✅ Code splitting (lazy loaded routes)
- ✅ Image optimization
- ✅ CSS-in-JS with Tailwind
- ✅ API caching headers set in functions
- ✅ Netlify edge caching

For further optimization:
1. Enable Netlify Image CDN for product images
2. Configure Netlify Analytics for performance monitoring
3. Set up Web Vitals monitoring

## Support

For issues with:
- **Neon database**: https://neon.tech/docs
- **Netlify deployment**: https://docs.netlify.com
- **Netlify Functions**: https://docs.netlify.com/functions/overview
