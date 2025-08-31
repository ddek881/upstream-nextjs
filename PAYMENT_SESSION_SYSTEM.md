# 🔐 Payment Session System - User Access Verification

## 🎯 **Sistem Session Management untuk Payment Verification**

### **Konsep:**
- Session management untuk tracking payment status
- Verification apakah user benar-benar sudah bayar
- Access control untuk paid streams
- Session expiry dan cleanup
- **1 Payment = 1 Live Stream Access (2 jam)**

## ⏰ **Session Duration:**
- **Durasi Session**: 2 jam (sesuai durasi stream rata-rata)
- **1 Payment**: Hanya untuk 1 live stream tertentu
- **Auto Expiry**: Session otomatis expired setelah 2 jam
- **No Duplicate**: User tidak bisa bayar 2x untuk stream yang sama

## 🔧 **Komponen Sistem:**

### **1. Session Manager (`lib/session.ts`):**
```typescript
export interface PaymentSession {
  userId: string
  streamId: string
  trxId: string
  amount: number
  status: 'pending' | 'paid' | 'expired'
  paidAt?: number
  expiresAt: number // 2 jam dari creation
}

export class SessionManager {
  // Create payment session (2 jam expiry)
  static createPaymentSession(userId, streamId, trxId, amount): string
  
  // Get payment session
  static getPaymentSession(sessionId): PaymentSession | null
  
  // Update payment status
  static updatePaymentStatus(sessionId, status): boolean
  
  // Check if user has paid access
  static hasPaidAccess(sessionId, streamId): boolean
  
  // Check if user already has active session for specific stream
  static hasActiveSessionForStream(userId, streamId): boolean
  
  // Get user's active sessions
  static getUserSessions(userId): PaymentSession[]
  
  // Clean expired sessions
  static cleanExpiredSessions(): void
}
```

### **2. QRIS Generation dengan Session Check:**
```typescript
// Check if user already has active session for this stream
const hasActiveSession = SessionManager.hasActiveSessionForStream(userId, streamId)
if (hasActiveSession) {
  return { error: 'Anda sudah memiliki akses untuk stream ini' }
}

// Create payment session (2 jam expiry)
const sessionId = SessionManager.createPaymentSession(
  userId,
  streamId,
  qrisData.trx_id,
  amount
)
```

### **3. Payment Status Check dengan Session:**
```typescript
// Check session first if sessionId provided
if (sessionId) {
  const session = SessionManager.getPaymentSession(sessionId)
  if (session && session.trxId === trxId) {
    return {
      success: true,
      data: {
        status: session.status,
        sessionId: sessionId,
        remainingTime: Math.max(0, session.expiresAt - Date.now())
      }
    }
  }
}
```

### **4. Access Verification API:**
```typescript
// GET /api/check-access?sessionId=xxx&streamId=xxx
const hasAccess = SessionManager.hasPaidAccess(sessionId, streamId)

return {
  success: true,
  data: {
    hasAccess: true/false,
    streamId: streamId,
    sessionId: sessionId,
    remainingTime: remainingTime
  }
}
```

### **5. User Sessions API:**
```typescript
// GET /api/user-sessions?userId=xxx
// POST /api/user-sessions { userId, streamId }

// Check specific stream access
const hasActiveSession = SessionManager.hasActiveSessionForStream(userId, streamId)

return {
  success: true,
  data: {
    hasAccess: true/false,
    streamId: streamId,
    remainingTime: remainingTime,
    totalActive: totalActiveSessions
  }
}
```

## 🔄 **Flow Payment Session:**

### **1. Generate QRIS:**
```
User klik "Bayar" → Check existing session → Generate QRIS → Create Session (2 jam) → Return sessionId
```

### **2. Payment Process:**
```
User scan QR → Pay → QRIS callback → Update session status → 'paid'
```

### **3. Access Verification:**
```
User akses stream → Check session → Verify paid status → Grant/Deny access
```

### **4. Session Management:**
```
Session created → 2 jam expiry → Auto cleanup → Access revoked
```

## 📊 **Session Data Structure:**

### **PaymentSession Interface:**
```typescript
{
  userId: "demo-user",
  streamId: "4",
  trxId: "03C18d37a00b0119",
  amount: 1000,
  status: "paid", // pending | paid | expired
  paidAt: 1756584975508, // timestamp saat bayar
  expiresAt: 1756592175508 // 2 jam dari creation
}
```

