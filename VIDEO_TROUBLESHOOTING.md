# 🎥 Video Troubleshooting Guide

## 🔍 **Masalah: Video Tidak Berjalan**

### **Langkah Troubleshooting:**

#### 1. **Test Video dengan Komponen Test**
- Buka `http://localhost:3001`
- Lihat komponen "Test Video Player" di pojok kanan bawah
- Klik "Test TR Cell Stream" atau "Test Test Stream"
- Periksa console browser untuk error messages

#### 2. **Periksa Console Browser**
Buka Developer Tools (F12) dan lihat tab Console untuk error:
```javascript
// Error yang mungkin muncul:
- "Video load started"
- "Video data loaded" 
- "Video can play"
- "Video is playing"
- "Video error: [error details]"
```

#### 3. **Test URL Video Manual**
```bash
# Test TR Cell Stream
curl -I "https://stream.trcell.id/hls/byon2.m3u8"

# Test Mux Stream  
curl -I "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
```

#### 4. **Kemungkinan Penyebab & Solusi**

##### **A. CORS Issues**
```
Error: CORS policy blocked
```
**Solusi:**
- Stream server perlu mengizinkan CORS
- Gunakan proxy atau server yang mendukung CORS

##### **B. HLS Format Issues**
```
Error: HLS not supported
```
**Solusi:**
- Browser mungkin tidak mendukung HLS natively
- Gunakan library seperti `hls.js` untuk fallback

##### **C. Network Issues**
```
Error: Network error
```
**Solusi:**
- Periksa koneksi internet
- Stream mungkin down atau tidak tersedia

##### **D. Browser Autoplay Policy**
```
Error: Autoplay blocked
```
**Solusi:**
- Video sudah di-set `muted` untuk bypass autoplay policy
- User perlu berinteraksi dengan halaman terlebih dahulu

#### 5. **Implementasi HLS.js (Jika Diperlukan)**

Jika browser tidak mendukung HLS natively, install dan gunakan `hls.js`:

```bash
npm install hls.js
```

```typescript
import Hls from 'hls.js'

// In video component
useEffect(() => {
  const video = videoRef.current
  if (!video) return

  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.loadSource(stream.url)
    hls.attachMedia(video)
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    video.src = stream.url
  }
}, [stream.url])
```

#### 6. **Fallback Video Sources**

Jika stream utama tidak bekerja, gunakan fallback:

```typescript
const fallbackVideos = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
]
```

#### 7. **Debug Mode**

Aktifkan debug mode untuk melihat detail error:

```typescript
const DEBUG = true

if (DEBUG) {
  console.log('Video URL:', stream.url)
  console.log('Browser:', navigator.userAgent)
  console.log('HLS Support:', Hls.isSupported())
}
```

## 🧪 **Testing Checklist**

- [ ] **Test Countdown**: Komponen test countdown bekerja
- [ ] **Test Video**: Komponen test video bisa memutar stream
- [ ] **Console Logs**: Tidak ada error di console
- [ ] **Network Tab**: Request video berhasil (200 OK)
- [ ] **Autoplay**: Video bisa autoplay dengan muted
- [ ] **Error Handling**: Error message muncul jika video gagal

## 🚀 **Quick Fixes**

### **Fix 1: Simple Video Player**
```typescript
<video
  src={stream.url}
  autoPlay
  muted
  playsInline
  controls // Tambahkan controls untuk testing
/>
```

### **Fix 2: Error Boundary**
```typescript
{videoError ? (
  <div className="video-error">
    <p>Video tidak dapat diputar</p>
    <p>Countdown tetap berjalan...</p>
  </div>
) : (
  <video ... />
)}
```

### **Fix 3: Multiple Sources**
```typescript
<video autoPlay muted playsInline>
  <source src={stream.url} type="application/x-mpegURL" />
  <source src={fallbackUrl} type="video/mp4" />
  Your browser does not support video.
</video>
```

## 📞 **Support**

Jika masalah masih berlanjut:
1. Periksa console browser untuk error details
2. Test dengan komponen test yang disediakan
3. Periksa network tab untuk request status
4. Coba di browser berbeda (Chrome, Firefox, Safari)

---

**Status**: 🔧 Troubleshooting Guide Ready  
**Last Updated**: January 2025
