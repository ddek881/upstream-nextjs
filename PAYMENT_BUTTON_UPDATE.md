# 👑 Payment Button Update - Crown Icon & Premium Access

## 🎯 **Update Button Payment dengan Crown Icon**

### **Konsep:**
- Button berubah dari "Bayar" menjadi "Tonton" dengan icon crown jika sudah bayar
- Badge berubah dari harga menjadi "Premium" jika sudah bayar
- Real-time payment status check
- Auto refresh setelah payment berhasil

## 🔧 **Perubahan yang Dilakukan:**

### **1. State Management:**
```typescript
const [hasPaidAccess, setHasPaidAccess] = useState(false)
const [checkingAccess, setCheckingAccess] = useState(false)
```

### **2. Payment Access Check:**
```typescript
const checkPaymentAccess = async () => {
  try {
    setCheckingAccess(true)
    const sessionId = localStorage.getItem('currentSessionId')
    
    if (sessionId) {
      const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${stream.id}`)
      if (response.ok) {
        const data = await response.json()
        setHasPaidAccess(data.data.hasAccess)
      }
    }
  } catch (error) {
    console.error('Error checking payment access:', error)
  } finally {
    setCheckingAccess(false)
  }
}
```

### **3. Button Logic Update:**
```typescript
{stream.is_live ? (
  stream.is_paid ? (
    hasPaidAccess ? (
      <Link
        href={`/stream?id=${stream.id}`}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-2"
      >
        <span className="text-sm">👑</span>
        Tonton
      </Link>
    ) : (
      <div className="flex gap-2">
        <button>Uji Coba 7s</button>
        <Link>Bayar</Link>
      </div>
    )
  ) : (
    <Link>Tonton</Link>
  )
) : (
  <span>Segera Hadir</span>
)}
```

### **4. Badge Update:**
```typescript
{stream.is_live && stream.is_paid && (
  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-yellow-400/30">
    {hasPaidAccess ? '👑 Premium' : `💰 Rp ${stream.price?.toLocaleString()}`}
  </div>
)}
```

## 🎨 **UI Changes:**

### **Before Payment:**
- Button: "Uji Coba 7s" + "Bayar"
- Badge: "💰 Rp 1,000"
- Color: Blue/Green gradient

### **After Payment:**
- Button: "👑 Tonton" (Yellow/Orange gradient)
- Badge: "👑 Premium"
- Color: Yellow/Orange gradient

### **Loading State:**
- Spinner + "Cek Akses..." text
- Disabled interaction

## 🔄 **Payment Success Flow:**

### **1. Payment Process:**
```
User bayar → Payment success → Event emitted → Button update
```

### **2. Event System:**
```typescript
// Payment page emits event
window.dispatchEvent(new CustomEvent('payment-success'))

// StreamCard listens for event
useEffect(() => {
  const handlePaymentSuccess = () => {
    refreshPaymentAccess()
  }
  window.addEventListener('payment-success', handlePaymentSuccess)
  return () => {
    window.removeEventListener('payment-success', handlePaymentSuccess)
  }
}, [])
```

### **3. Auto Refresh:**
```typescript
const refreshPaymentAccess = () => {
  checkPaymentAccess()
}
```

## 📱 **User Experience:**

### **Scenario 1: User Belum Bayar**
1. Lihat stream berbayar
2. Button: "Uji Coba 7s" + "Bayar"
3. Badge: "💰 Rp 1,000"
4. Klik "Bayar" → Payment page

### **Scenario 2: User Sudah Bayar**
1. Lihat stream berbayar
2. Button: "👑 Tonton" (Yellow/Orange)
3. Badge: "👑 Premium"
4. Klik "Tonton" → Stream page

### **Scenario 3: Payment Success**
1. User bayar di payment page
2. Payment success event emitted
3. Button otomatis berubah ke "👑 Tonton"
4. Badge berubah ke "👑 Premium"

## 🎯 **Benefits:**

### **✅ Visual Feedback:**
- Clear indication of payment status
- Premium crown icon
- Color-coded buttons
- Real-time updates

### **✅ User Experience:**
- Seamless payment flow
- Auto refresh after payment
- Loading states
- Clear call-to-action

### **✅ Technical:**
- Event-driven updates
- Session-based verification
- Error handling
- Performance optimized

## 🔧 **Technical Implementation:**

### **1. Payment Access Check:**
- Check session on component mount
- Verify payment status via API
- Handle loading states
- Error handling

### **2. Event System:**
- Custom event for payment success
- Event listener in StreamCard
- Auto refresh after payment
- Cleanup on unmount

### **3. UI States:**
- Loading: Spinner + "Cek Akses..."
- Not Paid: "Uji Coba 7s" + "Bayar"
- Paid: "👑 Tonton"
- Error: Fallback to default state

## 🎨 **Design System:**

### **Colors:**
- **Not Paid**: Blue/Green gradient
- **Paid**: Yellow/Orange gradient
- **Loading**: Gray with spinner
- **Premium**: Crown icon + yellow theme

### **Icons:**
- **Crown**: 👑 (Premium access)
- **Money**: 💰 (Payment required)
- **Spinner**: Loading animation

### **Typography:**
- **Button**: text-xs font-semibold
- **Badge**: text-xs font-bold
- **Loading**: text-xs text-gray-400

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
