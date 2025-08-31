# 🔐 UserID-Based Payment System - Upstream Streaming

## 🎯 **Sistem Payment Berbasis UserID dan Database**

### **Perubahan Utama:**
- ✅ **UserID-based**: Menggunakan userId untuk identifikasi user
- ✅ **Database Storage**: Payment history disimpan di database PostgreSQL
- ✅ **Persistent Data**: Data tidak hilang saat server restart
- ✅ **Payment History**: Riwayat pembayaran tersimpan lengkap
- ✅ **Access Control**: Check akses berdasarkan userId dan streamId

## 🗄️ **Database Schema:**

### **Tabel Streams:**
```sql
CREATE TABLE streams (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    is_live BOOLEAN NOT NULL DEFAULT false,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    scheduled_time TIMESTAMP,
    estimated_duration VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabel Payments:**
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stream_id VARCHAR(255) NOT NULL,
    trx_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
);
```

## 🔄 **Flow Payment Baru:**

### **1. User Registration:**
```javascript
// Generate unique user ID
const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
localStorage.setItem('currentUserId', userId)
```

### **2. Payment Generation:**
```javascript
// API: POST /api/generate-qris
{
  streamId: "2",
  amount: 1000,
  userId: "user_1234567890_abc123"
}
```

### **3. Database Storage:**
```sql
INSERT INTO payments (user_id, stream_id, trx_id, amount, status, expires_at)
VALUES ('user_1234567890_abc123', '2', 'UPSTREAM-1234567890-abc123', 1000, 'pending', NOW() + INTERVAL '2 hours')
```

### **4. Access Check:**
```javascript
// API: GET /api/check-access?userId=user_123&streamId=2
SELECT * FROM payments 
WHERE user_id = 'user_123' 
  AND stream_id = '2' 
  AND status = 'paid' 
  AND expires_at > NOW()
```

## 🛠️ **API Endpoints:**

### **1. Generate QRIS:**
```
POST /api/generate-qris
Body: { streamId, amount, userId }
Response: { qrCode, trxId, amount, streamId, userId, expiresAt }
```

### **2. Check Access:**
```
GET /api/check-access?userId=xxx&streamId=xxx
Response: { hasAccess: true/false, message }
```

### **3. Payment Callback:**
```
GET /api/payment-callback?trxId=xxx&userId=xxx&streamId=xxx
Response: { status, amount, hasAccess }
```

### **4. Force Approve:**
```
POST /api/force-approve
Body: { streamId, userId }
Response: { trxId, amount, status, paidAt, expiresAt }
```

### **5. User Payments:**
```
GET /api/user-sessions?userId=xxx
Response: { activePayments: [], totalPayments: number }
```

## 📁 **File Structure:**

```
├── lib/
│   └── database.ts              # Database connection dan queries
├── app/
│   ├── api/
│   │   ├── generate-qris/       # Generate QRIS dengan userId
│   │   ├── check-access/        # Check access berdasarkan userId
│   │   ├── payment-callback/    # Payment callback dengan database
│   │   ├── force-approve/       # Force approve payment
│   │   └── user-sessions/       # Get user payment history
│   ├── payment/                 # Payment page dengan userId
│   └── stream/                  # Stream page dengan access check
├── components/
│   └── StreamCard.tsx           # Component dengan userId check
├── scripts/
│   └── approve-payment.js       # Approve payment script
└── database/
    └── schema.sql               # Database schema
```

## 🔧 **Database Functions:**

### **Payment Management:**
```typescript
// Create payment record
createPayment(userId: string, streamId: string, trxId: string, amount: number)

// Update payment status
updatePaymentStatus(trxId: string, status: 'pending' | 'paid' | 'expired' | 'failed')

// Check paid access
hasPaidAccess(userId: string, streamId: string): Promise<boolean>

// Get user payments
getUserPayments(userId: string): Promise<Payment[]>

// Get active payments
getActivePayments(userId: string): Promise<Payment[]>
```

## 🎯 **User Experience:**

### **1. First Time User:**
1. **Visit site** → Auto-generate userId
2. **Click "Bayar"** → Check existing access
3. **Generate QRIS** → Create payment record
4. **Admin approve** → Update payment status
5. **Access stream** → Check database access

### **2. Returning User:**
1. **Visit site** → Load existing userId
2. **Click stream** → Check database access
3. **If paid** → Direct access
4. **If not paid** → Show payment options

### **3. Payment History:**
1. **Admin interface** → View all payments
2. **User payments** → Check specific user
3. **Payment status** → Track payment lifecycle

## 🔍 **Access Control:**

### **Check Access Logic:**
```typescript
const hasAccess = await hasPaidAccess(userId, streamId)

// Database query:
SELECT * FROM payments 
WHERE user_id = $1 
  AND stream_id = $2 
  AND status = 'paid' 
  AND expires_at > NOW()
```

### **Payment Status Flow:**
```
pending → paid → expired
     ↓
   failed
```

## 📊 **Payment History:**

### **User Payment Records:**
```sql
SELECT p.*, s.title as stream_title 
FROM payments p 
JOIN streams s ON p.stream_id = s.id 
WHERE p.user_id = 'user_123' 
ORDER BY p.created_at DESC
```

### **Active Payments:**
```sql
SELECT * FROM payments 
WHERE user_id = 'user_123' 
  AND status = 'paid' 
  AND expires_at > NOW()
```

## 🚀 **Benefits:**

### **1. Data Persistence:**
- ✅ Payment history tersimpan permanen
- ✅ Tidak hilang saat server restart
- ✅ Backup dan recovery mudah

### **2. User Management:**
- ✅ Unique user identification
- ✅ Payment history per user
- ✅ Access control per stream

### **3. Admin Features:**
- ✅ View all payments
- ✅ Approve payments
- ✅ Check user access
- ✅ Payment analytics

### **4. Scalability:**
- ✅ Database indexing
- ✅ Efficient queries
- ✅ Multiple user support
- ✅ Payment tracking

## 🔧 **Setup Instructions:**

### **1. Database Setup:**
```bash
# Create database
createdb upstream_db

# Run schema
psql upstream_db < database/schema.sql
```

### **2. Environment Variables:**
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=upstream_db
DB_PASSWORD=password
DB_PORT=5432
```

### **3. Test Payment:**
```bash
# Approve payment
node scripts/approve-payment.js 2

# Check access
curl "http://localhost:3001/api/check-access?userId=demo-user&streamId=2"
```

## 🎯 **Migration dari Session System:**

### **1. Remove Session Files:**
- ❌ `lib/session.ts`
- ❌ `app/api/restore-session/`
- ❌ Session-based scripts

### **2. Update Components:**
- ✅ Use userId instead of sessionId
- ✅ Check database access
- ✅ Store userId in localStorage

### **3. Update APIs:**
- ✅ Database queries
- ✅ User-based access control
- ✅ Payment history tracking

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
