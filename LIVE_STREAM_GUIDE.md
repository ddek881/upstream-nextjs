# 🎥 Live Stream Guide - UpStream

## 📡 Stream URL yang Digunakan

**URL Stream Live**: `https://stream.trcell.id/hls/byon2.m3u8`

Stream ini menggunakan format HLS (HTTP Live Streaming) yang kompatibel dengan HLS.js player di aplikasi UpStream.

## 🚀 Cara Menambah Stream Live Baru

### 1. Menggunakan Script Otomatis

```bash
# Format: ./add-live-stream.sh "Judul Stream" "Kategori" "Deskripsi"
./add-live-stream.sh "TR Cell News Live" "entertainment" "Live news streaming dari TR Cell"
./add-live-stream.sh "TR Cell Music Live" "music" "Live music streaming dari TR Cell"
./add-live-stream.sh "TR Cell Sports Live" "sports" "Live sports streaming dari TR Cell"
```

### 2. Manual via Database

```bash
# Masuk ke database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql upstream_db

# Tambah stream baru
INSERT INTO streams (
  title, 
  category, 
  thumbnail, 
  is_live, 
  is_visible, 
  url, 
  description, 
  is_paid, 
  price, 
  scheduled_time, 
  estimated_duration
) VALUES (
  'Judul Stream Anda',
  'entertainment',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
  true,
  true,
  'https://stream.trcell.id/hls/byon2.m3u8',
  'Deskripsi stream Anda',
  false,
  0,
  '2025-01-15T20:00',
  'Live'
);
```

## 📊 Streams yang Tersedia

Saat ini ada **6 stream live** di database:

| Judul | Kategori | Status |
|-------|----------|--------|
| TR Cell News Live | Entertainment | 🔴 Live |
| TR Cell Sports Live | Sports | 🔴 Live |
| TR Cell Live Music | Music | 🔴 Live |
| Live Stream TR Cell | Entertainment | 🔴 Live |
| Live Streaming Event 1 | Entertainment | 🔴 Live |
| Sports Championship | Sports | 🔴 Live |

## 🎯 Cara Menggunakan

### 1. Lihat Semua Stream Live
- Buka http://localhost:3000
- Klik tab "Live Sekarang"
- Semua stream live akan ditampilkan

### 2. Tonton Stream Individual
- Klik pada stream card
- Akan dibuka halaman stream dengan HLS player
- Stream akan otomatis mulai (autoPlay)

### 3. Filter berdasarkan Kategori
- Klik kategori di header (Entertainment, Music, Sports)
- Atau gunakan filter di halaman kategori

### 4. Admin Panel
- Buka http://localhost:3000/admin
- Lihat semua streams dalam tabel
- Monitor status live streams

## 🔧 Konfigurasi Stream

### Parameter Stream
- **URL**: `https://stream.trcell.id/hls/byon2.m3u8`
- **Format**: HLS (.m3u8)
- **Quality**: HD
- **Latency**: Low latency mode enabled
- **AutoPlay**: Enabled untuk live streams

### HLS Player Settings
```javascript
// Konfigurasi HLS.js di HLSPlayer.tsx
const hlsConfig = {
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90
}
```

## 📱 Testing Stream

### 1. Test di Browser
```bash
# Buka aplikasi
open http://localhost:3000

# Test stream individual
open http://localhost:3000/stream?id=STREAM_ID
```

### 2. Test API Endpoints
```bash
# Semua streams
curl http://localhost:3000/api/streams

# Live streams only
curl http://localhost:3000/api/streams?type=live

# Stream by ID
curl http://localhost:3000/api/streams/STREAM_ID
```

### 3. Test Database
```bash
# Lihat semua live streams
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql upstream_db -c "SELECT title, category, is_live FROM streams WHERE is_live = true;"
```

## 🛠️ Troubleshooting

### Stream Tidak Muncul
1. Cek apakah stream sudah ditambahkan ke database
2. Refresh browser (Ctrl+F5)
3. Cek console browser untuk error
4. Pastikan development server running

### Stream Tidak Play
1. Cek koneksi internet
2. Pastikan URL stream valid
3. Cek browser console untuk HLS error
4. Test URL stream di browser lain

### Database Error
1. Pastikan PostgreSQL running: `brew services start postgresql@15`
2. Cek koneksi database: `psql upstream_db`
3. Restart development server: `npm run dev`

## 🎨 Customization

### Tambah Thumbnail Custom
```sql
UPDATE streams 
SET thumbnail = 'https://your-custom-image.jpg' 
WHERE title = 'Judul Stream';
```

### Ubah Kategori
```sql
UPDATE streams 
SET category = 'new_category' 
WHERE title = 'Judul Stream';
```

### Set Stream Premium
```sql
UPDATE streams 
SET is_paid = true, price = 50000 
WHERE title = 'Judul Stream';
```

## 📈 Monitoring

### Database Monitoring
```bash
# Monitor live streams
psql upstream_db -c "SELECT COUNT(*) as live_count FROM streams WHERE is_live = true;"

# Monitor by category
psql upstream_db -c "SELECT category, COUNT(*) FROM streams WHERE is_live = true GROUP BY category;"
```

### Application Monitoring
- Cek logs development server
- Monitor API response times
- Cek browser console untuk errors

## 🔄 Update Stream

### Ganti URL Stream
```sql
UPDATE streams 
SET url = 'https://new-stream-url.m3u8' 
WHERE title = 'Judul Stream';
```

### Update Status Live
```sql
-- Set stream live
UPDATE streams SET is_live = true WHERE title = 'Judul Stream';

-- Set stream offline
UPDATE streams SET is_live = false WHERE title = 'Judul Stream';
```

## 🎯 Best Practices

1. **Naming Convention**: Gunakan nama yang deskriptif
2. **Categories**: Gunakan kategori yang konsisten
3. **Thumbnails**: Gunakan gambar yang relevan
4. **Descriptions**: Berikan deskripsi yang informatif
5. **Testing**: Selalu test stream sebelum deploy

## 📞 Support

Jika ada masalah dengan stream:
1. Cek status stream TR Cell
2. Verifikasi URL stream
3. Test di browser lain
4. Cek logs aplikasi

---

**Note**: Stream live menggunakan URL dari TR Cell (`https://stream.trcell.id/hls/byon2.m3u8`) yang sudah terkonfigurasi untuk HLS streaming dengan kualitas HD.
