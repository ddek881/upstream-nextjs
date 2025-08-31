#!/bin/bash

# Script untuk menambahkan stream baru dengan URL gambar
# Usage: ./add-stream-with-image.sh "Judul Stream" "URL_GAMBAR" "deskripsi" "URL_STREAM"

if [ $# -lt 4 ]; then
    echo "Usage: $0 \"Judul Stream\" \"URL_GAMBAR\" \"deskripsi\" \"URL_STREAM\" [is_live] [is_paid] [price]"
    echo "Contoh: $0 \"TR Cell News Live\" \"https://example.com/image.jpg\" \"Live news streaming\" \"https://stream.trcell.id/hls/byon2.m3u8\" true false 0"
    exit 1
fi

TITLE="$1"
THUMBNAIL_URL="$2"
DESCRIPTION="$3"
STREAM_URL="$4"
IS_LIVE="${5:-false}"
IS_PAID="${6:-false}"
PRICE="${7:-0}"

# Load environment variables
source .env.local

# Add PostgreSQL bin to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

echo "Menambahkan stream baru..."
echo "Judul: $TITLE"
echo "Thumbnail URL: $THUMBNAIL_URL"
echo "Stream URL: $STREAM_URL"
echo "Live: $IS_LIVE"
echo "Paid: $IS_PAID"
echo "Price: $PRICE"

# Insert new stream
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
INSERT INTO streams (title, description, thumbnail, is_live, is_visible, url, is_paid, price, scheduled_time, estimated_duration)
VALUES (
    '$TITLE',
    '$DESCRIPTION',
    '$THUMBNAIL_URL',
    $IS_LIVE,
    true,
    '$STREAM_URL',
    $IS_PAID,
    $PRICE,
    now()::text,
    '2 hours'
);
EOF

if [ $? -eq 0 ]; then
    echo "✅ Stream berhasil ditambahkan!"
    echo "📺 Stream baru: $TITLE"
    echo "🖼️  Thumbnail: $THUMBNAIL_URL"
    echo "🔗 Stream URL: $STREAM_URL"
else
    echo "❌ Gagal menambahkan stream"
    exit 1
fi
