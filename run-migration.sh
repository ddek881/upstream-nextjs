#!/bin/bash

# Script untuk menjalankan migration categories table
echo "🗄️  Running categories table migration..."

# Set working directory
cd /home/upstream/upstream-nextjs

# Run migration
mysql -u upstream_user -pupstream_password upstream_db < database/migrations/003_create_categories_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "📊 Categories table created with default data"
    echo "🔗 Foreign key constraint added to streams table"
else
    echo "❌ Migration failed!"
    exit 1
fi
