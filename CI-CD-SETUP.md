# CI/CD Setup Instructions for GitHub Actions + Vercel

## Required GitHub Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

### 1. Get Vercel Token
```bash
# Generate a Vercel token
vercel login
# Go to https://vercel.com/account/tokens and create a new token
```

### 2. Get Project Information
```bash
# Get your project ID and org ID
vercel project inspect iot-management
```

### 3. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | `your_vercel_token` | Token from Vercel dashboard |
| `VERCEL_ORG_ID` | `chirags-projects-3930bcc0` | Organization ID from Vercel |
| `VERCEL_PROJECT_ID` | `prj_MQkAdRHrR2UPax4mGALDkMG3fdjc` | Project ID from Vercel |

## Environment Variables in Vercel

These are already configured in Vercel for the project:

- ✅ `MONGO_URI` - MongoDB Atlas connection string
- ✅ `NODE_ENV` - Set to "production"
- ⚠️ `JWT_SECRET` - **NEEDS TO BE ADDED**

### Add JWT_SECRET to Vercel:

```bash
# Option 1: Via CLI
vercel env add JWT_SECRET

# Option 2: Via Dashboard
# Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables
```

## Current Deployment URLs

- **Production**: https://iot-management.vercel.app
- **Latest Deploy**: https://iot-management-3hxofb6pl-chirags-projects-3930bcc0.vercel.app

## CI/CD Workflow

The `.github/workflows/deploy.yml` file includes:

1. **Build & Test Job**:
   - Install dependencies
   - Run linting (if configured)
   - Run tests (if configured)
   - Validate environment

2. **Deploy Job**:
   - **Preview deployments** for Pull Requests
   - **Production deployments** for main branch pushes
   - Deployment status notifications

## Manual Deployment

If you need to deploy manually:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Common Issues:

1. **Secrets not working**: Make sure all GitHub secrets are added correctly
2. **Build failures**: Check the Node.js version in workflow matches package.json engines
3. **Environment variables**: Ensure all required env vars are set in Vercel dashboard

### Debug Commands:

```bash
# Check project status
vercel project ls

# Check deployments
vercel deployments

# Check environment variables
vercel env ls
```
