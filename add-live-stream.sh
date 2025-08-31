#!/bin/bash

echo "🎥 Adding Live Stream to UpStream Database..."

# Check if arguments are provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 <title> <category> [description]"
    echo "Example: $0 'My Live Stream' 'entertainment' 'Live streaming description'"
    exit 1
fi

TITLE="$1"
CATEGORY="$2"
DESCRIPTION="${3:-Live streaming dengan kualitas HD}"
URL="https://stream.trcell.id/hls/byon2.m3u8"

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Insert stream into database
echo "📝 Adding stream: $TITLE"
psql upstream_db -c "INSERT INTO streams (title, category, thumbnail, is_live, is_visible, url, description, is_paid, price, scheduled_time, estimated_duration) VALUES ('$TITLE', '$CATEGORY', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop', true, true, '$URL', '$DESCRIPTION', false, 0, '$(date -u +"%Y-%m-%dT%H:%M")', 'Live');"

if [ $? -eq 0 ]; then
    echo "✅ Stream added successfully!"
    echo ""
    echo "📊 Current live streams:"
    psql upstream_db -c "SELECT title, category FROM streams WHERE is_live = true ORDER BY created_at DESC;"
    echo ""
    echo "🌐 Open http://localhost:3000 to view the new stream"
else
    echo "❌ Failed to add stream"
    exit 1
fi
