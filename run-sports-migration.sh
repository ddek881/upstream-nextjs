#!/bin/bash

# Script untuk menjalankan migration sports categories
echo "⚽ Running sports categories migration..."

# Set working directory
cd /home/upstream/upstream-nextjs

# Run migration
mysql -u upstream_user -pupstream_password upstream_db < database/migrations/004_insert_sports_categories.sql

if [ $? -eq 0 ]; then
    echo "✅ Sports categories migration completed successfully!"
    echo "📊 Added 40 sports categories to database"
    echo "🏆 Categories include: Football, Motorsport, Volleyball, Combat Sports"
else
    echo "❌ Migration failed!"
    exit 1
fi
