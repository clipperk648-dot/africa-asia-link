# Neon DB Setup Guide for Echina

## Overview
This guide walks you through connecting your Echina application to Neon DB (PostgreSQL) for real authentication and data storage.

## Steps to Connect Neon DB

### Step 1: Connect to Neon MCP
1. Click [Open MCP popover](#open-mcp-popover) in the Builder.io interface
2. Find and select **Neon** from the available integrations
3. Follow the authentication steps to connect your Neon account

### Step 2: Get Your Connection String
Once connected to Neon:
1. Go to your Neon project dashboard
2. Navigate to "Connection string" or similar section
3. Copy your connection string (should look like: `postgresql://user:password@host/database`)

### Step 3: Set Environment Variables
The system will automatically set up the following environment variables from your Neon connection:
- `VITE_DATABASE_URL`: Your Neon PostgreSQL connection string
- `VITE_NEON_API_KEY`: Your Neon API key (if applicable)
- `VITE_NEON_API_URL`: Neon API base URL

### Step 4: Initialize Your Database
Once your environment variables are set:

1. **Copy the SQL schema** from `docs/DATABASE_SCHEMA.sql`
2. **Run it in your Neon database** using the Neon console SQL editor
3. This will create all necessary tables with proper relationships

### Step 5: Verify Connection
The app will automatically:
- Check if the database is configured
- Fall back to mock data if no connection is available
- Switch to real authentication when database is connected

## Database Schema Overview

The schema includes the following tables:
- **users**: User accounts with authentication details
- **products**: Product listings from sellers
- **orders**: Purchase orders between buyers and sellers
- **social_posts**: Social feed content
- **comments**: Comments on posts
- **messages**: Direct messages between users
- **cart**: Shopping cart for each user
- **wallet**: User wallets/balances
- **transactions**: Transaction history

## Environment Variables Required

```
VITE_DATABASE_URL=postgresql://user:password@host/database
VITE_NEON_API_KEY=your_neon_api_key
VITE_NEON_API_URL=https://console.neon.tech/api/v1
```

## Fallback Behavior

If Neon is not connected:
- The app uses **mock authentication** for login/signup
- Mock data is used for products, orders, and social posts
- Users can still test the full functionality locally

Once Neon is connected:
- All data is stored in real PostgreSQL database
- User authentication is validated against Neon
- All mock data is replaced with real database queries

## Testing the Connection

1. Sign up with a new account
2. Check your Neon database - new user should appear in `users` table
3. Login with the same credentials
4. Create/browse products - they should be saved to the database

## Troubleshooting

### "Database not configured" warning
- Make sure you've connected Neon via MCP popover
- Verify environment variables are set correctly
- Check database connection string is valid

### Query errors
- Ensure all tables from `DATABASE_SCHEMA.sql` are created
- Check user has proper permissions on the database
- Verify connection string format is correct

### Performance issues
- Check that indexes were created (see schema file)
- Monitor Neon dashboard for query performance
- Consider adding more indexes for frequently queried fields

## Security Notes

⚠️ **Important**: The current password hashing is basic (using btoa). For production:
1. Use a proper hashing library like `bcryptjs`
2. Never log passwords or connection strings
3. Use environment variables for all secrets
4. Implement rate limiting on auth endpoints
5. Add HTTPS everywhere

## Next Steps

After setting up Neon:
1. All pages automatically use real data from the database
2. User authentication is fully functional
3. Mock data is completely replaced
4. You can manage your data in the Neon console

## Questions?

Refer to Neon documentation: https://neon.tech/docs
