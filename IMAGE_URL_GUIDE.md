# Panduan Penggunaan URL Gambar untuk Thumbnail Stream

## Overview
Aplikasi ini menggunakan URL gambar untuk thumbnail stream, bukan file upload. Ini membuat sistem lebih sederhana dan cepat.

## Cara Menambahkan Stream dengan URL Gambar

### 1. Menggunakan Script Otomatis
```bash
./add-stream-with-image.sh "Judul Stream" "kategori" "URL_GAMBAR" "deskripsi" "URL_STREAM" [is_live] [is_paid] [price]
```

**Contoh:**
```bash
./add-stream-with-image.sh "TR Cell News Live" "entertainment" "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop" "Live news streaming dari TR Cell" "https://stream.trcell.id/hls/byon2.m3u8" true false 0
```

### 2. Menggunakan SQL Langsung
```sql
INSERT INTO streams (title, category, thumbnail, is_live, is_visible, url, description, is_paid, price, scheduled_time, estimated_duration)
VALUES (
    'Judul Stream',
    'kategori',
    'https://example.com/image.jpg',
    true,
    true,
    'https://stream-url.m3u8',
    'Deskripsi stream',
    false,
    0,
    now()::text,
    '2 hours'
);
```

## Sumber URL Gambar yang Direkomendasikan

### 1. Unsplash (Gratis)
- **Format:** `https://images.unsplash.com/photo-[ID]?w=400&h=225&fit=crop`
- **Contoh:** `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop`
- **Keuntungan:** Gratis, kualitas tinggi, optimasi otomatis

### 2. Pexels (Gratis)
- **Format:** `https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?w=400&h=225&fit=crop`
- **Contoh:** `https://images.pexels.com/photos/3807755/pexels-photo-3807755.jpeg?w=400&h=225&fit=crop`

### 3. Pixabay (Gratis)
- **Format:** `https://cdn.pixabay.com/photo/[path]/[filename]?w=400&h=225&fit=crop`

### 4. URL Sendiri
- Upload gambar ke hosting sendiri (AWS S3, Cloudinary, dll)
- **Contoh:** `https://your-domain.com/images/stream-thumbnail.jpg`

## Parameter Optimasi Gambar

### Unsplash Parameters
- `w=400` - Lebar 400px
- `h=225` - Tinggi 225px (16:9 ratio)
- `fit=crop` - Crop gambar ke ukuran yang ditentukan
- `q=80` - Kualitas 80% (opsional)

### Contoh URL Optimasi
```bash
# Thumbnail kecil
https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop

# Thumbnail dengan kualitas tinggi
https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop&q=90

# Thumbnail untuk mobile
https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=112&fit=crop
```

## Kategori Gambar yang Sesuai

### Entertainment
- News, talk shows, variety shows
- **URL Contoh:** `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop`

### Music
- Concerts, music videos, performances
- **URL Contoh:** `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop`

### Sports
- Football, basketball, tennis, etc.
- **URL Contoh:** `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop`

## Best Practices

### 1. Ukuran Gambar
- **Rasio:** 16:9 (400x225px)
- **Format:** JPG atau WebP
- **Ukuran file:** < 100KB

### 2. Kualitas
- Gunakan parameter optimasi dari provider
- Test loading speed
- Pastikan gambar responsive

### 3. Backup
- Simpan URL gambar di database
- Gunakan CDN untuk performa lebih baik
- Siapkan fallback image

## Troubleshooting

### Gambar Tidak Muncul
1. Cek URL apakah valid
2. Test di browser
3. Pastikan tidak ada CORS issues
4. Cek koneksi internet

### Gambar Lambat Loading
1. Gunakan parameter optimasi
2. Pilih provider CDN yang cepat
3. Kompres gambar
4. Gunakan format WebP

### Gambar Terlalu Besar
1. Gunakan parameter resize
2. Pilih gambar dengan resolusi yang sesuai
3. Kompres sebelum upload

## Contoh Penggunaan Lengkap

```bash
# Menambah stream entertainment
./add-stream-with-image.sh \
  "News Live Streaming" \
  "entertainment" \
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop" \
  "Live news streaming dengan berita terkini" \
  "https://stream.example.com/news.m3u8" \
  true \
  false \
  0

# Menambah stream musik premium
./add-stream-with-image.sh \
  "Premium Concert Live" \
  "music" \
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop" \
  "Konser premium dengan artis ternama" \
  "https://stream.example.com/concert.m3u8" \
  true \
  true \
  50000
```

## Kesimpulan
Dengan menggunakan URL gambar, Anda dapat:
- ✅ Menambah stream dengan cepat
- ✅ Tidak perlu upload file
- ✅ Menggunakan gambar berkualitas tinggi
- ✅ Optimasi otomatis dari provider
- ✅ Hemat storage server
