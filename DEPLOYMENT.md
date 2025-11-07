# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 20.10.0+
- PostgreSQL database
- Redis (optional, for caching)
- Vercel account (for web deployment)

## 📱 Multi-Platform Support

PareL supports deployment across multiple platforms:

### 🌐 Web (Vercel)
- **Primary platform** - Full PWA support
- Service worker with intelligent caching
- Offline functionality
- Mobile-optimized layouts

### 📱 Mobile (Android/iOS)
- React Native builds via Expo
- Native app store distribution
- Push notifications
- Offline sync capabilities

### 🖥️ Desktop (Electron)
- Cross-platform desktop apps
- Native OS integration
- Auto-updater support

## 🔧 Environment Variables

### Required
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### Optional
```bash
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...
```

## 🚀 Deployment Steps

### 1. Vercel (Web)
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

### 2. Mobile Build
```bash
# Android
pnpm build:android

# iOS (macOS only)
pnpm build:ios
```

### 3. Desktop Build
```bash
# All platforms
pnpm build:desktop
```

## ✅ Verified Working Endpoints
- `/api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/flow/*` - Question flows
- `/api/profile/*` - User profiles
- `/api/shop/*` - Marketplace
- `/api/telemetry/*` - Analytics
- ✅ `apps/web/.env.example` - Template for production variables

### Build Status

- ✅ **Clean Build**: `pnpm run build:web` completes successfully
- ✅ **Environment Variables**: Loading correctly from `.env.local`
- ✅ **Prisma Schema**: In sync with database
- ✅ **Edge Runtime**: Fixed crypto module compatibility
- ✅ **All Routes**: Working correctly

### Next Steps

1. Connect your GitHub repository to Vercel
2. Set up production database (PostgreSQL)
3. Set up production Redis instance
4. Configure environment variables in Vercel dashboard
5. Deploy using `vercel --prod`

The app is ready for production deployment! 🎉

