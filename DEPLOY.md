# Railway Deployment Guide

## Prerequisites
- Railway CLI installed (`npm i -g @railway/cli`)
- GitHub account connected to Railway

## Step-by-Step Deployment

### 1. Login to Railway
```bash
railway login
```

### 2. Navigate to project root
```bash
cd Campus-Marketplace-main
```

### 3. Link or create project
```bash
# If project exists on Railway:
railway link

# If creating new:
railway init campus-marketplace
```

### 4. Add PostgreSQL database
```bash
railway add --database postgresql
```

### 5. Set environment variables
```bash
railway variables set JWT_SECRET="cm-deployed-jwt-secret-2026-campus-marketplace-production-key-256bits"
railway variables set FRONTEND_URL="https://campus-marketplace.up.railway.app"
```

### 6. Deploy the backend
```bash
railway up
```

### 7. Add a public domain
```bash
railway domain
```

### 8. Get your backend URL
```bash
railway variables get RAILWAY_PUBLIC_DOMAIN
```

The URL will look like: `campus-marketplace-production-xxxx.up.railway.app`

### 9. Set the real FRONTEND_URL
Once your frontend is deployed, update:
```bash
railway variables set FRONTEND_URL="https://your-frontend-domain.vercel.app"
```

### 10. Link to GitHub repo (for auto-deploy)
```bash
railway service connect github
```
Select `Alvin11David/Campus-Marketplace` repo.

## After Deployment

### Update frontend API URL
In your frontend `.env`:
```
VITE_API_ORIGIN=https://campus-marketplace-production-xxxx.up.railway.app
```

### Check logs
```bash
railway logs
```

### Check status
```bash
railway status
```

## Database
Railway automatically provides these PostgreSQL env vars:
- `DATABASE_URL` (full connection string)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

The app reads `DATABASE_URL` directly - no manual config needed.
