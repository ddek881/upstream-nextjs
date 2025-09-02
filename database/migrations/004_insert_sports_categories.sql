-- Migration: Insert Sports Categories
-- Date: 2025-09-01

-- Insert sports categories
INSERT INTO categories (id, name, img_url) VALUES
-- Football/Soccer Categories
('laliga', 'LaLiga', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('premier-league', 'Premier League', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('serie-a', 'Serie A', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('bri-super-league', 'BRI Super League', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('eredivisie', 'Eredivisie', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('afc-asia', 'AFC Asia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('uefa-champions-league', 'UEFA Champions League', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('efl-champions', 'EFL Champions', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('uefa-europa-league', 'UEFA Europa League', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('piala-dunia', 'Piala Dunia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('euro', 'Euro', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('fa-cup', 'FA Cup', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('carabao-cup', 'Carabao Cup', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('copa-america', 'Copa America', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('saudi-league', 'Saudi League', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('timnas-indonesia', 'Timnas Indonesia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('supercoppa-italia', 'Supercoppa Italia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('sepak-bola', 'Sepak Bola', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),

-- Motorsport Categories
('motogp', 'MotoGP', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('formula-1', 'Formula 1', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),

-- Volleyball Categories
('volleyball', 'Volleyball', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('fivb-mens-u21', 'FIVB Men\'s U21', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('proliga', 'Proliga', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),
('kapolri-cup', 'Kapolri Cup', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'),

-- Combat Sports Categories
('mma', 'MMA', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('ufc', 'UFC', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('one-championship', 'ONE Championship', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('one-pride-mma', 'ONE Pride MMA', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('byon-combat', 'Byon Combat', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('byon-madness', 'Byon Madness', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('rws-muay-thai', 'RWS Muay Thai', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('superstar-knockout', 'Superstar Knockout', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('hss-boxing', 'HSS Boxing', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('top-rank', 'Top Rank', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('probellum', 'Probellum', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('waserman', 'Waserman', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('hw-sport-night', 'HW Sport Night', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('baku-hamtam-championship', 'Baku Hamtam Championship', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('boxing', 'Boxing', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'),
('exhibition', 'Exhibition', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop')

ON DUPLICATE KEY UPDATE name = VALUES(name), img_url = VALUES(img_url);
