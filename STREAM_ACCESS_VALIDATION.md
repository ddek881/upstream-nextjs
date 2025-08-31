# 🔐 Stream Access Validation - Redirect & Session Check

## 🎯 **Sistem Validasi Akses Stream dengan Redirect**

### **Konsep:**
- Validasi session berdasarkan stream ID
- Redirect otomatis setelah payment berhasil
- Popup warning untuk user yang belum bayar
- URL manipulation protection

## 🔧 **Implementasi:**

### **1. Stream Page Validation:**
```typescript
// Check payment access on mount
useEffect(() => {
  if (streamId) {
    const fetchStream = async () => {
      const foundStream = await getStreamById(streamId)
      setStream(foundStream)
      
      // Check payment access if stream is paid
      if (foundStream?.is_paid) {
        await checkPaymentAccess(foundStream.id)
      }
    }
    fetchStream()
  }
}, [streamId])
```

### **2. Payment Access Check:**
```typescript
const checkPaymentAccess = async (streamId: string) => {
  try {
    setCheckingAccess(true)
    const sessionId = localStorage.getItem('currentSessionId')
    
    if (sessionId) {
      const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${streamId}`)
      if (response.ok) {
        const data = await response.json()
        setHasPaidAccess(data.data.hasAccess)
        
        // If user doesn't have access, show popup
        if (!data.data.hasAccess) {
          setShowPaymentPopup(true)
        }
      } else {
        setHasPaidAccess(false)
        setShowPaymentPopup(true)
      }
    } else {
      setHasPaidAccess(false)
      setShowPaymentPopup(true)
    }
  } catch (error) {
    setHasPaidAccess(false)
    setShowPaymentPopup(true)
  } finally {
    setCheckingAccess(false)
  }
}
```

### **3. Payment Success Redirect:**
```typescript
if (data.data.status === 'paid') {
  setPaymentStatus('paid')
  checkAccess()
  window.dispatchEvent(new CustomEvent('payment-success'))
  // Redirect to stream page after 2 seconds
  setTimeout(() => {
    window.location.href = `/stream?id=${streamId}`
  }, 2000)
}
```

## 🎨 **UI Components:**

### **1. Payment Access Popup:**
```typescript
{showPaymentPopup && stream.is_paid && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Akses Dibatasi</h2>
        <p className="text-slate-300 text-sm">
          Anda belum melakukan pembayaran untuk stream ini
        </p>
      </div>
      
      <div className="space-y-4">
        <button onClick={handlePaymentRedirect}>
          Bayar Sekarang
        </button>
        <button onClick={handleHomeRedirect}>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </div>
)}
```

### **2. Video Player Protection:**
```typescript
{stream.is_paid && !hasPaidAccess ? (
  <div className="aspect-video bg-slate-800 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Crown className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Stream Premium</h3>
      <p className="text-slate-400 text-sm mb-4">
        Anda perlu membayar untuk menonton stream ini
      </p>
      <button onClick={handlePaymentRedirect}>
        Bayar Sekarang
      </button>
    </div>
  </div>
) : (
  <HLSPlayer src={stream.url} />
)}
```

### **3. Payment Success Message:**
```typescript
{paymentStatus === 'paid' && (
  <div className="text-center py-6">
    <div className="text-5xl mb-3">✅</div>
    <h3 className="text-xl font-bold text-green-400 mb-2">Pembayaran Berhasil!</h3>
    <p className="text-gray-300 mb-4">Pembayaran Anda telah dikonfirmasi</p>
    <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-3 border border-green-500/30 mb-4">
      <p className="text-green-300 text-sm">Anda akan diarahkan ke halaman stream dalam beberapa detik...</p>
    </div>
    <Link href={`/stream?id=${stream.id}`}>
      Tonton Stream Sekarang
    </Link>
  </div>
)}
```

## 🔄 **Flow Sistem:**

### **1. User Akses Stream:**
```
User buka /stream?id=4 → Check stream data → Check payment access → Show content/popup
```

### **2. Payment Success Flow:**
```
User bayar → Payment success → Auto redirect → Stream page → Valid access
```

### **3. URL Manipulation Protection:**
```
User ubah URL → /stream?id=5 → Check session → No access → Show popup → Redirect home
```

## 📱 **User Experience:**

### **Scenario 1: User Belum Bayar**
1. Akses `/stream?id=4` (paid stream)
2. System check session
3. No valid session found
4. Show popup: "Akses Dibatasi"
5. Options: "Bayar Sekarang" atau "Kembali ke Beranda"

### **Scenario 2: User Sudah Bayar**
1. Akses `/stream?id=4` (paid stream)
2. System check session
3. Valid session found
4. Show video player
5. Show "👑 Akses Aktif" badge

### **Scenario 3: Payment Success**
1. User bayar di payment page
2. Payment success
3. Auto redirect ke stream page
4. Valid access granted
5. Video player active

### **Scenario 4: URL Manipulation**
1. User ubah URL dari `/stream?id=4` ke `/stream?id=5`
2. System check session untuk stream 5
3. No valid session for stream 5
4. Show popup warning
5. Redirect to home or payment

## 🔒 **Security Features:**

### **1. Session Validation:**
- Check session ID exists
- Verify session for specific stream
- Validate payment status
- Check session expiry

### **2. URL Protection:**
- Real-time session check
- Stream ID validation
- Access control per stream
- Redirect protection

### **3. Payment Verification:**
- API-based verification
- Session-based access
- Real-time status check
- Error handling

## 🎯 **Benefits:**

### **✅ Security:**
- URL manipulation protection
- Session-based access control
- Real-time validation
- Secure redirects

### **✅ User Experience:**
- Clear access feedback
- Seamless payment flow
- Auto redirect after payment
- Helpful error messages

### **✅ Technical:**
- Robust error handling
- Performance optimized
- Clean code structure
- Scalable design

## 🔧 **API Endpoints Used:**

### **1. Check Access:**
```
GET /api/check-access?sessionId=xxx&streamId=xxx
Response: { hasAccess: true/false, ... }
```

### **2. Get Stream:**
```
GET /api/streams/[id]
Response: { stream data }
```

### **3. Payment Status:**
```
GET /api/payment-callback?trxId=xxx&sessionId=xxx
Response: { status: paid/pending/expired, ... }
```

## 🎨 **UI States:**

| State | Video Player | Badge | Action |
|-------|-------------|-------|--------|
| **Loading** | Spinner | - | Disabled |
| **Not Paid** | Payment overlay | "💰 Rp 1,000" | "Bayar Sekarang" |
| **Paid** | Video player | "👑 Premium" | "Tonton" |
| **Error** | Error overlay | - | "Kembali ke Beranda" |

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
