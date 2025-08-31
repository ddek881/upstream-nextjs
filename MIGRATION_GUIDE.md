# Migration Guide: Supabase ke PostgreSQL di VPS

## 📋 Ringkasan Perubahan

Proyek UpStream telah berhasil dimigrasikan dari Supabase ke PostgreSQL yang berjalan di VPS. Berikut adalah perubahan utama yang telah dilakukan:

## 🔄 Perubahan Utama

### 1. Database Configuration
- **Sebelum**: Menggunakan Supabase client (`@supabase/supabase-js`)
- **Sesudah**: Menggunakan PostgreSQL client (`pg`) dengan koneksi langsung ke VPS

### 2. File yang Diubah

#### Dependencies
```diff
- "@supabase/supabase-js": "^2.56.1"
+ "pg": "^8.11.3"
+ "@types/pg": "^8.10.9"
```

#### Database Configuration
- **Dihapus**: `lib/supabase.ts`
- **Ditambahkan**: `lib/database.ts` - Konfigurasi PostgreSQL dengan connection pool

#### API Routes
- **Ditambahkan**: `app/api/streams/route.ts` - API untuk mengambil streams
- **Ditambahkan**: `app/api/streams/[id]/route.ts` - API untuk mengambil stream by ID

#### Environment Variables
```diff
- NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
+ DB_HOST=your_vps_ip_or_domain
+ DB_PORT=5432
+ DB_NAME=upstream_db
+ DB_USER=your_db_user
+ DB_PASSWORD=your_db_password
```

### 3. Database Schema
- **File**: `database/schema.sql` - Schema PostgreSQL lengkap dengan:
  - UUID extension
  - Semua tabel (streams, payments, user_sessions, admin_users, categories, subcategories)
  - Indexes untuk performa
  - Triggers untuk updated_at
  - Sample data

## 🛠️ Setup PostgreSQL di VPS

### 1. Install PostgreSQL
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

### 2. Setup Database
```bash
# Masuk ke PostgreSQL sebagai superuser
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE upstream_db;
CREATE USER upstream_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE upstream_db TO upstream_user;
\q
```

### 3. Jalankan Schema
```bash
# Masuk ke database
psql -h localhost -U upstream_user -d upstream_db

# Jalankan schema SQL
\i database/schema.sql
```

### 4. Konfigurasi Remote Access (Opsional)
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Uncomment: listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Tambahkan: host upstream_db upstream_user 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🔧 Konfigurasi Aplikasi

### 1. Environment Variables
Buat file `.env.local`:
```env
# PostgreSQL Database Configuration
DB_HOST=your_vps_ip_or_domain
DB_PORT=5432
DB_NAME=upstream_db
DB_USER=upstream_user
DB_PASSWORD=your_secure_password

# QRIS Payment Configuration
NEXT_PUBLIC_QRIS_USERNAME=your_qris_username_here

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-GLM3XSXVXX
```

### 2. Next.js Configuration
File `next.config.ts` telah diupdate untuk:
- Menghapus referensi Supabase
- Menambahkan webpack fallbacks untuk Node.js modules
- Menambahkan environment variables PostgreSQL

## 🚀 Deployment

### 1. Production Build
```bash
npm run build
```

### 2. PM2 Setup
```bash
# Install PM2
sudo npm install -g pm2

# Start aplikasi
pm2 start npm --name "upstream" -- start
pm2 startup
pm2 save
```

### 3. Nginx Configuration
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

## 🔒 Security Considerations

### 1. Database Security
- Gunakan password yang kuat untuk database user
- Batasi akses database hanya dari IP yang diperlukan
- Aktifkan SSL untuk koneksi database di production
- Regular database backups

### 2. Application Security
- Environment variables untuk sensitive data
- Prepared statements untuk mencegah SQL injection
- Firewall configuration
- HTTPS dengan SSL certificate

## 📊 Monitoring

### 1. Database Monitoring
```bash
# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# Monitor slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### 2. Application Monitoring
```bash
# PM2 status
pm2 status
pm2 logs upstream

# System resources
htop
df -h
```

## 🐛 Troubleshooting

### 1. Connection Issues
- Periksa firewall settings
- Pastikan PostgreSQL listening pada port yang benar
- Verifikasi credentials database
- Cek network connectivity

### 2. Build Issues
- Pastikan semua dependencies terinstall
- Periksa TypeScript errors
- Verifikasi environment variables

### 3. Runtime Issues
- Cek PM2 logs: `pm2 logs upstream`
- Periksa database connectivity
- Verifikasi API endpoints

## 📈 Performance Optimization

### 1. Database
- Indexes pada kolom yang sering diquery
- Connection pooling
- Query optimization
- Regular VACUUM dan ANALYZE

### 2. Application
- API response caching
- Image optimization
- Code splitting
- CDN untuk static assets

## 🔄 Rollback Plan

Jika perlu rollback ke Supabase:

1. Restore file `lib/supabase.ts`
2. Update dependencies di `package.json`
3. Restore environment variables Supabase
4. Update API routes untuk menggunakan Supabase client
5. Rebuild dan deploy

## 📞 Support

Untuk bantuan lebih lanjut:
- Dokumentasi PostgreSQL: https://www.postgresql.org/docs/
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
- PM2 Documentation: https://pm2.keymetrics.io/docs/

---

**Note**: Migrasi ini memberikan kontrol penuh atas database dan infrastruktur, namun juga memerlukan maintenance yang lebih aktif dibandingkan Supabase.
