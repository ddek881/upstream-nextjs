-- Create viewers table to track stream viewers
CREATE TABLE IF NOT EXISTS viewers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stream_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_view (user_id, stream_id),
    INDEX idx_stream_id (stream_id),
    INDEX idx_user_id (user_id)
);
