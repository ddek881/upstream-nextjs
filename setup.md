# Setup Guide - UpStream Next.js

## 🚀 Quick Setup

### 1. Environment Variables
Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# PostgreSQL Database Configuration
DB_HOST=your_vps_ip_or_domain
DB_PORT=5432
DB_NAME=upstream_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# QRIS Payment Configuration
NEXT_PUBLIC_QRIS_USERNAME=your_qris_username_here

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-GLM3XSXVXX
```

### 2. Database Setup
**Untuk setup lengkap PostgreSQL di VPS, lihat [setup-postgresql.md](setup-postgresql.md)**

Jalankan SQL berikut di PostgreSQL database Anda:

```sql
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

-- Insert sample categories
INSERT INTO categories (name, display_name, sort_order) VALUES
  ('entertainment', 'Hiburan', 1),
  ('music', 'Musik', 2),
  ('sports', 'Olahraga', 3);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
  ('admin', 'admin123', 'admin@upstream.com');
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access Application
Buka [http://localhost:3000](http://localhost:3000)

## 📱 Pages Available

- **Home**: `/` - Halaman utama dengan daftar stream
- **Stream**: `/stream?id=1` - Halaman streaming video
- **Category**: `/category/entertainment` - Halaman kategori
- **Admin**: `/admin` - Dashboard admin

## 🔧 Configuration

### PostgreSQL Setup
1. Install PostgreSQL di VPS Anda (lihat [setup-postgresql.md](setup-postgresql.md))
2. Buat database dan user dengan privileges yang sesuai
3. Jalankan schema SQL untuk membuat tabel
4. Update `.env.local` dengan credentials database

### QRIS Payment Setup
1. Daftar di [QRIS Provider](https://rest.otomatis.vip)
2. Dapatkan username untuk API
3. Update `NEXT_PUBLIC_QRIS_USERNAME` di `.env.local`

## 🎯 Features Implemented

✅ **Core Components**
- HLSPlayer (Video streaming)
- StreamCard (Stream display)
- Header (Navigation)
- StarField (Background animation)
- FloatingSocialBubbles (Social elements)

✅ **Pages**
- HomePage (Landing page)
- StreamPage (Video player)
- CategoryPage (Category listing)
- AdminPage (Admin dashboard)

✅ **Styling**
- Tailwind CSS configuration
- Responsive design
- Dark theme with gradients
- Glass morphism effects

✅ **Data Management**
- PostgreSQL client setup
- TypeScript interfaces
- Sample data structure
- Utility functions

## 🚀 Next Steps

1. **Connect Real Data**: Replace sample data with PostgreSQL queries
2. **Payment Integration**: Implement QRIS payment flow
3. **Authentication**: Add admin login system
4. **Real-time Features**: Add live viewer count
5. **Performance**: Optimize database queries
6. **Testing**: Add unit and integration tests

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau hubungi tim development.
