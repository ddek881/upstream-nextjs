#!/bin/bash

# Script untuk melihat stream berdasarkan tipe (free/paid)
# Usage: ./view-streams-by-type.sh [free|paid|all]

# Load environment variables
source .env.local

# Add PostgreSQL bin to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

TYPE="${1:-all}"

echo "📺 Daftar Stream berdasarkan Tipe"
echo "=================================="

case $TYPE in
    "free")
        echo "🆓 Stream Gratis:"
        echo ""
        psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
        SELECT 
            title,
            CASE WHEN is_live THEN '🔴 LIVE' ELSE '⏸️  RECORDED' END as status,
            '🆓 FREE' as type,
            price,
            thumbnail
        FROM streams 
        WHERE is_paid = false
        ORDER BY created_at DESC;
EOF
        ;;
    "paid")
        echo "💰 Stream Berbayar:"
        echo ""
        psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
        SELECT 
            title,
            CASE WHEN is_live THEN '🔴 LIVE' ELSE '⏸️  RECORDED' END as status,
            '💰 PAID' as type,
            price,
            thumbnail
        FROM streams 
        WHERE is_paid = true
        ORDER BY price ASC, created_at DESC;
EOF
        ;;
    "all"|*)
        echo "📋 Semua Stream:"
        echo ""
        psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
        SELECT 
            title,
            CASE WHEN is_live THEN '🔴 LIVE' ELSE '⏸️  RECORDED' END as status,
            CASE WHEN is_paid THEN '💰 PAID' ELSE '🆓 FREE' END as type,
            price,
            thumbnail
        FROM streams 
        ORDER BY is_paid DESC, price ASC, created_at DESC;
EOF
        ;;
esac

echo ""
echo "📊 Statistik Stream:"
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
SELECT 
    COUNT(*) as total_streams,
    COUNT(CASE WHEN is_paid = false THEN 1 END) as free_streams,
    COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_streams,
    COUNT(CASE WHEN is_live THEN 1 END) as live_streams,
    MIN(CASE WHEN is_paid = true THEN price END) as min_price,
    MAX(CASE WHEN is_paid = true THEN price END) as max_price,
    AVG(CASE WHEN is_paid = true THEN price END) as avg_price
FROM streams;
EOF
