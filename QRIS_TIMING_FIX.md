# ⏰ QRIS Timing Fix - Stream Data Loading Issue

## 🚨 **Masalah: 400 Bad Request - Stream ID dan amount diperlukan**

### **Error yang Muncul:**
```
POST http://localhost:3001/api/generate-qris 400 (Bad Request)
Failed to generate QRIS: {error: 'Stream ID dan amount diperlukan'}
```

## 🔍 **Root Cause Analysis:**

### **1. Timing Issue:**
- `generateQRIS()` dipanggil bersamaan dengan `fetchStream()`
- `stream?.price` masih `null` karena data belum ter-load
- API menerima `amount: 0` yang dianggap invalid

### **2. Code Flow Problem:**
```typescript
// ❌ MASALAH: Dipanggil bersamaan
useEffect(() => {
  if (streamId) {
    fetchStream()     // Async - belum selesai
    generateQRIS()    // stream masih null
    startPaymentTimer()
  }
}, [streamId])
```

## ✅ **Solusi yang Diimplementasi:**

### **1. Separate useEffect untuk QRIS Generation:**
```typescript
// ✅ SOLUSI: Tunggu stream data ter-load
useEffect(() => {
  if (streamId) {
    fetchStream()
    startPaymentTimer()
  }
}, [streamId])

useEffect(() => {
  // Generate QRIS setelah stream data ter-load
  if (stream && stream.price) {
    generateQRIS()
  }
}, [stream])
```

### **2. Proper Data Validation:**
```typescript
const generateQRIS = async () => {
  try {
    const requestBody = {
      streamId: streamId,
      amount: stream?.price || 0  // Sekarang stream.price sudah ada
    }
    
    const response = await fetch('/api/generate-qris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const data = await response.json()
      setQrCode(data.data.qrCode)
      localStorage.setItem('currentTrxId', data.data.trxId)
    } else {
      const errorData = await response.json()
      console.error('Failed to generate QRIS:', errorData)
    }
  } catch (error) {
    console.error('Error generating QRIS:', error)
  }
}
```

## 🔄 **Flow yang Benar:**

### **1. Payment Page Load**
```
useEffect([streamId]) → fetchStream() → setStream(data)
```

### **2. Stream Data Loaded**
```
useEffect([stream]) → generateQRIS() → QR code muncul
```

### **3. QRIS Generation**
```
stream.price = 1000 → API call → QR code display
```

## 📊 **Data Flow:**

### **Before Fix:**
```
1. Page load → streamId = "4"
2. fetchStream() → async (belum selesai)
3. generateQRIS() → stream = null, price = 0 ❌
4. API error → 400 Bad Request
```

### **After Fix:**
```
1. Page load → streamId = "4"
2. fetchStream() → async
3. Stream data loaded → stream = {price: 1000}
4. useEffect([stream]) triggered
5. generateQRIS() → stream.price = 1000 ✅
6. QR code generated → Success
```

## 🎯 **Benefits:**

### **✅ Proper Timing:**
- QRIS generation menunggu stream data
- Tidak ada race condition
- Reliable data flow

### **✅ Better Error Handling:**
- Valid data sebelum API call
- Clear error messages
- Graceful fallbacks

### **✅ User Experience:**
- QR code muncul setelah data ready
- No loading errors
- Smooth payment flow

## 🚀 **Expected Behavior:**

### **Success Flow:**
1. **Page Load** → Loading spinner
2. **Stream Data** → "Upstream Premium Sports" loaded
3. **QRIS Generation** → QR code muncul
4. **Payment Ready** → Timer 20 menit dimulai

### **Error Prevention:**
1. **No premature calls** → QRIS hanya setelah data ready
2. **Valid amount** → stream.price selalu valid
3. **Proper validation** → API menerima data yang benar

## 🔧 **Technical Details:**

### **useEffect Dependencies:**
```typescript
// Load stream data
useEffect(() => {
  if (streamId) {
    fetchStream()
    startPaymentTimer()
  }
}, [streamId]) // Dependency: streamId

// Generate QRIS after stream loaded
useEffect(() => {
  if (stream && stream.price) {
    generateQRIS()
  }
}, [stream]) // Dependency: stream object
```

### **Data Validation:**
```typescript
// Ensure stream data exists
if (stream && stream.price) {
  generateQRIS() // Only call when data is ready
}
```

---

**Status**: ✅ FIXED  
**Priority**: HIGH  
**Last Updated**: January 2025
