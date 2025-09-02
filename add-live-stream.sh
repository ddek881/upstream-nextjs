#!/bin/bash

# Add Live Stream Script for UpStream
# Usage: ./add-live-stream.sh

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="upstream_db"
DB_USER="upstream_user"
DB_PASSWORD="upstream_password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== UpStream Live Stream Manager ===${NC}"
echo ""

# Function to generate UUID
generate_uuid() {
    python3 -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null || 
    python -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null ||
    echo "00000000-0000-0000-0000-000000000000"
}

# Function to add live stream
add_live_stream() {
    echo -e "${YELLOW}Adding new live stream...${NC}"
    echo ""
    
    # Get stream details
    read -p "Enter stream title: " title
    read -p "Enter stream description: " description
    read -p "Enter stream URL (HLS): " url
    read -p "Enter stream price (in IDR): " price
    read -p "Enter thumbnail URL: " thumbnail
    read -p "Is this a paid stream? (y/n): " is_paid_input
    read -p "Is this stream visible? (y/n): " is_visible_input
    read -p "Enter scheduled time (YYYY-MM-DD HH:MM:SS) or press Enter for now: " scheduled_time
    
    # Convert inputs to boolean
    if [[ "$is_paid_input" == "y" || "$is_paid_input" == "Y" ]]; then
        is_paid="true"
    else
        is_paid="false"
    fi
    
    if [[ "$is_visible_input" == "y" || "$is_visible_input" == "Y" ]]; then
        is_visible="true"
    else
        is_visible="false"
    fi
    
    # Generate UUID
    stream_id=$(generate_uuid)
    
    # Set default values if empty
    if [[ -z "$scheduled_time" ]]; then
        scheduled_time="NULL"
    else
        scheduled_time="'$scheduled_time'"
    fi
    
    if [[ -z "$thumbnail" ]]; then
        thumbnail="'https://via.placeholder.com/400x225/1f2937/ffffff?text=Live+Stream'"
    else
        thumbnail="'$thumbnail'"
    fi
    
    # Create SQL query
    sql_query="INSERT INTO streams (id, title, description, url, price, thumbnail, is_live, is_paid, is_visible, scheduled_time, created_at, updated_at) VALUES ('$stream_id', '$title', '$description', '$url', $price, $thumbnail, true, $is_paid, $is_visible, $scheduled_time, NOW(), NOW());"
    
    echo ""
    echo -e "${BLUE}Stream details:${NC}"
    echo "ID: $stream_id"
    echo "Title: $title"
    echo "Description: $description"
    echo "URL: $url"
    echo "Price: $price"
    echo "Thumbnail: $thumbnail"
    echo "Is Live: true"
    echo "Is Paid: $is_paid"
    echo "Is Visible: $is_visible"
    echo "Scheduled Time: $scheduled_time"
    echo ""
    
    read -p "Confirm to add this stream? (y/n): " confirm
    
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        # Execute SQL query
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql_query"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Live stream added successfully!${NC}"
            echo -e "${BLUE}Stream ID: $stream_id${NC}"
            echo -e "${BLUE}Access URL: https://live.fast-stream.video/stream?id=$stream_id${NC}"
        else
            echo -e "${RED}✗ Failed to add live stream${NC}"
        fi
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

# Function to list all streams
list_streams() {
    echo -e "${YELLOW}Listing all streams...${NC}"
    echo ""
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT 
        id,
        title,
        CASE WHEN is_live THEN 'LIVE' ELSE 'OFFLINE' END as status,
        CASE WHEN is_paid THEN 'PAID' ELSE 'FREE' END as type,
        CASE WHEN is_visible THEN 'VISIBLE' ELSE 'HIDDEN' END as visibility,
        price,
        created_at
    FROM streams 
    ORDER BY created_at DESC;
    "
}

# Function to update stream status
update_stream_status() {
    echo -e "${YELLOW}Update stream status...${NC}"
    echo ""
    
    read -p "Enter stream ID: " stream_id
    read -p "Set as live? (y/n): " is_live_input
    read -p "Set as visible? (y/n): " is_visible_input
    
    # Convert inputs to boolean
    if [[ "$is_live_input" == "y" || "$is_live_input" == "Y" ]]; then
        is_live="true"
    else
        is_live="false"
    fi
    
    if [[ "$is_visible_input" == "y" || "$is_visible_input" == "Y" ]]; then
        is_visible="true"
    else
        is_visible="false"
    fi
    
    sql_query="UPDATE streams SET is_live = $is_live, is_visible = $is_visible, updated_at = NOW() WHERE id = '$stream_id';"
    
    echo ""
    echo -e "${BLUE}Updating stream:${NC}"
    echo "ID: $stream_id"
    echo "Is Live: $is_live"
    echo "Is Visible: $is_visible"
    echo ""
    
    read -p "Confirm to update this stream? (y/n): " confirm
    
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql_query"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Stream updated successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to update stream${NC}"
        fi
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

# Function to delete stream
delete_stream() {
    echo -e "${YELLOW}Delete stream...${NC}"
    echo ""
    
    read -p "Enter stream ID to delete: " stream_id
    
    echo ""
    echo -e "${RED}WARNING: This will permanently delete the stream and all related data!${NC}"
    echo "Stream ID: $stream_id"
    echo ""
    
    read -p "Are you sure you want to delete this stream? (y/n): " confirm
    
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        sql_query="DELETE FROM streams WHERE id = '$stream_id';"
        
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql_query"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Stream deleted successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to delete stream${NC}"
        fi
    else
        echo -e "${YELLOW}Operation cancelled${NC}"
    fi
}

# Main menu
while true; do
    echo ""
    echo -e "${BLUE}=== UpStream Live Stream Manager ===${NC}"
    echo "1. Add new live stream"
    echo "2. List all streams"
    echo "3. Update stream status"
    echo "4. Delete stream"
    echo "5. Exit"
    echo ""
    read -p "Choose an option (1-5): " choice
    
    case $choice in
        1)
            add_live_stream
            ;;
        2)
            list_streams
            ;;
        3)
            update_stream_status
            ;;
        4)
            delete_stream
            ;;
        5)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please choose 1-5.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
