# Netlify Migration Guide

This document outlines the migration from Fly.io to Netlify deployment and the configuration required for authentication and other services.

## Overview

The application has been migrated from Fly.io to Netlify. All authentication endpoints now use Netlify Functions instead of the Express server.

## Deployment Changes

### Previous Setup (Fly.io)
- Express server running on port 3001
- All API endpoints handled by `server.js`
- Configuration in `fly.toml` (now deprecated)

### New Setup (Netlify)
- Netlify Functions for all backend operations
- Authentication functions in `netlify/functions/`
- Configuration in `netlify.toml`

## Required Environment Variables

Set these environment variables in your Netlify Dashboard (Site settings → Environment variables):

### MongoDB Connection (Required)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/echina
```
- Used for user authentication, products, orders, wallets, and other data
- Obtain from MongoDB Atlas: https://cloud.mongodb.com

### API Configuration (Optional)
```
VITE_API_URL=/.netlify/functions
```
- Default is `/.netlify/functions` (Netlify Functions endpoint)
- Only needed if using a custom API URL in development

### Stripe Configuration (For Payments)
```
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```
- For payment processing and wallet features
- Obtain from Stripe Dashboard: https://dashboard.stripe.com

### SendGrid Configuration (For Emails)
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```
- For email notifications (optional)
- Obtain from SendGrid: https://sendgrid.com/

### Analytics (Optional)
```
VITE_ENABLE_ANALYTICS=true
```
- Enable/disable analytics tracking

## Netlify Functions Overview

### Authentication Functions

1. **register-user** (`/.netlify/functions/register-user`)
   - POST request
   - Body: `{ email, password, name, phone, role }`
   - Returns: `{ success, user, token, error }`

2. **login** (`/.netlify/functions/login`)
   - POST request
   - Body: `{ email, password, role }`
   - Returns: `{ success, user, token, error }`

3. **google-oauth** (`/.netlify/functions/google-oauth`)
   - POST request
   - Body: `{ token, role }`
   - Returns: `{ success, user, token, error }`

4. **get-auth-user** (`/.netlify/functions/get-auth-user`)
   - GET request
   - Query params: `?id=USER_ID`
   - Returns: `{ success, user, error }`

## Authentication Flow

1. User signs up with email/password or Google OAuth
2. Client calls Netlify Function (`register-user` or `login`)
3. Function validates input and checks MongoDB
4. On success, returns user object and JWT token
5. Client stores user session in localStorage
6. Token is used for subsequent authenticated requests

## Session Management

- Sessions are stored in localStorage with keys:
  - `echina_session`: Session metadata
  - `echina_user`: User data
- Session expires after 24 hours
- Manual logout clears localStorage

## Development Setup

### Local Development with Netlify Functions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_uri
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Netlify Functions are available at `/.netlify/functions/` during development if using Netlify CLI

### Using Express Server (Legacy)

For local development with the Express backend:
```bash
npm run dev:server  # Starts Express on port 3001
npm run dev        # Starts Vite dev server
# or
npm run dev:all    # Runs both concurrently
```

Update `VITE_API_URL` to `http://localhost:3001` for development.

## Deployment to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in Netlify Dashboard:
   - MONGODB_URI
   - STRIPE_PUBLIC_KEY (if needed)
   - SENDGRID_API_KEY (if needed)
5. Deploy - Netlify will automatically build and deploy on push to main

## Sign-Up Flow Validation

The sign-up form includes:
- **Email validation**: Must be valid email format
- **Password validation**: Minimum 8 characters
- **Phone validation**: Minimum 10 digits, proper format
- **Role selection**: Must select either "industry" (Seller) or "buyer" (Buyer)
- **Password confirmation**: Passwords must match

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Email exists in MongoDB | Use different email or login instead |
| "Invalid credentials" | Wrong email/password combination | Check email and password |
| "This account is registered as a..." | Role mismatch | Select the correct role at login |
| "Missing required fields" | Form data incomplete | Ensure all fields are filled |
| Database error | MongoDB connection issue | Check MONGODB_URI environment variable |

## API Endpoint Structure

All endpoints follow this pattern:
```
POST /.netlify/functions/{function-name}
GET /.netlify/functions/{function-name}?param=value
```

## Netlify-Specific Configuration

See `netlify.toml` for:
- Build settings
- Function configuration
- Redirect rules
- Cache headers
- Security headers

## Migration from Fly.io

To fully remove Fly.io:
1. Delete Fly.io app: `flyctl apps destroy echina`
2. Update domain DNS to point to Netlify
3. Remove `fly.toml` (currently marked as deprecated)

## References

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/)
- [Stripe Documentation](https://stripe.com/docs)
