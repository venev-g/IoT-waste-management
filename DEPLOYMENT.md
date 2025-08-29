# 🚀 Deployment Guide for IoT Waste Management

## Quick Start Deployment

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)

### 2. Repository Setup
```bash
# If not already done, commit and push your code
git add .
git commit -m "Prepare for Vercel deployment with CI/CD"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Automatic (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `IoT-waste-management`
4. Configure settings:
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `website/frontend`

#### Option B: Manual with CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /workspaces/IoT-waste-management
vercel

# For production deployment
vercel --prod
```

### 4. Environment Variables Setup

In Vercel Dashboard, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster.mongodb.net/iot_waste_management?retryWrites=true&w=majority` | ✅ |
| `JWT_SECRET` | `your-super-secure-jwt-secret-minimum-32-characters` | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `5000` | ❌ |

### 5. GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add these secrets:

| Secret | Description | How to Get |
|--------|-------------|-----------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Settings → Tokens](https://vercel.com/account/tokens) |
| `ORG_ID` | Vercel team/user ID | Vercel Dashboard → Settings → General |
| `PROJECT_ID` | Vercel project ID | Project Settings → General |

### 6. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**:
   - Username: Choose a username
   - Password: Generate a secure password
4. **Network Access**: Add `0.0.0.0/0` for all IPs (production should be more restrictive)
5. **Get Connection String**: Database → Connect → Connect your application
6. **Update Connection String**: Replace `<password>` with your user password

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/iot_waste_management?retryWrites=true&w=majority
```

## 🎯 Testing Your Deployment

### 1. Check Health Endpoint
```bash
curl https://your-app.vercel.app/health
```

### 2. Test API Endpoints
```bash
# Add sensor data
curl -X POST https://your-app.vercel.app/api/sensors/add \
  -H "Content-Type: application/json" \
  -d '{
    "binLocation": "Test Bin",
    "fillLevel": 50,
    "flameDetected": false
  }'

# Get sensor data
curl https://your-app.vercel.app/api/sensors/all
```

### 3. Test Frontend
- Visit `https://your-app.vercel.app`
- Try registering a new user
- Test login functionality
- Check sensor data display

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
- ✅ Check MongoDB Atlas IP whitelist
- ✅ Verify connection string format
- ✅ Ensure database user has correct permissions

#### 2. Environment Variables Not Found
- ✅ Verify all required env vars are set in Vercel
- ✅ Check variable names match exactly
- ✅ Redeploy after adding env vars

#### 3. API Endpoints Not Working
- ✅ Check Vercel function logs
- ✅ Verify `vercel.json` routing configuration
- ✅ Test API endpoints directly

#### 4. Frontend Not Loading
- ✅ Check browser console for errors
- ✅ Verify API URL configuration in frontend
- ✅ Check CORS settings

### Debug Commands
```bash
# Check Vercel deployment logs
vercel logs

# Test local build
npm run build

# Test local deployment
vercel dev
```

## 🚀 CI/CD Pipeline

Your deployment includes automatic CI/CD that:

1. **Triggers on**: Push to main branch or pull requests
2. **Runs tests**: If you add tests to your project
3. **Builds**: Installs dependencies and builds the project
4. **Deploys**: Automatically deploys to Vercel
5. **Preview**: Creates preview deployments for pull requests

### GitHub Actions Workflow
- Located in: `.github/workflows/deploy.yml`
- Runs on: Ubuntu latest with Node.js 18
- Steps: Checkout → Setup Node → Install deps → Test → Deploy

## 📊 Monitoring Your App

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Monitor page views, performance, and errors

### Uptime Monitoring
- Use services like UptimeRobot for monitoring
- Monitor both frontend and API endpoints

### MongoDB Monitoring
- MongoDB Atlas provides built-in monitoring
- Check database performance and queries

## 🔒 Security Best Practices

### Production Security
- ✅ Use strong JWT secrets (minimum 32 characters)
- ✅ Restrict MongoDB IP access
- ✅ Enable HTTPS only
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use environment variables for secrets

### Environment Security
- ✅ Never commit `.env` files
- ✅ Use different secrets for different environments
- ✅ Regularly rotate API keys and passwords
- ✅ Monitor for security vulnerabilities

## 🎉 You're Done!

Your IoT Waste Management system is now deployed with:
- ✅ Automatic deployments from GitHub
- ✅ Scalable serverless architecture
- ✅ Global CDN delivery
- ✅ SSL/HTTPS encryption
- ✅ MongoDB Atlas integration
- ✅ Real-time monitoring

**Next Steps:**
1. Add custom domain (optional)
2. Set up monitoring and alerts
3. Add more tests
4. Implement additional features
5. Scale as needed

Happy coding! 🚀
