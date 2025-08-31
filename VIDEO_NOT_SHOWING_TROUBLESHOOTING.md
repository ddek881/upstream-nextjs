# 🎥 Video Not Showing - Troubleshooting Guide

## 🔍 **Masalah: Countdown Berjalan Tapi Video Tidak Muncul**

### **Gejala:**
- ✅ Countdown timer berjalan (7s → 6s → 5s...)
- ❌ Video tidak muncul (layar hitam)
- ⚠️ Loading indicator muncul terus

## 🧪 **Langkah Troubleshooting**

### **1. Periksa Komponen Debug**
Buka `http://localhost:3001` dan lihat komponen "Video Debug Info":
- **HLS.js Supported**: Harus ✅ Yes
- **Video Format Support**: HLS harus ✅
- **Browser**: Periksa browser yang digunakan

### **2. Test Video Player**
Gunakan komponen "Test Video Player":
1. Klik "Test TR Cell Stream"
2. Periksa console untuk error
3. Lihat apakah video muncul

### **3. Periksa Console Browser**
Buka Developer Tools (F12) → Console, cari log:
```javascript
// Yang diharapkan:
"Using HLS.js for: [stream name]"
"HLS manifest parsed for: [stream name]"
"Video load started for: [stream name]"
"Video data loaded for: [stream name]"
"Video can play for: [stream name]"
"Video is playing for: [stream name]"

// Yang tidak diharapkan:
"HLS error for: [stream name] [error details]"
"Video error event for: [stream name]"
```

### **4. Periksa Network Tab**
Developer Tools → Network:
- Cari request ke `stream.trcell.id`
- Status harus 200 OK
- Response harus berisi M3U8 content

## 🔧 **Kemungkinan Penyebab & Solusi**

### **A. CORS Issues**
```
Error: CORS policy blocked
```
**Solusi:**
- Stream server tidak mengizinkan CORS
- Gunakan proxy atau server yang mendukung CORS

### **B. HLS.js Not Loading**
```
Error: HLS.js not available
```
**Solusi:**
```bash
npm install hls.js
npm run dev
```

### **C. Network/Firewall Issues**
```
Error: Network error
```
**Solusi:**
- Periksa koneksi internet
- Coba di network berbeda
- Periksa firewall settings

### **D. Browser Autoplay Policy**
```
Error: Autoplay blocked
```
**Solusi:**
- Video sudah di-set `muted`
- User harus berinteraksi dengan halaman terlebih dahulu

### **E. Stream Server Down**
```
Error: 404 Not Found
```
**Solusi:**
- Stream mungkin down
- Coba stream alternatif

## 🚀 **Quick Fixes**

### **Fix 1: Force Video Display**
```typescript
// Tambahkan style untuk memastikan video terlihat
<video
  ref={videoRef}
  className="w-full h-full object-cover"
  style={{ backgroundColor: 'red' }} // Temporary untuk debug
  autoPlay
  muted
  playsInline
/>
```

### **Fix 2: Add Controls for Debug**
```typescript
<video
  ref={videoRef}
  className="w-full h-full object-cover"
  controls // Tambahkan controls untuk testing
  autoPlay
  muted
  playsInline
/>
```

### **Fix 3: Use MP4 Fallback**
```typescript
// Tambahkan fallback ke MP4
const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

if (Hls.isSupported()) {
  // Use HLS
} else {
  // Use MP4 fallback
  video.src = fallbackUrl
}
```

### **Fix 4: Debug HLS.js**
```typescript
// Enable HLS.js debug mode
hlsRef.current = new Hls({
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90,
  debug: true, // Enable debug
  verbose: true // More verbose logging
})
```

## 📱 **Testing Checklist**

- [ ] **Debug Info**: HLS.js supported = Yes
- [ ] **Test Video**: Video player bisa memutar stream
- [ ] **Console Logs**: Tidak ada error di console
- [ ] **Network**: Request video berhasil (200 OK)
- [ ] **Loading State**: Loading indicator hilang
- [ ] **Video Ready**: Video benar-benar terlihat

## 🔍 **Advanced Debugging**

### **1. Check HLS.js Version**
```javascript
import Hls from 'hls.js'
console.log('HLS.js version:', Hls.version)
```

### **2. Test Stream URL Manual**
```bash
# Test TR Cell Stream
curl -I "https://stream.trcell.id/hls/byon2.m3u8"

# Test Mux Stream
curl -I "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
```

### **3. Browser Compatibility**
- **Chrome**: ✅ HLS.js support
- **Firefox**: ✅ HLS.js support
- **Safari**: ✅ Native HLS support
- **Edge**: ✅ HLS.js support

### **4. Mobile Testing**
- Test di mobile browser
- Periksa autoplay policy di mobile
- Test di Safari iOS

## 🎯 **Expected Behavior**

### **Sukses:**
1. Klik "Free Trial 7s"
2. Loading indicator muncul
3. Video mulai load
4. Video muncul dan mulai play
5. Countdown 7 detik berjalan
6. Setelah 7 detik → redirect ke payment

### **Error (tetap countdown berjalan):**
1. Klik "Free Trial 7s"
2. Loading indicator muncul
3. Error message muncul
4. Countdown tetap berjalan
5. Setelah 7 detik → redirect ke payment

## 📞 **Next Steps**

Jika masalah masih berlanjut:
1. Periksa console untuk error details
2. Test dengan komponen debug yang disediakan
3. Coba di browser berbeda
4. Periksa network tab untuk request status
5. Test dengan stream URL alternatif

---

**Status**: 🔧 Troubleshooting Guide Ready  
**Last Updated**: January 2025
