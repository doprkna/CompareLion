#!/bin/bash

###############################################################################
# PareL Beta Deployment Script
# v0.13.2k - Beta Launch
#
# This script deploys PareL to Vercel production environment with beta config
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PareL Beta Deployment - v0.13.2k${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo -e "${YELLOW}Install with: npm i -g vercel${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    echo -e "${YELLOW}Run this script from the project root${NC}"
    exit 1
fi

# Get current git branch and commit
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse --short HEAD)

echo -e "${BLUE}📊 Current Status:${NC}"
echo -e "  Branch: ${GREEN}$BRANCH${NC}"
echo -e "  Commit: ${GREEN}$COMMIT${NC}"
echo ""

# Confirm deployment
echo -e "${YELLOW}⚠️  This will deploy to Vercel PRODUCTION with beta configuration${NC}"
echo -e "${YELLOW}   Environment: NEXT_PUBLIC_ENV=beta${NC}"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 0
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
    echo -e "${YELLOW}   Make sure environment variables are set in Vercel dashboard${NC}"
fi

# Run linter (optional, comment out if not needed)
echo -e "${BLUE}🔧 Running linter...${NC}"
if ! npm run lint; then
    echo -e "${YELLOW}⚠️  Linter warnings detected${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 0
    fi
fi

# Build locally to check for errors (optional)
echo -e "${BLUE}🏗️  Building locally to check for errors...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}Fix build errors before deploying${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
echo ""

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

# Set environment variables for beta
vercel env add NEXT_PUBLIC_ENV production <<< "beta" || true
vercel env add ENABLE_ANALYTICS production <<< "1" || true

# Deploy
if vercel --prod; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo -e "  1. Test the deployed app"
    echo -e "  2. Check error logs in Vercel dashboard"
    echo -e "  3. Monitor analytics and feedback"
    echo -e "  4. Announce beta to testers"
    echo ""
    echo -e "${BLUE}🔗 Useful Links:${NC}"
    echo -e "  Dashboard: ${GREEN}https://vercel.com/dashboard${NC}"
    echo -e "  Logs: ${GREEN}https://vercel.com/logs${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Deployment Failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Check error messages above and try again${NC}"
    exit 1
fi

