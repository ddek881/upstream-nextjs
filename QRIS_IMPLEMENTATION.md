# 💳 QRIS Implementation - Otomatis.vip API

## 🎯 **QRIS Integration dengan Otomatis.vip**

### **API Endpoint:**
```
POST https://rest.otomatis.vip/api/generate
```

## 📊 **Request Body:**

```json
{
  "username": "test",
  "amount": 1000,
  "uuid": "2a27740e-3c41-449d-a6de-4dd35217e2da",
  "expire": 1200
}
```

### **Parameters:**
- **username**: "test" (fixed)
- **amount**: Jumlah pembayaran (dari stream.price)
- **uuid**: API key (jangan diubah)
- **expire**: Waktu expired dalam detik (1200 = 20 menit)

## 📊 **Response:**

```json
{
  "status": true,
  "data": "00020101021226610016ID.MOTIONPAY.WWW01189360081632434311290208000349080303UMI51440014ID.CO.QRIS.WWW0215ID10243600782490303UMI52048299530336054071000.005802ID5918NURLA HARAPAN JAYA6013JAKARTA BARAT61051185062690618Additonalinfolabel071603C9e23df11b967460232025083020192395535321563049F73",
  "trx_id": "03C9e23df11b9674",
  "fee": 0,
  "expired_at": 1200
}
```

### **Response Fields:**
- **status**: true/false (success status)
- **data**: QRIS data string untuk QR code
- **trx_id**: Transaction ID untuk tracking
- **fee**: Biaya transaksi (0 = gratis)
- **expired_at**: Waktu expired dalam detik

## 🔧 **Implementation:**

### **API Route (`/api/generate-qris`):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { streamId, amount } = await request.json()

    // Call QRIS API
    const qrisResponse = await fetch('https://rest.otomatis.vip/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        amount: amount,
        uuid: '2a27740e-3c41-449d-a6de-4dd35217e2da',
        expire: 1200
      })
    })

    const qrisData = await qrisResponse.json()

    // Generate QR code image URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisData.data)}`

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        qrisData: qrisData.data,
        trxId: qrisData.trx_id,
        amount: amount,
        fee: qrisData.fee,
        expiredAt: qrisData.expired_at,
        streamId: streamId
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal generate QRIS' },
      { status: 500 }
    )
  }
}
```

## 🔄 **Flow QRIS:**

### **1. User Klik "Bayar" atau Trial Selesai**
- Redirect ke `/payment?streamId=4`

### **2. Payment Page Load**
- Fetch stream data
- Get stream price (Rp 1,000)

### **3. Generate QRIS**
- Call `/api/generate-qris`
- API call ke otomatis.vip
- Generate QR code image

### **4. Display QR Code**
- QR code ditampilkan
- Timer 20 menit dimulai
- Payment status monitoring

## 🎨 **QR Code Display:**

### **QR Code Image:**
```typescript
// Generate QR code dari QRIS data
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisData.data)}`
```

### **Payment Page UI:**
- QR code image (300x300px)
- Amount display: "Rp 1,000"
- Timer countdown: 20:00 → 00:00
- Payment status indicator

## ⏰ **Timer Configuration:**

### **Expiry Time:**
- **20 menit** = 1200 detik
- Timer countdown di payment page
- Auto expired jika tidak dibayar

### **Timer Display:**
```typescript
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

## 🔍 **Payment Status Tracking:**

### **Transaction ID:**
- Stored in localStorage: `currentTrxId`
- Used for payment status checking
- Format: `03C9e23df11b9674`

### **Status Monitoring:**
- Check payment status setiap 10 detik
- Update UI berdasarkan status
- Handle expired payments

## 🎯 **Benefits:**

### **✅ Real QRIS Integration:**
- Menggunakan API QRIS resmi
- Valid QRIS data format
- Compatible dengan semua QRIS apps

### **✅ Secure Payment:**
- API key authentication
- Transaction ID tracking
- Expiry time protection

### **✅ User Experience:**
- Clean QR code display
- Real-time timer
- Payment status updates

### **✅ Merchant Info:**
- Merchant: "NURLA HARAPAN JAYA"
- Location: "JAKARTA BARAT"
- Category: Digital Goods

## 🚀 **Expected Behavior:**

### **Success Flow:**
1. Generate QRIS → QR code muncul
2. User scan QR → Payment app
3. User pay → Status update
4. Payment success → Access granted

### **Error Handling:**
1. QRIS generation failed → Error message
2. Payment expired → Timer expired
3. Network error → Retry mechanism

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