### **Session Storage:**
- **Development**: In-memory Map (reset saat restart)
- **Production**: Redis atau Database
- **Expiry**: 2 jam otomatis
- **Scope**: 1 payment = 1 stream access

## 🎯 **Access Control Flow:**

### **1. Payment Page:**
```typescript
// Check existing session first
const response = await fetch(`/api/user-sessions`, {
  method: 'POST',
  body: JSON.stringify({ userId, streamId })
})

if (data.data.hasAccess) {
  // User sudah punya akses
  showStream()
} else {
  // Generate QRIS dengan session
  const response = await fetch('/api/generate-qris', {
    method: 'POST',
    body: JSON.stringify({ streamId, amount })
  })
}
```

### **2. Payment Status Check:**
```typescript
// Check dengan sessionId
const response = await fetch(`/api/payment-callback?trxId=${trxId}&sessionId=${sessionId}`)

if (data.data.status === 'paid') {
  // Payment successful
  checkAccess() // Verify access
}
```

### **3. Access Verification:**
```typescript
// Verify paid access
const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${streamId}`)

if (data.data.hasAccess) {
  // User has paid access (2 jam)
  showStream()
} else {
  // User needs to pay
  showPaymentPage()
}
```

## 🔒 **Security Features:**

### **1. Session Validation:**
- Session ID unique dan random
- Expiry time 2 jam
- Auto cleanup expired sessions
- No duplicate payment untuk stream yang sama

### **2. Access Control:**
- Session must exist dan valid
- Status must be 'paid'
- StreamId must match
- UserId verification
- Remaining time check

### **3. Payment Verification:**
- TrxId validation
- Amount verification
- Status tracking
- Timestamp validation
- Duplicate payment prevention

## 🚀 **API Endpoints:**

### **1. Generate QRIS:**
```
POST /api/generate-qris
Body: { streamId, amount, userId }
Response: { sessionId, trxId, qrCode, ... }
```

### **2. Payment Status:**
```
GET /api/payment-callback?trxId=xxx&sessionId=xxx
Response: { status, sessionId, remainingTime, ... }
```

### **3. Access Check:**
```
GET /api/check-access?sessionId=xxx&streamId=xxx
Response: { hasAccess: true/false, remainingTime, ... }
```

### **4. User Sessions:**
```
GET /api/user-sessions?userId=xxx
Response: { activeSessions, totalActive, ... }

POST /api/user-sessions
Body: { userId, streamId }
Response: { hasAccess, remainingTime, ... }
```

## 🎯 **Benefits:**

### **✅ Secure Access Control:**
- Session-based verification (2 jam)
- Payment status tracking
- Expiry management
- No duplicate payments

### **✅ User Experience:**
- Seamless payment flow
- Access verification
- Session persistence (2 jam)
- Clear access status

### **✅ Scalability:**
- Session management
- Auto cleanup
- Redis ready
- Efficient storage

### **✅ Debugging:**
- Session tracking
- Payment status logs
- Access verification logs
- Remaining time display

## 🔧 **Production Implementation:**

### **1. Redis Integration:**
```typescript
// Replace in-memory Map with Redis
import Redis from 'ioredis'
const redis = new Redis()

// Store session (2 jam expiry)
await redis.setex(`session:${sessionId}`, 7200, JSON.stringify(session))

// Get session
const sessionData = await redis.get(`session:${sessionId}`)
```

### **2. Database Integration:**
```typescript
// Store sessions in database
await query(
  `INSERT INTO payment_sessions (session_id, user_id, stream_id, trx_id, status, expires_at)
   VALUES ($1, $2, $3, $4, $5, $6)`,
  [sessionId, userId, streamId, trxId, status, expiresAt]
)
```

## ⏰ **Session Duration Summary:**

| Feature | Duration | Description |
|---------|----------|-------------|
| **Session Expiry** | 2 jam | Sesuai durasi stream rata-rata |
| **Payment Scope** | 1 stream | 1 payment = 1 live stream access |
| **Auto Cleanup** | 2 jam | Session otomatis expired |
| **Duplicate Prevention** | Active | User tidak bisa bayar 2x untuk stream yang sama |
| **Access Verification** | Real-time | Check session status setiap akses |

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
