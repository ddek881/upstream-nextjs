#!/bin/bash

echo "🚀 Setting up PostgreSQL for UpStream on Mac..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install PostgreSQL if not already installed
echo "📦 Installing PostgreSQL..."
brew install postgresql@15

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL service..."
brew services start postgresql@15

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Wait a moment for PostgreSQL to start
sleep 3

# Create database
echo "🗄️ Creating database..."
createdb upstream_db 2>/dev/null || echo "Database already exists"

# Create user
echo "👤 Creating database user..."
psql upstream_db -c "CREATE USER upstream_user WITH PASSWORD 'upstream123';" 2>/dev/null || echo "User already exists"

# Grant privileges
echo "🔐 Granting privileges..."
psql upstream_db -c "GRANT ALL PRIVILEGES ON DATABASE upstream_db TO upstream_user;" 2>/dev/null
psql upstream_db -c "GRANT ALL ON SCHEMA public TO upstream_user;" 2>/dev/null
psql upstream_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO upstream_user;" 2>/dev/null
psql upstream_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO upstream_user;" 2>/dev/null

# Run schema
echo "📋 Running database schema..."
psql upstream_db -f database/schema.sql

# Create .env.local
echo "⚙️ Creating .env.local file..."
cat > .env.local << 'EOF'
# PostgreSQL Database Configuration (Local Development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=upstream_db
DB_USER=upstream_user
DB_PASSWORD=upstream123

# QRIS Payment Configuration
NEXT_PUBLIC_QRIS_USERNAME=your_qris_username_here

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-GLM3XSXVXX

# Node Environment
NODE_ENV=development
EOF

echo "✅ PostgreSQL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. The app will now use PostgreSQL database"
echo ""
echo "🔧 Useful commands:"
echo "- Stop PostgreSQL: brew services stop postgresql@15"
echo "- Start PostgreSQL: brew services start postgresql@15"
echo "- Connect to database: psql upstream_db"
echo "- View logs: brew services log postgresql@15"
