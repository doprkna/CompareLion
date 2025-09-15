@echo off
echo 🚀 Setting up PareL MVP...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration
) else (
    echo ✅ .env file already exists
)

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if PostgreSQL is ready
echo 🔍 Checking PostgreSQL connection...
:wait_postgres
docker-compose exec postgres pg_isready -U parel -d parel >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)

REM Check if Redis is ready
echo 🔍 Checking Redis connection...
:wait_redis
docker-compose exec redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for Redis...
    timeout /t 2 /nobreak >nul
    goto wait_redis
)

echo ✅ Services are ready

REM Push database schema
echo 🗄️  Setting up database...
npm run db:push

REM Seed database
echo 🌱 Seeding database...
npm run db:seed

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Run 'npm run dev' to start development
echo 3. Open http://localhost:3000 in your browser
echo.
echo Demo credentials:
echo Email: demo@parel.com
echo Password: (use magic link or Google OAuth)





