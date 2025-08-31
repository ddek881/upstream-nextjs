# UpStream - Platform Streaming Langsung

Platform streaming langsung untuk acara pilihan dengan kualitas HD. Dibangun dengan Next.js 14+ dan App Router.

## 🚀 Fitur Utama

- **Video Streaming**: HLS video player dengan kualitas HD
- **Live Stream Detection**: Real-time status monitoring
- **Payment System**: QRIS integration untuk stream premium
- **Free Trial**: 7 detik gratis untuk stream berbayar
- **Multi-device Support**: Responsive design untuk semua device
- **Admin Dashboard**: Panel admin untuk manajemen konten
- **Category Management**: Kategori dan subkategori dinamis

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ dengan App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (VPS)
- **Video Player**: HLS.js
- **Payment**: QRIS integration
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd upstream-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Buat file `.env.local` di root project:
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

4. **Setup Database**
   - Install PostgreSQL di VPS Anda
   - Jalankan schema SQL dari `database/schema.sql`
   - Lihat `setup-postgresql.md` untuk panduan lengkap

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Buka [http://localhost:3000](http://localhost:3000)

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

## 📁 Project Structure

```
upstream-nextjs/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── stream/            # Stream pages
│   ├── category/          # Category pages
│   ├── admin/             # Admin pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── admin/            # Admin components
│   ├── HLSPlayer.tsx     # Video player
│   ├── StreamCard.tsx    # Stream display card
│   ├── Header.tsx        # Navigation header
│   ├── StarField.tsx     # Background animation
│   └── FloatingSocialBubbles.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   └── database.ts       # PostgreSQL client
├── data/                 # Static data and utilities
│   └── streams.ts        # Stream data management
├── database/             # Database files
│   └── schema.sql        # PostgreSQL schema
└── public/               # Static assets
```

## 🎨 Komponen Utama

### HLSPlayer
Video player dengan HLS.js untuk streaming video dengan kualitas HD.

### StreamCard
Card untuk menampilkan informasi stream dengan thumbnail, status live, dan harga.

### StarField
Background animation dengan efek bintang bergerak.

### Header
Navigation header dengan menu kategori dan link admin.

## 🔧 Konfigurasi

### Next.js Config
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'api-stream.com',
      'i0.wp.com'
    ],
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    NEXT_PUBLIC_QRIS_USERNAME: process.env.NEXT_PUBLIC_QRIS_USERNAME,
  }
}
```

### Tailwind CSS
Menggunakan Tailwind CSS untuk styling dengan custom color palette:
- Primary: Orange (#f97316) dan Yellow (#eab308)
- Background: Slate (#0f172a, #1e293b, #334155)
- Status: Red (live), Green (free), Blue (upcoming), Purple (premium)

## 🚀 Deployment

### VPS Setup
```bash
# Install Node.js dan PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib

# Setup database
sudo -u postgres psql
CREATE DATABASE upstream_db;
CREATE USER upstream_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE upstream_db TO upstream_user;
\q

# Jalankan schema
psql -h localhost -U upstream_user -d upstream_db -f database/schema.sql
```

### Production Deployment
```bash
# Build aplikasi
npm run build

# Install PM2
sudo npm install -g pm2

# Start dengan PM2
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

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Security

- Database connection dengan SSL di production
- Prepared statements untuk mencegah SQL injection
- Environment variables untuk sensitive data
- Firewall configuration
- Regular database backups

## 📊 Analytics

- Google Analytics integration
- Database performance monitoring
- Error tracking dan logging

## 📚 Documentation

- [Setup PostgreSQL](setup-postgresql.md) - Panduan lengkap setup database
- [API Documentation](docs/api.md) - Dokumentasi API endpoints
- [Deployment Guide](docs/deployment.md) - Panduan deployment ke production

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau hubungi tim development.
