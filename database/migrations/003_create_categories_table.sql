-- Migration: Create categories table
-- Date: 2025-09-01

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    img_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (id, name, img_url) VALUES
('entertainment', 'Entertainment', 'https://images.unsplash.com/photo-1489599839929-2fa484eadc63?w=400&h=300&fit=crop'),
('sports', 'Sports', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('music', 'Music', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'),
('news', 'News', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop'),
('gaming', 'Gaming', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('education', 'Education', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop')
ON DUPLICATE KEY UPDATE name = VALUES(name), img_url = VALUES(img_url);

-- Add foreign key constraint to streams table
ALTER TABLE streams 
ADD CONSTRAINT fk_streams_category 
FOREIGN KEY (category) REFERENCES categories(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Update existing streams to use valid category IDs
UPDATE streams SET category = 'entertainment' WHERE category NOT IN (SELECT id FROM categories);
