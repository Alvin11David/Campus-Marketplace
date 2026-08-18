@echo off
echo ======================================
echo   Campus Marketplace - Railway Deploy
echo ======================================
echo.

REM Step 1: Login to Railway
echo [1/7] Logging in to Railway...
railway login
if %errorlevel% neq 0 (
    echo ERROR: Failed to login to Railway
    exit /b 1
)

REM Step 2: Create new project
echo.
echo [2/7] Creating Railway project...
railway init campus-marketplace
if %errorlevel% neq 0 (
    echo ERROR: Failed to create project. It may already exist.
    echo If it exists, run: railway link
    exit /b 1
)

REM Step 3: Add PostgreSQL database
echo.
echo [3/7] Adding PostgreSQL database...
railway add --database postgresql
if %errorlevel% neq 0 (
    echo ERROR: Failed to add PostgreSQL
    exit /b 1
)

REM Step 4: Set environment variables
echo.
echo [4/7] Setting environment variables...
railway variables set JWT_SECRET="cm-deployed-jwt-secret-2026-campus-marketplace-production-key-256bits"
railway variables set FRONTEND_URL="https://campus-marketplace.up.railway.app"
railway variables set MAIL_USERNAME="waluube69alvin@gmail.com"
railway variables set MAIL_PASSWORD="wgxqehwaialddjal"

REM Step 5: Generate a random JWT secret in production
echo.
echo [5/7] Setting production profile...
railway variables set SPRING_PROFILES_ACTIVE=""

REM Step 6: Deploy
echo.
echo [6/7] Deploying backend...
railway up --service campus-marketplace
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    exit /b 1
)

REM Step 7: Print the URL
echo.
echo [7/7] Getting deployment URL...
railway domain

echo.
echo ======================================
echo   Deployment Complete!
echo ======================================
echo.
echo Your backend is now live!
echo.
echo Railway Dashboard: https://railway.app/dashboard
echo.
echo Next steps:
echo   1. Check deployment logs: railway logs
echo   2. Get your backend URL: railway domain
echo   3. Set FRONTEND_URL to your actual frontend URL
echo   4. Update frontend VITE_API_ORIGIN to your backend URL
echo.
