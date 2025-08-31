-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    price INTEGER DEFAULT 0,
    is_live BOOLEAN NOT NULL DEFAULT false,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    scheduled_time TIMESTAMP,
    estimated_duration VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stream_id UUID NOT NULL,
    trx_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, expired, failed
    paid_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
);

-- Create user_sessions table
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL,
  free_trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trial_usage table for tracking free trial usage per stream
CREATE TABLE IF NOT EXISTS trial_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stream_id UUID NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
    UNIQUE(user_id, stream_id)
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

-- Create stream_viewers table
CREATE TABLE stream_viewers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stream_id uuid REFERENCES streams(id) ON DELETE CASCADE,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_streams_is_live ON streams(is_live);
CREATE INDEX idx_streams_is_visible ON streams(is_visible);
CREATE INDEX idx_streams_is_paid ON streams(is_paid);
CREATE INDEX idx_payments_trx_id ON payments(trx_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_stream_viewers_stream_id ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_stream ON payments(user_id, stream_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_trx_id ON payments(trx_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_user_stream ON trial_usage(user_id, stream_id);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
  ('admin', 'admin123', 'admin@upstream.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample streams data
INSERT INTO streams (id, title, description, thumbnail, url, price, is_live, is_paid, is_visible, estimated_duration) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Upstream Live Music', 'Live streaming musik terbaik dengan kualitas HD', 'https://picsum.photos/400/225?random=1', 'https://stream.trcell.id/hls/byon2.m3u8', 0, true, false, true, '2 jam'),
('550e8400-e29b-41d4-a716-446655440002', 'Premium Concert Live', 'Konser musik premium dengan artis ternama', 'https://picsum.photos/400/225?random=2', 'https://stream.trcell.id/hls/byon2.m3u8', 10000, true, true, true, '3 jam'),
('550e8400-e29b-41d4-a716-446655440003', 'Sports Championship', 'Pertandingan olahraga seru dengan komentar langsung', 'https://picsum.photos/400/225?random=3', 'https://stream.trcell.id/hls/byon2.m3u8', 0, true, false, true, '2.5 jam'),
('550e8400-e29b-41d4-a716-446655440004', 'Exclusive Event', 'Acara eksklusif dengan konten premium', 'https://picsum.photos/400/225?random=4', 'https://stream.trcell.id/hls/byon2.m3u8', 15000, true, true, true, '4 jam'),
('550e8400-e29b-41d4-a716-446655440005', 'Comedy Night Live', 'Malam komedi dengan stand-up comedian terbaik', 'https://picsum.photos/400/225?random=5', 'https://stream.trcell.id/hls/byon2.m3u8', 0, false, false, true, '1.5 jam'),
('550e8400-e29b-41d4-a716-446655440006', 'Gaming Tournament', 'Turnamen gaming dengan hadiah jutaan rupiah', 'https://picsum.photos/400/225?random=6', 'https://stream.trcell.id/hls/byon2.m3u8', 5000, false, true, true, '6 jam'),
('550e8400-e29b-41d4-a716-446655440007', 'Educational Seminar', 'Seminar pendidikan dengan pembicara ahli', 'https://picsum.photos/400/225?random=7', 'https://stream.trcell.id/hls/byon2.m3u8', 0, false, false, true, '2 jam'),
('550e8400-e29b-41d4-a716-446655440008', 'Movie Premiere', 'Premiere film terbaru dengan kualitas 4K', 'https://picsum.photos/400/225?random=8', 'https://stream.trcell.id/hls/byon2.m3u8', 25000, false, true, true, '2.5 jam');

-- Insert sample payments data
INSERT INTO payments (user_id, stream_id, trx_id, amount, status, expires_at) VALUES
('user_1756623967531_xtlyqfm8u', '550e8400-e29b-41d4-a716-446655440002', '03C2c0dcbd9c42c9', 10000, 'paid', NOW() + INTERVAL '2 hours'),
('user_1756623967531_xtlyqfm8u', '550e8400-e29b-41d4-a716-446655440004', '03C2c0dcbd9c42c8', 15000, 'paid', NOW() + INTERVAL '2 hours'),
('user_1756623967531_xtlyqfm8u', '550e8400-e29b-41d4-a716-446655440006', '03C2c0dcbd9c42c7', 5000, 'pending', NOW() + INTERVAL '2 hours');

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
