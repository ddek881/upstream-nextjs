-- UpStream Database Schema
-- PostgreSQL Database Schema for UpStream Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create streams table
CREATE TABLE streams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text NOT NULL,
  thumbnail text NOT NULL,
  is_live boolean DEFAULT false,
  is_visible boolean DEFAULT true,
  url text NOT NULL,
  description text,
  is_paid boolean DEFAULT false,
  price integer,
  scheduled_time text,
  estimated_duration text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stream_id text NOT NULL,
  amount integer NOT NULL,
  qris_data text NOT NULL,
  trx_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'expired')),
  expired_at bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL,
  free_trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  role text DEFAULT 'admin',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subcategories table
CREATE TABLE subcategories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Create stream_viewers table for tracking viewers
CREATE TABLE stream_viewers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stream_id text NOT NULL,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stream_id)
);

-- Create indexes for better performance
CREATE INDEX idx_streams_is_live ON streams(is_live);
CREATE INDEX idx_streams_is_visible ON streams(is_visible);
CREATE INDEX idx_streams_category ON streams(category);
CREATE INDEX idx_streams_is_paid ON streams(is_paid);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stream_id ON payments(stream_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_trx_id ON payments(trx_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_stream_viewers_stream_id ON stream_viewers(stream_id);
CREATE INDEX idx_stream_viewers_last_seen ON stream_viewers(last_seen);

-- Insert sample categories
INSERT INTO categories (name, display_name, sort_order) VALUES
  ('entertainment', 'Hiburan', 1),
  ('music', 'Musik', 2),
  ('sports', 'Olahraga', 3);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
  ('admin', 'admin123', 'admin@upstream.com');

-- Insert sample streams
INSERT INTO streams (title, category, thumbnail, is_live, is_visible, url, description, is_paid, price) VALUES
  ('Upstream News Live', 'entertainment', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Live news streaming dengan berita terkini', false, 0),
  ('Upstream Premium News', 'entertainment', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Premium news streaming dengan analisis mendalam', true, 1000),
  ('Upstream Premium Music', 'music', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Premium music streaming dengan kualitas HD', true, 1000),
  ('Upstream Premium Sports', 'sports', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Premium sports streaming dengan komentar eksklusif', true, 1000),
  ('Upstream Sports Live', 'sports', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Live sports streaming dengan kualitas HD', false, 0),
  ('Upstream Live Music', 'music', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop', true, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Live music streaming dengan kualitas premium', false, 0),
  ('Upstream Entertainment', 'entertainment', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop', false, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Entertainment streaming dengan konten terbaru', false, 0),
  ('Upstream Premium Entertainment', 'entertainment', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop', false, true, 'https://stream.trcell.id/hls/byon2.m3u8', 'Premium entertainment dengan konten eksklusif', true, 1500);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old viewer records
CREATE OR REPLACE FUNCTION cleanup_old_viewers()
RETURNS void AS $$
BEGIN
    DELETE FROM stream_viewers WHERE last_seen < now() - interval '1 hour';
END;
$$ language 'plpgsql';

-- Create function to get live viewer count
CREATE OR REPLACE FUNCTION get_live_viewer_count(stream_id_param text)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM stream_viewers 
        WHERE stream_id = stream_id_param 
        AND last_seen > now() - interval '5 minutes'
    );
END;
$$ language 'plpgsql';

-- Grant permissions to application user
-- Note: Run this after creating the database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO upstream_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO upstream_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO upstream_user;
