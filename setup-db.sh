#!/bin/bash

# Setup PostgreSQL Database for UpStream
echo "Setting up PostgreSQL database for UpStream..."

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE upstream_db;
CREATE USER upstream_user WITH PASSWORD 'upstream_password';
GRANT ALL PRIVILEGES ON DATABASE upstream_db TO upstream_user;
ALTER USER upstream_user CREATEDB;
\q
EOF

# Apply schema
sudo -u postgres psql -d upstream_db -f /tmp/schema.sql

# Grant permissions
sudo -u postgres psql -d upstream_db << EOF
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO upstream_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO upstream_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO upstream_user;
\q
EOF

echo "Database setup completed!"
