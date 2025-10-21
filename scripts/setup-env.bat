@echo off
REM Quick setup script for .env file in development (Windows)

echo Creating .env file...

(
echo # Database
echo DATABASE_URL="postgresql://parel:parel@localhost:5432/parel"
echo.
echo # Redis
echo REDIS_URL="redis://localhost:6379"
echo.
echo # NextAuth
echo NEXTAUTH_URL="http://localhost:3000"
echo NEXTAUTH_SECRET="parel-dev-secret-change-in-production"
echo.
echo # Email ^(for transactional emails^)
echo APP_MAIL_FROM="noreply@parel.local"
echo.
echo # Security ^& Authentication
echo NEXT_PUBLIC_ALLOW_DEMO_LOGIN="true"
echo.
echo # Development Features
echo NEXT_PUBLIC_DEV_UNLOCK="true"
echo.
echo # Admin configuration
echo ADMIN_EMAILS="admin@example.com"
echo.
echo # Error logging configuration
echo NEXT_PUBLIC_VERBOSE_ERRORS="true"
echo.
echo # OAuth Providers
echo NEXT_PUBLIC_EMAIL_ENABLED="true"
echo NEXT_PUBLIC_GOOGLE_ENABLED="false"
echo NEXT_PUBLIC_FACEBOOK_ENABLED="false"
echo NEXT_PUBLIC_TWITTER_ENABLED="false"
echo NEXT_PUBLIC_REDDIT_ENABLED="false"
echo.
echo # Question Generator Configuration
echo NEXT_PUBLIC_GEN_MAX_CONCURRENCY=2
echo NEXT_PUBLIC_Q_PER_CAT_MIN=5
echo NEXT_PUBLIC_Q_PER_CAT_MAX=12
echo NEXT_PUBLIC_GEN_LANGS=en
echo NEXT_PUBLIC_GEN_DRY_RUN=false
echo NEXT_PUBLIC_GEN_BATCH_SIZE=50
echo NEXT_PUBLIC_GEN_MAX_RETRIES=3
echo NEXT_PUBLIC_GEN_RETRY_DELAY=1000
echo.
echo # Shop configuration
echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
echo SHOP_CURRENCY="EUR"
echo FUNDS_TO_DIAMONDS_RATE=0.1
echo DIAMONDS_TO_FUNDS_RATE=10
echo DEFAULT_TENANT_ID="dev-tenant"
) > .env

echo.
echo ===================================
echo ✅ .env file created successfully!
echo ===================================
echo.
echo 🔑 Login credentials:
echo    Admin: admin@example.com / 1AmTheArchitect
echo    Demo:  demo@example.com / demo
echo.
echo 💾 Database: postgresql://localhost:5432/parel
echo 🔧 Next step: pnpm --filter @parel/db prisma generate
echo.









