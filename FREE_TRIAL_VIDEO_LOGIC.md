# 🎥 Free Trial Video Logic - Countdown After Video Plays

## 🎯 **Perubahan Logika Free Trial**

### **Sebelumnya:**
- Countdown langsung berjalan setelah klik "Uji Coba 7s"
- Video loading dan countdown berjalan bersamaan
- User bisa kehilangan waktu trial meskipun video belum muncul

### **Sekarang:**
- Video dimuat terlebih dahulu dengan HLS.js
- Countdown **HANYA** dimulai setelah video benar-benar mulai playing
- User mendapat full 7 detik trial setelah video berjalan

## 🔄 **Flow Baru:**

### **1. Klik "Uji Coba 7s"**
```typescript
// Reset semua state
setIsTrialActive(true)
setVideoLoading(true)
setVideoReady(false)
setVideoPlaying(false) // ← Penting: video belum playing
```

### **2. Load Video dengan HLS.js**
```typescript
// HLS.js events
hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
  video.play() // Coba play video
})

// Video events
const handlePlaying = () => {
  setVideoPlaying(true) // ← Video mulai playing
  if (!countdownRef.current) {
    startCountdown() // ← Countdown dimulai
  }
}
```

### **3. Countdown Hanya Setelah Video Playing**
```typescript
// Timer overlay - hanya muncul jika video playing
{trialTimeLeft !== null && trialTimeLeft > 0 && videoPlaying && (
  <div className="timer-overlay">
    {formatTime(trialTimeLeft)}
  </div>
)}
```

## 📊 **State Management:**

### **Video States:**
- `videoLoading`: Video sedang dimuat
- `videoReady`: Video siap untuk diputar
- `videoPlaying`: Video sedang playing ← **Trigger countdown**
- `videoError`: Video gagal dimuat

### **Trial States:**
- `isTrialActive`: Trial sedang aktif
- `trialTimeLeft`: Sisa waktu trial (hanya aktif jika video playing)
- `useFallback`: Menggunakan video fallback

## 🎬 **Video Loading Process:**

### **HLS Stream (Primary):**
1. **Load HLS.js** → `videoLoading = true`
2. **Parse Manifest** → `videoReady = true`
3. **Start Playing** → `videoPlaying = true` → **Start Countdown**
4. **Error Handling** → Fallback ke MP4

### **Fallback MP4:**
1. **Load MP4** → `videoLoading = true`
2. **Start Playing** → `videoPlaying = true` → **Start Countdown**

## 🔧 **Error Handling:**

### **HLS Error:**
```typescript
const handleError = (e: any) => {
  setVideoError(true)
  setVideoPlaying(false) // ← Pastikan video playing = false
  
  // Try fallback after 3 seconds
  setTimeout(() => {
    if (isTrialActive && !videoPlaying) {
      tryFallbackVideo()
    }
  }, 3000)
}
```

### **Fallback Success:**
```typescript
video.play().then(() => {
  setVideoPlaying(true) // ← Video fallback playing
  startCountdown() // ← Start countdown
})
```

## 🎯 **UI Feedback:**

### **Loading State:**
```
"Memuat video..." + Loading spinner
```

### **Error State:**
```
"Video tidak tersedia" + "Mencoba alternatif..."
```

### **Playing State:**
```
"Free Trial" + Timer countdown
```

### **Starting State:**
```
"Memulai video..." (antara ready dan playing)
```

## ✅ **Benefits:**

1. **Fair Trial**: User mendapat full 7 detik setelah video berjalan
2. **Better UX**: Tidak ada countdown yang sia-sia
3. **HLS Support**: Menggunakan HLS.js untuk live streams
4. **Fallback System**: Auto fallback ke MP4 jika HLS gagal
5. **Clear Feedback**: Status video yang jelas untuk user

## 🚀 **Expected Behavior:**

1. **Klik "Uji Coba 7s"** → Video mulai loading
2. **Video Loading** → "Memuat video..." + spinner
3. **Video Playing** → "Free Trial" + countdown 7s
4. **Countdown Finish** → Redirect ke payment

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
