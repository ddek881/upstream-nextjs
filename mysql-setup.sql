-- MySQL Setup Script for Upstream App (Optimized for 1M requests/hour)
-- Run this in MySQL client

USE upstream_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trial_usage;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS streams;

-- Create streams table with optimized indexes
CREATE TABLE streams (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  url VARCHAR(500),
  category VARCHAR(50) DEFAULT 'entertainment',
  price INT DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  scheduled_time TIMESTAMP NULL,
  estimated_duration VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Optimized indexes for high performance
  INDEX idx_is_live (is_live),
  INDEX idx_is_paid (is_paid),
  INDEX idx_is_visible (is_visible),
  INDEX idx_is_popular (is_popular),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_live_popular (is_live, is_popular),
  INDEX idx_visible_live (is_visible, is_live),
  INDEX idx_paid_popular (is_paid, is_popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payments table with optimized indexes
CREATE TABLE payments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  stream_id CHAR(36) NOT NULL,
  trx_id VARCHAR(255) UNIQUE NOT NULL,
  amount INT NOT NULL,
  qris_data TEXT,
  status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT 'pending',
  expired_at BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  
  -- Optimized indexes for high performance
  INDEX idx_user_id (user_id),
  INDEX idx_stream_id (stream_id),
  INDEX idx_trx_id (trx_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_user_stream (user_id, stream_id),
  INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trial_usage table with optimized indexes
CREATE TABLE trial_usage (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  stream_id CHAR(36) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  
  -- Unique constraint and indexes
  UNIQUE KEY unique_user_stream (user_id, stream_id),
  INDEX idx_user_id (user_id),
  INDEX idx_stream_id (stream_id),
  INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data with popular streams
INSERT INTO streams (id, title, description, thumbnail, url, category, price, is_live, is_paid, is_visible, is_popular, scheduled_time, estimated_duration) VALUES
-- Live streams with popular
(UUID(), 'Upstream News Live', 'Live news streaming dengan berita terkini', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'entertainment', 0, TRUE, FALSE, TRUE, TRUE, NULL, '2 jam'),
(UUID(), 'Upstream Premium Music', 'Premium music streaming dengan kualitas HD', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'music', 1000, TRUE, TRUE, TRUE, TRUE, NULL, '3 jam'),
(UUID(), 'Upstream Premium Sports', 'Premium sports streaming dengan komentar eksklusif', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'sports', 1000, TRUE, TRUE, TRUE, TRUE, NULL, '2.5 jam'),
(UUID(), 'Upstream Sports Live', 'Live sports streaming dengan kualitas HD', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'sports', 0, TRUE, FALSE, TRUE, FALSE, NULL, '2 jam'),
(UUID(), 'Upstream Live Music', 'Live music streaming dengan kualitas premium', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'music', 0, TRUE, FALSE, TRUE, FALSE, NULL, '1.5 jam'),

-- Scheduled streams with popular
(UUID(), 'Upstream Premium News', 'Premium news streaming dengan analisis mendalam', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'entertainment', 1000, FALSE, TRUE, TRUE, TRUE, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 5 HOUR, '2 jam 30 menit'),
(UUID(), 'Upstream Entertainment', 'Entertainment streaming dengan konten terbaru', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'entertainment', 0, FALSE, FALSE, TRUE, TRUE, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, '1 jam 45 menit'),
(UUID(), 'Upstream Premium Entertainment', 'Premium entertainment dengan konten eksklusif', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop', 'https://stream.trcell.id/hls/byon2.m3u8', 'entertainment', 1500, FALSE, TRUE, TRUE, TRUE, DATE_ADD(NOW(), INTERVAL 6 HOUR) + INTERVAL 30 MINUTE, '3 jam');

-- Show results
SELECT 
  'Streams' as table_name,
  COUNT(*) as record_count
FROM streams
UNION ALL
SELECT 
  'Payments' as table_name,
  COUNT(*) as record_count
FROM payments
UNION ALL
SELECT 
  'Trial Usage' as table_name,
  COUNT(*) as record_count
FROM trial_usage;

-- Show popular streams
SELECT 
  title,
  is_live,
  is_popular,
  scheduled_time,
  CASE 
    WHEN scheduled_time IS NOT NULL THEN 
      DATE_FORMAT(scheduled_time, '%Y-%m-%d %H:%i')
    ELSE 'NULL'
  END as formatted_time
FROM streams 
WHERE is_popular = TRUE
ORDER BY is_live DESC, scheduled_time ASC;
