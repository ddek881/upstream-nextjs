#!/bin/bash

echo "🔧 Fixing PostgreSQL authentication..."

# Stop PostgreSQL
sudo systemctl stop postgresql

# Backup original config
sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup

# Create new pg_hba.conf with proper authentication
sudo tee /var/lib/pgsql/data/pg_hba.conf > /dev/null << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            ident
host    replication     all             ::1/128                 ident
EOF

# Start PostgreSQL
sudo systemctl start postgresql

# Wait a moment
sleep 2

# Test connection
echo "🧪 Testing connection..."
PGPASSWORD=upstream_password psql -h localhost -U upstream_user -d upstream_db -c "SELECT 'Connection successful!' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Authentication fixed successfully!"
else
    echo "❌ Still having issues. Let's try a different approach..."
fi
