# Database Setup Guide for Echina Authentication

This application requires MongoDB for authentication and data storage. Follow these steps to set up your database.

## Quick Start

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a free MongoDB Atlas account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Create a database user**
   - In Atlas, go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password
   - Keep the password safe

3. **Get your connection string**
   - In Atlas, go to "Databases" → your cluster
   - Click "Connect"
   - Choose "Drivers" → "Node.js"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `echina` (or your preferred database name)
   - Example: `mongodb+srv://user:password@cluster.mongodb.net/echina`

4. **Set environment variable locally**
   - Create a `.env` file in your project root
   - Add: `MONGODB_URI=your_connection_string_here`
   - Example:
     ```
     MONGODB_URI=mongodb+srv://myuser:mypassword@echina.abc123.mongodb.net/echina
     ```

5. **Set environment variable in Netlify (for production)**
   - Go to your Netlify dashboard
   - Navigate to Site Settings → Build & Deploy → Environment
   - Add a new environment variable:
     - Key: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string
   - Save and redeploy

## Verification

### Check if MongoDB is configured

1. **Locally**: Run the dev server with both frontend and backend
   ```bash
   npm run dev:all
   ```
   
2. **Check the health endpoint**
   - Open http://localhost:3001/api/health
   - You should see:
     ```json
     {
       "status": "ok",
       "message": "Backend server is running"
     }
     ```

3. **On Netlify**: Visit your site's health endpoint
   - Go to `https://your-netlify-site.netlify.app/.netlify/functions/health`
   - You should see a successful response with `"status": "ok"`

## Troubleshooting

### "MONGODB_URI environment variable is not set"

**Solution**: 
- Local development: Create `.env` file with `MONGODB_URI=...`
- Netlify production: Set environment variable in Netlify Dashboard

### "MongoDB connection failed"

**Possible causes**:
1. Connection string is incorrect
   - Check username and password are correct
   - Verify database name in the connection string
   
2. IP whitelist issue
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or allow all IPs (less secure)
   - For Netlify, you may need to add Netlify's IP range

3. Network connectivity
   - Ensure your machine/Netlify can reach MongoDB servers
   - Check firewall settings

### "Email already registered" when trying to sign up

**Solution**: This is normal - it means authentication is working! Try signing up with a different email.

## MongoDB Collections Created

When you first run authentication operations, these collections will be automatically created:

1. **users** - Stores user accounts with email, password hash, name, role, etc.
2. **wallets** - Stores wallet balances per user
3. **products** - Stores product listings
4. **orders** - Stores orders between buyers and sellers
5. **socialposts** - Stores social feed posts
6. **clans** - Stores collaborative buying groups
7. **messages** - Stores user-to-user messages
8. **transactions** - Stores transaction history

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use strong passwords** - For MongoDB user accounts
3. **Enable IP whitelisting** - In MongoDB Atlas for production
4. **Use environment variables** - Never hardcode credentials
5. **Rotate credentials regularly** - Change passwords periodically

## Next Steps

Once MongoDB is configured:

1. **Test locally**: `npm run dev:all` and try registering a new account
2. **Test on Netlify**: Set the `MONGODB_URI` environment variable and redeploy
3. **Verify authentication**: Try logging in on the deployed site

## Support

For issues with:
- **MongoDB**: https://docs.mongodb.com/
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Netlify**: https://docs.netlify.com/
- **This app**: Check other documentation files in `/docs/`
