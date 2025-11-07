#!/bin/bash
# Staging Build Configuration Script
# PareL v0.13.2j

echo "🧪 Setting up PareL Staging Build v0.13.2j"

# Set staging environment variables
export NEXT_PUBLIC_ENV=staging
export NEXT_PUBLIC_SENTRY_DSN=""
export SENTRY_DSN=""
export ENABLE_METRICS=0
export DEBUG_API=true

echo "✅ Staging environment configured"
echo "📦 Building for Vercel staging deployment..."

# Build with staging configuration
npm run build

echo "🚀 Deploying to Vercel staging..."
vercel --prod --confirm --build-env NEXT_PUBLIC_ENV=staging

echo "✅ Staging deployment complete!"
echo "🔗 Check your Vercel dashboard for the staging URL"
