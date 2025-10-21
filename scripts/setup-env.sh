#!/bin/bash
# Quick setup script for .env file in development

cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://parel:parel@localhost:5432/parel"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="parel-dev-secret-change-in-production"

# Email (for transactional emails)
APP_MAIL_FROM="noreply@parel.local"

# Security & Authentication
NEXT_PUBLIC_ALLOW_DEMO_LOGIN="true"

# Development Features
NEXT_PUBLIC_DEV_UNLOCK="true"

# Admin configuration
ADMIN_EMAILS="admin@example.com"

# Error logging configuration
NEXT_PUBLIC_VERBOSE_ERRORS="true"

# OAuth Providers
NEXT_PUBLIC_EMAIL_ENABLED="true"
NEXT_PUBLIC_GOOGLE_ENABLED="false"
NEXT_PUBLIC_FACEBOOK_ENABLED="false"
NEXT_PUBLIC_TWITTER_ENABLED="false"
NEXT_PUBLIC_REDDIT_ENABLED="false"

# Question Generator Configuration
NEXT_PUBLIC_GEN_MAX_CONCURRENCY=2
NEXT_PUBLIC_Q_PER_CAT_MIN=5
NEXT_PUBLIC_Q_PER_CAT_MAX=12
NEXT_PUBLIC_GEN_LANGS=en
NEXT_PUBLIC_GEN_DRY_RUN=false
NEXT_PUBLIC_GEN_BATCH_SIZE=50
NEXT_PUBLIC_GEN_MAX_RETRIES=3
NEXT_PUBLIC_GEN_RETRY_DELAY=1000

# Shop configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SHOP_CURRENCY="EUR"
FUNDS_TO_DIAMONDS_RATE=0.1
DIAMONDS_TO_FUNDS_RATE=10
DEFAULT_TENANT_ID="dev-tenant"
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔑 Login credentials:"
echo "   Admin: admin@example.com / 1AmTheArchitect"
echo "   Demo:  demo@example.com / demo"
echo ""
echo "💾 Database: postgresql://localhost:5432/parel"
echo "🔧 Next step: pnpm --filter @parel/db prisma generate"









