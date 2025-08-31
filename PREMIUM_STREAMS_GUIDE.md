# Panduan Stream Premium - Harga Rp 1.000

## Overview
Aplikasi ini memiliki fitur stream premium dengan harga terjangkau Rp 1.000 per stream. Stream premium menawarkan konten eksklusif dengan kualitas tinggi.

## Stream Premium yang Tersedia

### 🎬 Entertainment Premium
- **Judul:** TR Cell Premium News
- **Harga:** Rp 1.000
- **Kategori:** Entertainment
- **Status:** 🔴 LIVE
- **Deskripsi:** Premium news streaming dengan analisis mendalam
- **Thumbnail:** https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop

### 🎵 Music Premium
- **Judul:** TR Cell Premium Music
- **Harga:** Rp 1.000
- **Kategori:** Music
- **Status:** 🔴 LIVE
- **Deskripsi:** Premium music streaming dengan kualitas HD
- **Thumbnail:** https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop

### ⚽ Sports Premium
- **Judul:** TR Cell Premium Sports
- **Harga:** Rp 1.000
- **Kategori:** Sports
- **Status:** 🔴 LIVE
- **Deskripsi:** Premium sports streaming dengan komentar eksklusif
- **Thumbnail:** https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop

## Cara Menambahkan Stream Premium

### Menggunakan Script Otomatis
```bash
./add-stream-with-image.sh "Judul Stream Premium" "kategori" "URL_GAMBAR" "deskripsi" "URL_STREAM" true true 1000
```

**Contoh:**
```bash
./add-stream-with-image.sh "TR Cell Premium News" "entertainment" "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop" "Premium news streaming dengan analisis mendalam" "https://stream.trcell.id/hls/byon2.m3u8" true true 1000
```

### Parameter Penting
- `is_live: true` - Stream live
- `is_paid: true` - Stream berbayar
- `price: 1000` - Harga Rp 1.000

## Cara Melihat Stream Premium

### 1. Menggunakan Script
```bash
# Lihat semua stream premium
./view-streams-by-type.sh paid

# Lihat stream gratis
./view-streams-by-type.sh free

# Lihat semua stream
./view-streams-by-type.sh all
```

### 2. Menggunakan API
```bash
# Lihat stream premium via API
curl "http://localhost:3000/api/streams" | jq '.[] | select(.is_paid == true)'

# Lihat stream gratis via API
curl "http://localhost:3000/api/streams" | jq '.[] | select(.is_paid == false)'
```

### 3. Menggunakan SQL Langsung
```sql
-- Lihat stream premium
SELECT title, category, price, thumbnail 
FROM streams 
WHERE is_paid = true 
ORDER BY price ASC;

-- Lihat stream gratis
SELECT title, category, price, thumbnail 
FROM streams 
WHERE is_paid = false 
ORDER BY created_at DESC;
```

## Statistik Stream Premium

Berdasarkan data saat ini:
- **Total Stream:** 12
- **Stream Gratis:** 7
- **Stream Premium:** 5
- **Stream Live:** 10
- **Harga Minimum:** Rp 1.000
- **Harga Maksimum:** Rp 75.000
- **Harga Rata-rata:** Rp 25.600

## Keunggulan Stream Premium

### 🎯 Konten Eksklusif
- Analisis mendalam
- Komentar eksklusif
- Kualitas HD
- Tanpa iklan

### 💰 Harga Terjangkau
- Hanya Rp 1.000 per stream
- Tidak ada biaya berlangganan
- Bayar per tontonan
- Transaksi aman

### 🔴 Live Streaming
- Konten real-time
- Interaksi langsung
- Update terkini
- Pengalaman immersive

## Implementasi Pembayaran

### QRIS Integration
Stream premium menggunakan sistem pembayaran QRIS untuk kemudahan transaksi:
- Scan QRIS untuk pembayaran
- Konfirmasi otomatis
- Akses langsung setelah pembayaran
- Riwayat transaksi tersimpan

### Database Schema
```sql
-- Tabel payments untuk mencatat transaksi
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

## Best Practices

### 1. Harga Konsisten
- Gunakan harga Rp 1.000 untuk stream premium baru
- Konsisten di semua kategori
- Mudah diingat pengguna

### 2. Kualitas Konten
- Pastikan konten premium berbeda dari free
- Tambahkan nilai tambah
- Fokus pada eksklusivitas

### 3. Thumbnail Menarik
- Gunakan gambar berkualitas tinggi
- Sesuaikan dengan kategori
- Optimasi untuk loading cepat

### 4. Deskripsi Jelas
- Jelaskan keunggulan premium
- Highlight fitur eksklusif
- Buat pengguna tertarik

## Troubleshooting

### Stream Premium Tidak Muncul
1. Cek `is_paid = true` di database
2. Pastikan `price = 1000`
3. Verifikasi `is_visible = true`
4. Restart development server

### Harga Tidak Sesuai
1. Update field `price` di database
2. Cek tipe data integer
3. Pastikan tidak ada format currency

### Thumbnail Tidak Loading
1. Test URL gambar di browser
2. Cek koneksi internet
3. Gunakan CDN yang reliable

## Contoh Penggunaan Lengkap

```bash
# Menambah stream premium entertainment
./add-stream-with-image.sh \
  "TR Cell Premium News" \
  "entertainment" \
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop" \
  "Premium news streaming dengan analisis mendalam" \
  "https://stream.trcell.id/hls/byon2.m3u8" \
  true \
  true \
  1000

# Menambah stream premium music
./add-stream-with-image.sh \
  "TR Cell Premium Music" \
  "music" \
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop" \
  "Premium music streaming dengan kualitas HD" \
  "https://stream.trcell.id/hls/byon2.m3u8" \
  true \
  true \
  1000

# Menambah stream premium sports
./add-stream-with-image.sh \
  "TR Cell Premium Sports" \
  "sports" \
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop" \
  "Premium sports streaming dengan komentar eksklusif" \
  "https://stream.trcell.id/hls/byon2.m3u8" \
  true \
  true \
  1000
```

## Kesimpulan

Stream premium dengan harga Rp 1.000 memberikan:
- ✅ Akses konten eksklusif
- ✅ Harga terjangkau
- ✅ Kualitas tinggi
- ✅ Pengalaman premium
- ✅ Monetisasi yang sustainable
