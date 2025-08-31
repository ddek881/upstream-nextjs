#!/bin/bash

# Script untuk melihat semua stream yang ada di database
# Usage: ./list-streams.sh [category]

# Load environment variables
source .env.local

# Add PostgreSQL bin to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

echo "📺 Daftar Stream di Database"
echo "=============================="

if [ -n "$1" ]; then
    echo "Filter kategori: $1"
    echo ""
    
    psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
    SELECT 
        title,
        category,
        CASE WHEN is_live THEN '🔴 LIVE' ELSE '⏸️  RECORDED' END as status,
        CASE WHEN is_paid THEN '💰 PAID' ELSE '🆓 FREE' END as type,
        thumbnail,
        url
    FROM streams 
    WHERE category = '$1'
    ORDER BY created_at DESC;
EOF
else
    psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
    SELECT 
        title,
        category,
        CASE WHEN is_live THEN '🔴 LIVE' ELSE '⏸️  RECORDED' END as status,
        CASE WHEN is_paid THEN '💰 PAID' ELSE '🆓 FREE' END as type,
        thumbnail,
        url
    FROM streams 
    ORDER BY created_at DESC;
EOF
fi

echo ""
echo "📊 Statistik:"
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
SELECT 
    COUNT(*) as total_streams,
    COUNT(CASE WHEN is_live THEN 1 END) as live_streams,
    COUNT(CASE WHEN is_paid THEN 1 END) as paid_streams,
    COUNT(DISTINCT category) as categories
FROM streams;
EOF
