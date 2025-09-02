#!/bin/bash

# Deploy script untuk upstream-nextjs
# Script ini akan build aplikasi dan restart PM2

echo "🚀 Starting deployment process..."

# Set working directory
cd /home/upstream/upstream-nextjs

# Stop and delete PM2 process to ensure clean restart
echo "⏹️  Stopping and cleaning PM2 process..."
pm2 stop upstream-nextjs 2>/dev/null || true
pm2 delete upstream-nextjs 2>/dev/null || true

# Build aplikasi
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start PM2 process
    echo "▶️  Starting PM2 process..."
    pm2 start ecosystem.config.js
    
    # Check if PM2 start was successful
    if [ $? -eq 0 ]; then
        echo "✅ PM2 started successfully!"
        echo "📊 PM2 Status:"
        pm2 status
        echo ""
        echo "🎉 Deployment completed successfully!"
        echo "🌐 Application should be available at: http://localhost:3000"
    else
        echo "❌ Failed to start PM2 process"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
