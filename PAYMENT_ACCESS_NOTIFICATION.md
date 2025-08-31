# 🔐 Payment Access Notification - Upstream Streaming

## 🎯 **Fitur Notifikasi Akses yang Sudah Ada**

### **Masalah yang Dipecahkan:**
- User yang sudah memiliki akses mencoba bayar lagi
- Error message yang tidak user-friendly
- Tidak ada redirect otomatis ke stream

### **Solusi yang Diimplementasikan:**
- ✅ **Deteksi Akses Otomatis**: Check apakah user sudah punya akses
- ✅ **Notifikasi User-Friendly**: Tampilkan pesan yang jelas
- ✅ **Redirect Otomatis**: Arahkan langsung ke stream
- ✅ **UI yang Menarik**: Design yang modern dan informatif

## 🔄 **Flow Notifikasi Akses:**

### **Step 1: User Klik "Bayar"**
```
User → Klik "Bayar" → /payment?streamId=2
```

### **Step 2: Generate QRIS**
```
API → POST /api/generate-qris
```

### **Step 3: Check Existing Access**
```javascript
// Jika user sudah punya akses
if (errorData.error === 'Anda sudah memiliki akses untuk stream ini') {
  setAlreadyHasAccess(true)
  setErrorMessage('')
}
```

### **Step 4: Tampilkan Notifikasi**
```
👑 Anda Sudah Memiliki Akses!
   → Detail stream
   → Button "Tonton Stream Sekarang"
   → Button "Kembali ke Beranda"
```

## 🎨 **UI Components:**

### **1. Already Has Access Screen:**
```jsx
// Jika user sudah memiliki akses
if (alreadyHasAccess) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700">
        <div className="mb-6">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-2xl font-bold mb-2">Anda Sudah Memiliki Akses!</h1>
          <p className="text-gray-400 mb-6">
            Anda sudah membayar untuk stream ini dan memiliki akses premium.
          </p>
        </div>

        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-400 mb-2">{stream.title}</h2>
          <p className="text-sm text-gray-300">{stream.description}</p>
        </div>

        <div className="space-y-4">
          <Link
            href={`/stream?id=${streamId}`}
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            🎬 Tonton Stream Sekarang
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Status: <span className="text-green-400">Akses Aktif</span></p>
          <p>Stream ID: {streamId}</p>
        </div>
      </div>
    </div>
  )
}
```

### **2. Error Handling:**
```jsx
// Jika ada error
if (errorMessage) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700">
        <div className="mb-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-red-400 mb-6">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 **State Management:**

### **New States:**
```typescript
const [alreadyHasAccess, setAlreadyHasAccess] = useState(false)
const [errorMessage, setErrorMessage] = useState('')
```

### **Conditional Logic:**
```typescript
// Generate QRIS hanya jika belum punya akses
useEffect(() => {
  if (stream && stream.price && !alreadyHasAccess) {
    generateQRIS()
  }
}, [stream, alreadyHasAccess])

// Timer hanya jika belum punya akses
useEffect(() => {
  if (timeLeft > 0 && paymentStatus === 'pending' && !alreadyHasAccess) {
    // Timer logic
  }
}, [timeLeft, paymentStatus, alreadyHasAccess])
```

## 🎯 **Error Handling:**

### **QRIS Generation Error:**
```typescript
const generateQRIS = async () => {
  try {
    const response = await fetch('/api/generate-qris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const data = await response.json()
      setQrCode(data.data.qrCode)
      localStorage.setItem('currentTrxId', data.data.trxId)
      localStorage.setItem('currentSessionId', data.data.sessionId)
      setErrorMessage('')
    } else {
      const errorData = await response.json()
      console.error('Failed to generate QRIS:', errorData)
      
      // Check if user already has access
      if (errorData.error === 'Anda sudah memiliki akses untuk stream ini') {
        setAlreadyHasAccess(true)
        setErrorMessage('')
      } else {
        setErrorMessage(errorData.error || 'Gagal generate QRIS')
      }
    }
  } catch (error) {
    console.error('Error generating QRIS:', error)
    setErrorMessage('Error generating QRIS')
  }
}
```

## 🎨 **Design Features:**

### **1. Crown Icon (👑):**
- Menunjukkan status premium
- Visual yang menarik
- Konsisten dengan branding

### **2. Green Accent:**
- Warna hijau untuk status aktif
- Border dan background yang subtle
- Highlight informasi penting

### **3. Gradient Buttons:**
- Blue to purple gradient untuk CTA
- Hover effects yang smooth
- Scale transform pada hover

### **4. Status Information:**
- Stream ID untuk debugging
- Status akses yang jelas
- Informasi yang relevan

## 🔄 **User Experience Flow:**

### **Scenario 1: User Sudah Punya Akses**
1. **Klik "Bayar"** → `/payment?streamId=2`
2. **Generate QRIS** → Error: "Anda sudah memiliki akses"
3. **Deteksi Error** → Set `alreadyHasAccess = true`
4. **Tampilkan UI** → Crown icon + "Anda Sudah Memiliki Akses!"
5. **Button CTA** → "🎬 Tonton Stream Sekarang"
6. **Redirect** → `/stream?id=2`

### **Scenario 2: User Belum Punya Akses**
1. **Klik "Bayar"** → `/payment?streamId=2`
2. **Generate QRIS** → Success
3. **Tampilkan QR Code** → Normal payment flow
4. **User Scan QR** → Payment process
5. **Success** → Redirect to stream

## 🎯 **Benefits:**

### **1. User Experience:**
- ✅ Tidak ada error yang membingungkan
- ✅ Pesan yang jelas dan informatif
- ✅ Redirect otomatis ke stream
- ✅ UI yang menarik dan modern

### **2. Technical:**
- ✅ Error handling yang robust
- ✅ State management yang clean
- ✅ Conditional rendering yang tepat
- ✅ Performance yang optimal

### **3. Business:**
- ✅ Mengurangi confusion user
- ✅ Meningkatkan conversion rate
- ✅ User satisfaction yang tinggi
- ✅ Brand experience yang konsisten

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
