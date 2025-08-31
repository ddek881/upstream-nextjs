# Panduan Free Trial 7 Detik & Pembayaran QRIS

## Overview
Aplikasi ini memiliki fitur free trial 7 detik untuk stream premium, setelah itu pengguna akan diarahkan ke halaman pembayaran QRIS.

## Fitur Free Trial

### 🎯 Konsep Free Trial
- **Durasi:** 7 detik
- **Tujuan:** Memberikan preview konten premium
- **Auto-redirect:** Ke halaman pembayaran setelah trial berakhir
- **Gratis:** Tidak ada biaya untuk trial

### 🔧 Implementasi Free Trial

#### 1. StreamCard Component
```typescript
const [trialTimeLeft, setTrialTimeLeft] = useState<number | null>(null)
const [isTrialActive, setIsTrialActive] = useState(false)

const startFreeTrial = () => {
  setIsTrialActive(true)
  setTrialTimeLeft(7) // 7 detik trial
}
```

#### 2. Timer Implementation
```typescript
useEffect(() => {
  let interval: NodeJS.Timeout

  if (isTrialActive && trialTimeLeft !== null && trialTimeLeft > 0) {
    interval = setInterval(() => {
      setTrialTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          setIsTrialActive(false)
          // Redirect ke halaman pembayaran
          window.location.href = `/payment?streamId=${stream.id}&price=${stream.price}`
          return 0
        }
        return prev !== null ? prev - 1 : null
      })
    }, 1000)
  }

  return () => {
    if (interval) clearInterval(interval)
  }
}, [isTrialActive, trialTimeLeft, stream.id, stream.price])
```

#### 3. UI Elements
- **Trial Button:** "Free Trial 7s"
- **Timer Display:** Countdown timer overlay
- **Status Indicator:** "Trial Active" saat berjalan
- **Auto-redirect:** Ke halaman pembayaran

## Fitur Pembayaran QRIS

### 💳 Sistem Pembayaran
- **Metode:** QRIS (Quick Response Code Indonesian Standard)
- **Provider:** DANA, OVO, GoPay, Bank Transfer
- **Timeout:** 5 menit
- **Status:** Pending → Paid/Expired

### 🔧 Implementasi QRIS

#### 1. Generate QRIS API
```typescript
// POST /api/generate-qris
{
  streamId: string,
  amount: number
}

// Response
{
  success: true,
  data: {
    qrCode: string,
    trxId: string,
    amount: number,
    expiredAt: number,
    qrisData: object
  }
}
```

#### 2. Payment Status API
```typescript
// GET /api/payment-callback?trxId=xxx
{
  success: true,
  data: {
    status: 'pending' | 'paid' | 'expired',
    amount: number,
    streamId: string,
    expiredAt: number,
    createdAt: string
  }
}
```

#### 3. Database Schema
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  stream_id text NOT NULL,
  amount integer NOT NULL,
  qris_data text NOT NULL,
  trx_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'expired')),
  expired_at bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## Flow Penggunaan

### 1. User Flow
```
1. User melihat stream premium
2. Klik "Free Trial 7s"
3. Timer 7 detik berjalan
4. Setelah 7 detik → Redirect ke /payment
5. Scan QRIS dengan e-wallet
6. Pembayaran berhasil → Akses stream
```

### 2. Technical Flow
```
1. startFreeTrial() → setTrialTimeLeft(7)
2. Timer countdown setiap 1 detik
3. trialTimeLeft <= 1 → window.location.href
4. Payment page → generateQRIS()
5. Check payment status setiap 10 detik
6. Status 'paid' → Redirect ke stream
```

## Halaman Pembayaran

### 🎨 UI Components
- **Header:** Gradient blue-purple dengan judul
- **Stream Info:** Thumbnail, judul, kategori
- **Payment Amount:** Total pembayaran
- **QRIS Code:** QR code untuk scan
- **Timer:** Countdown 5 menit
- **Instructions:** Cara pembayaran
- **Status:** Pending/Paid/Expired

### 📱 Responsive Design
- **Mobile-first:** Optimized untuk mobile
- **QR Code Size:** 300x300px
- **Button Layout:** Full-width pada mobile
- **Typography:** Readable pada semua device

## QRIS Data Format

### 📋 Standard QRIS Format
```json
{
  "merchantId": "TRCELL001",
  "merchantName": "TR Cell Streaming",
  "merchantCity": "Jakarta",
  "postalCode": "12345",
  "categoryCode": "5817",
  "transactionAmount": 1000,
  "tipIndicator": "00",
  "feeIndicator": "00",
  "trxId": "TRCELL-1234567890-abc123",
  "additionalData": {
    "streamId": "uuid-stream",
    "description": "Stream Premium Access"
  }
}
```

## Error Handling

### 🚨 Error Scenarios
1. **Stream tidak ditemukan**
   - Show error message
   - Link kembali ke beranda

2. **QRIS generation failed**
   - Retry mechanism
   - Fallback QR code

3. **Payment timeout**
   - Auto-expire setelah 5 menit
   - Option untuk coba lagi

4. **Network error**
   - Retry payment status check
   - Graceful degradation

## Testing

### 🧪 Test Cases
1. **Free Trial**
   - Timer berjalan 7 detik
   - Auto-redirect ke payment
   - Button disabled saat trial aktif

2. **QRIS Generation**
   - API call berhasil
   - QR code muncul
   - Data tersimpan di database

3. **Payment Status**
   - Check status setiap 10 detik
   - Update status di database
   - UI update sesuai status

4. **Timeout Handling**
   - Expire setelah 5 menit
   - Show expired message
   - Option retry

## Best Practices

### ✅ Implementation Tips
1. **Timer Management**
   - Clear interval saat component unmount
   - Handle component re-render
   - Prevent memory leaks

2. **Payment Security**
   - Validate payment data
   - Secure QRIS generation
   - Prevent duplicate payments

3. **User Experience**
   - Clear countdown display
   - Intuitive payment flow
   - Helpful error messages

4. **Performance**
   - Optimize API calls
   - Efficient status checking
   - Minimal re-renders

## Monitoring

### 📊 Metrics to Track
- **Trial Conversion Rate:** Berapa % yang bayar setelah trial
- **Payment Success Rate:** Berapa % pembayaran berhasil
- **Average Payment Time:** Rata-rata waktu pembayaran
- **Error Rate:** Frekuensi error pada payment flow

### 🔍 Logging
```typescript
// Log trial start
console.log('Trial started:', { streamId, userId, timestamp })

// Log payment attempt
console.log('Payment initiated:', { trxId, amount, streamId })

// Log payment success
console.log('Payment successful:', { trxId, amount, duration })
```

## Kesimpulan

Fitur free trial 7 detik dan pembayaran QRIS memberikan:
- ✅ Preview konten premium
- ✅ User experience yang smooth
- ✅ Payment flow yang aman
- ✅ Conversion rate yang optimal
- ✅ Monetisasi yang efektif
