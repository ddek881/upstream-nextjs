# Setup Guide - UpStream Next.js dengan PostgreSQL di VPS

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

### 2. VPS Setup

#### Install PostgreSQL di VPS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Konfigurasi PostgreSQL
```bash
# Masuk ke PostgreSQL sebagai superuser
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE upstream_db;
CREATE USER upstream_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE upstream_db TO upstream_user;
\q
```

#### Setup Database Schema
```bash
# Masuk ke database
psql -h localhost -U upstream_user -d upstream_db

# Jalankan schema SQL
\i database/schema.sql
```

#### Konfigurasi Remote Access (Opsional)
Edit file `postgresql.conf`:
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
# Uncomment dan ubah: listen_addresses = '*'
```

Edit file `pg_hba.conf`:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Tambahkan: host upstream_db upstream_user 0.0.0.0/0 md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 3. Firewall Configuration
```bash
# Buka port PostgreSQL (5432)
sudo ufw allow 5432/tcp

# Buka port untuk aplikasi Next.js (3000)
sudo ufw allow 3000/tcp
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Application
Buka [http://localhost:3000](http://localhost:3000)

## 📱 Pages Available

- **Home**: `/` - Halaman utama dengan daftar stream
- **Stream**: `/stream?id=1` - Halaman streaming video
- **Category**: `/category/entertainment` - Halaman kategori
- **Admin**: `/admin` - Dashboard admin

## 🔧 Configuration

### PostgreSQL Setup di VPS
1. Install PostgreSQL di VPS Anda
2. Buat database dan user dengan privileges yang sesuai
3. Jalankan schema SQL untuk membuat tabel
4. Konfigurasi remote access jika diperlukan
5. Update environment variables dengan credentials VPS

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

## 🗄️ Database Schema

### Core Tables

#### `streams`
```sql
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
```

#### `payments`
```sql
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
```

#### `user_sessions`
```sql
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL,
  free_trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🚀 Deployment

### Production Setup di VPS
```bash
# Install Node.js dan npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd upstream-nextjs

# Install dependencies
npm install

# Build aplikasi
npm run build

# Install PM2 untuk process management
sudo npm install -g pm2

# Start aplikasi dengan PM2
pm2 start npm --name "upstream" -- start
pm2 startup
pm2 save
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL dengan Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 🔒 Security

- Database connection dengan SSL di production
- Prepared statements untuk mencegah SQL injection
- Environment variables untuk sensitive data
- Firewall configuration
- Regular database backups

## 📊 Monitoring

### Database Monitoring
```bash
# Monitor database connections
SELECT count(*) FROM pg_stat_activity;

# Monitor slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### Application Monitoring
```bash
# Monitor PM2 processes
pm2 status
pm2 logs upstream

# Monitor system resources
htop
df -h
```

## 🚀 Next Steps

1. **Connect Real Data**: Replace sample data with PostgreSQL queries
2. **Payment Integration**: Implement QRIS payment flow
3. **Authentication**: Add admin login system
4. **Real-time Features**: Add live viewer count
5. **Performance**: Optimize database queries
6. **Testing**: Add unit and integration tests
7. **Backup Strategy**: Setup automated database backups

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau hubungi tim development.
