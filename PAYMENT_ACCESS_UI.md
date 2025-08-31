# 👑 Payment Access UI - Crown Icon System

## 🎯 **Fitur Payment Access dengan Icon Mahkota**

### **Konsep:**
- Tombol "Tonton" dengan icon mahkota (👑) untuk user yang sudah bayar
- Pengecekan payment access real-time
- UI yang berbeda untuk setiap status payment
- Redirect ke home dengan notifikasi jika belum bayar

## 🔧 **Status Payment UI:**

### **1. Free Stream:**
```
┌─────────────────────────┐
│ 📺 Stream Gratis        │
│                         │
│ [Tonton] ← Blue button  │
└─────────────────────────┘
```

### **2. Paid Stream - Belum Bayar:**
```
┌─────────────────────────┐
│ 💰 Stream Premium       │
│                         │
│ [Uji Coba 7s] [Bayar]  │
└─────────────────────────┘
```

### **3. Paid Stream - Sudah Bayar:**
```
┌─────────────────────────┐
│ 👑 Stream Premium       │
│                         │
│ [👑 Tonton] ← Crown     │
└─────────────────────────┘
```

## 🔄 **Flow Payment Access:**

### **1. Component Mount:**
```typescript
useEffect(() => {
  if (stream.is_paid) {
    checkPaymentAccess()
  }
}, [stream.id])
```

### **2. Payment Access Check:**
```typescript
const checkPaymentAccess = async () => {
  const sessionId = localStorage.getItem('currentSessionId')
  const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${stream.id}`)
  const data = await response.json()
  setHasPaidAccess(data.data.hasAccess)
}
```

### **3. UI Rendering Logic:**
```typescript
{stream.is_paid ? (
  hasPaidAccess ? (
    // 👑 Crown button for paid access
    <Link href={`/stream?id=${stream.id}`}>
      <span>👑</span> Tonton
    </Link>
  ) : (
    // Free trial + Pay buttons
    <>
      <button>Uji Coba 7s</button>
      <Link>Bayar</Link>
    </>
  )
) : (
  // Free stream
  <Link>Tonton</Link>
)}
```

## 🎨 **UI Components:**

### **1. Loading State:**
```typescript
if (stream.is_paid && checkingAccess) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-700 h-52 rounded-2xl"></div>
      <div className="space-y-3">
        <div className="bg-gray-700 h-4 rounded"></div>
        <div className="bg-gray-700 h-8 rounded"></div>
      </div>
    </div>
  )
}
```

### **2. Crown Button:**
```typescript
<Link
  href={`/stream?id=${stream.id}`}
  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center"
>
  <span className="mr-1">👑</span>
  Tonton
</Link>
```

### **3. Payment Required Buttons:**
```typescript
<>
  <button className="bg-blue-600 hover:bg-blue-700">
    Uji Coba 7s
  </button>
  <Link className="bg-green-600 hover:bg-green-700">
    Bayar
  </Link>
</>
```

## 🔒 **Access Control Flow:**

### **1. Stream Page Access:**
```typescript
// Check payment access
const checkPaymentAccess = async () => {
  const sessionId = localStorage.getItem('currentSessionId')
  const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${streamId}`)
  
  if (!data.data.hasAccess) {
    // Redirect to home with notification
    router.push('/?message=payment_required&streamId=' + streamId)
  }
}
```

### **2. Home Page Notification:**
```typescript
useEffect(() => {
  const message = searchParams.get('message')
  const streamId = searchParams.get('streamId')
  
  if (message === 'payment_required' && streamId) {
    setNotificationMessage(`Anda belum membayar untuk stream ID ${streamId}. Silakan bayar terlebih dahulu.`)
    setShowNotification(true)
  }
}, [searchParams])
```

## 📱 **User Experience:**

### **1. First Time User:**
1. User buka stream premium
2. Lihat tombol "Uji Coba 7s" dan "Bayar"
3. Klik "Bayar" → Generate QRIS
4. Admin approve payment
5. Refresh halaman → Tombol berubah jadi "👑 Tonton"

### **2. Returning User (Paid):**
1. User buka aplikasi
2. Lihat tombol "👑 Tonton" di stream yang sudah dibayar
3. Klik tombol → Akses stream langsung
4. Tidak perlu bayar lagi

### **3. Access Denied:**
1. User coba akses stream yang belum dibayar
2. Redirect ke home dengan notifikasi
3. Notifikasi: "Anda belum membayar untuk stream ID X"
4. User bisa bayar dari home page

## 🎯 **Benefits:**

### **✅ Visual Feedback:**
- Crown icon menunjukkan status premium
- Loading state saat check access
- Clear button states

### **✅ User Experience:**
- No confusion about payment status
- Immediate access for paid users
- Clear payment flow for unpaid users

### **✅ Security:**
- Real-time access verification
- Session-based validation
- Automatic redirect for unauthorized access

### **✅ Scalability:**
- Works for multiple streams
- Independent payment status
- Easy to extend

## 🔧 **Technical Implementation:**

### **1. State Management:**
```typescript
const [hasPaidAccess, setHasPaidAccess] = useState(false)
const [checkingAccess, setCheckingAccess] = useState(false)
```

### **2. API Integration:**
```typescript
// Check access
GET /api/check-access?sessionId=xxx&streamId=xxx

// Response
{
  "success": true,
  "data": {
    "hasAccess": true/false,
    "streamId": "4",
    "sessionId": "session_xxx"
  }
}
```

### **3. Local Storage:**
```typescript
// Store session ID
localStorage.setItem('currentSessionId', sessionId)

// Get session ID
const sessionId = localStorage.getItem('currentSessionId')
```

## 🎨 **Design System:**

### **Color Scheme:**
- **Free Stream**: Blue gradient (`from-blue-500 to-purple-500`)
- **Paid Access**: Yellow-Orange gradient (`from-yellow-500 to-orange-500`)
- **Free Trial**: Blue (`bg-blue-600`)
- **Pay Button**: Green (`bg-green-600`)

### **Icons:**
- **Crown**: 👑 (Paid access)
- **Live**: 🔴 (Live stream)
- **Price**: 💰 (Payment required)

### **Animations:**
- **Loading**: Pulse animation
- **Hover**: Scale and shadow effects
- **Transition**: Smooth color changes

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
