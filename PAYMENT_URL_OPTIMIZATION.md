# 💳 Payment URL Optimization - Database-Driven Price

## 🚨 **Masalah: Price di URL Parameter**

### **Sebelumnya:**
```
http://localhost:3001/payment?streamId=2&price=1000
```

### **Masalah:**
- Price di-hardcode di URL
- Tidak aman (bisa dimanipulasi)
- Redundant (price sudah ada di database)
- URL tidak clean

## ✅ **Solusi: Database-Driven Price**

### **Sekarang:**
```
http://localhost:3001/payment?streamId=2
```

### **Benefits:**
- ✅ Price diambil dari database
- ✅ Aman dari manipulasi
- ✅ URL lebih clean
- ✅ Single source of truth

## 🔄 **Flow Baru:**

### **1. User Klik "Uji Coba 7s" atau "Bayar"**
```typescript
// Redirect tanpa price
window.location.href = `/payment?streamId=${stream.id}`
```

### **2. Payment Page Fetch Data**
```typescript
const fetchStream = async () => {
  const response = await fetch(`/api/streams/${streamId}`)
  const data = await response.json()
  setStream(data) // Price dari database
}
```

### **3. Generate QRIS dengan Price dari Database**
```typescript
const generateQRIS = async () => {
  const response = await fetch('/api/generate-qris', {
    method: 'POST',
    body: JSON.stringify({
      streamId: streamId,
      amount: stream?.price || 0 // Price dari database
    })
  })
}
```

## 📊 **Technical Implementation:**

### **StreamCard.tsx:**
```typescript
// Free trial redirect
window.location.href = `/payment?streamId=${stream.id}`

// Bayar button
<Link href={`/payment?streamId=${stream.id}`}>
  Bayar
</Link>
```

### **Payment Page:**
```typescript
export default function PaymentPage() {
  const searchParams = useSearchParams()
  const streamId = searchParams.get('streamId')
  // Tidak ada price parameter
  
  const [stream, setStream] = useState<Stream | null>(null)
  
  const fetchStream = async () => {
    const response = await fetch(`/api/streams/${streamId}`)
    const data = await response.json()
    setStream(data) // Price dari database
  }
}
```

## 🔒 **Security Benefits:**

### **1. Price Validation:**
- Price diambil dari database server
- Tidak bisa dimanipulasi di client
- Validasi server-side

### **2. Data Integrity:**
- Single source of truth
- Konsisten dengan database
- Tidak ada data duplication

### **3. Clean URLs:**
- URL lebih pendek
- Lebih SEO friendly
- Lebih user-friendly

## 📱 **Database Integration:**

### **Stream Data Structure:**
```typescript
interface Stream {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  is_live: boolean
  is_paid: boolean
  price: number // ← Price dari database
  scheduled_time: string
  estimated_duration: string
}
```

### **API Response:**
```json
{
  "id": "2",
  "title": "Upstream Premium News",
  "price": 1000,
  "is_paid": true,
  "url": "https://stream.trcell.id/hls/byon2.m3u8"
}
```

## 🎯 **Benefits:**

### **✅ Security:**
- Price tidak bisa dimanipulasi
- Server-side validation
- Data integrity

### **✅ Performance:**
- URL lebih pendek
- Less data transfer
- Faster loading

### **✅ Maintainability:**
- Single source of truth
- Easy to update price
- Consistent data

### **✅ User Experience:**
- Clean URLs
- Better SEO
- Professional appearance

## 🚀 **Expected Behavior:**

### **URL Examples:**
```
✅ /payment?streamId=1
✅ /payment?streamId=2
✅ /payment?streamId=3
```

### **Price Display:**
- Price diambil dari `stream.price`
- Display: "Rp 1,000"
- QRIS amount: 1000

### **Error Handling:**
- Jika stream tidak ditemukan: Error page
- Jika price tidak ada: Default 0
- Jika streamId tidak valid: Redirect home

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
