# 🔐 Payment Approval Guide - Testing

## 🎯 **Cara Approve Payment untuk Testing**

### **Konsep:**
- Manual approval payment untuk testing
- Admin interface untuk approve payment
- Script terminal untuk approve payment
- Verification access setelah approval

## 🚀 **Metode Approve Payment:**

### **1. Via Admin Interface:**
```
URL: http://localhost:3001/admin/approve
```

**Fitur:**
- ✅ View semua pending payments
- ✅ Approve payment dengan 1 klik
- ✅ Real-time status update
- ✅ Session management
- ✅ Access verification

### **2. Via Terminal Script:**
```bash
# Run script approve payment
node scripts/approve-payment.js
```

**Fitur:**
- ✅ Auto detect pending payments
- ✅ Approve payment otomatis
- ✅ Check access setelah approval
- ✅ Detailed logging

### **3. Via API Direct:**
```bash
# Get pending sessions
curl "http://localhost:3001/api/user-sessions?userId=demo-user"

# Approve payment
curl -X POST "http://localhost:3001/api/approve-payment" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_xxx","trxId":"UPSTREAM-xxx"}'

# Check access
curl "http://localhost:3001/api/check-access?sessionId=session_xxx&streamId=4"
```

## 🔧 **API Endpoints:**

### **1. Approve Payment API:**
```
POST /api/approve-payment
Body: { sessionId, trxId }
Response: { success, message, data }
```

### **2. Get Session Info:**
```
GET /api/approve-payment?sessionId=xxx
Response: { success, data }
```

### **3. User Sessions:**
```
GET /api/user-sessions?userId=xxx
Response: { activeSessions, totalActive }
```

### **4. Check Access:**
```
GET /api/check-access?sessionId=xxx&streamId=xxx
Response: { hasAccess, remainingTime }
```

## 📋 **Step-by-Step Testing:**

### **Step 1: Generate Payment**
1. Buka aplikasi: `http://localhost:3001`
2. Pilih stream berbayar (misal: "Upstream Premium News")
3. Klik "Bayar" → Generate QRIS
4. Catat `sessionId` dan `trxId` dari console

### **Step 2: Approve Payment**
```bash
# Method 1: Via Admin Interface
http://localhost:3001/admin/approve

# Method 2: Via Terminal Script
node scripts/approve-payment.js

# Method 3: Via API
curl -X POST "http://localhost:3001/api/approve-payment" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_xxx","trxId":"UPSTREAM-xxx"}'
```

### **Step 3: Verify Access**
```bash
# Check access
curl "http://localhost:3001/api/check-access?sessionId=session_xxx&streamId=4"

# Expected response:
{
  "success": true,
  "data": {
    "hasAccess": true,
    "streamId": "4",
    "sessionId": "session_xxx",
    "remainingTime": 7200000
  }
}
```

### **Step 4: Test User Experience**
1. Refresh halaman payment
2. Status berubah dari "Pending" → "Paid"
3. User bisa akses stream
4. Session tahan 2 jam

## 🔍 **Testing Scenarios:**

### **Scenario 1: Normal Payment Flow**
```
1. User generate QRIS → Pending
2. Admin approve payment → Paid
3. User akses stream → Success
4. Session valid 2 jam
```

### **Scenario 2: Duplicate Payment Prevention**
```
1. User sudah punya active session
2. User coba bayar lagi → Error
3. Message: "Anda sudah memiliki akses untuk stream ini"
```

### **Scenario 3: Session Expiry**
```
1. User bayar → Session created
2. 2 jam berlalu → Session expired
3. User akses stream → Access denied
4. User harus bayar lagi
```

### **Scenario 4: Multiple Streams**
```
1. User bayar Stream A → Access Stream A
2. User bayar Stream B → Access Stream B
3. Session A dan B independent
4. Masing-masing 2 jam expiry
```

## 🛠 **Admin Interface Features:**

### **Pending Payments Section:**
- ✅ List semua pending payments
- ✅ Session ID, Transaction ID, Stream ID
- ✅ Amount, User ID, Expiry time
- ✅ Approve button untuk setiap payment
- ✅ Real-time status update

### **All Sessions Section:**
- ✅ Table view semua sessions
- ✅ Status indicator (Pending/Paid/Expired)
- ✅ Remaining time display
- ✅ Created/Expired timestamps

### **Message System:**
- ✅ Success/Error messages
- ✅ Auto refresh setelah approve
- ✅ Loading states

## 📊 **Script Output Example:**

```bash
🔐 Payment Approval Tool
========================

🔍 Fetching pending sessions...
✅ Found 1 pending payment(s):

1. Session ID: session_1756584975508_abc123def
   Transaction ID: UPSTREAM-1756584975508-xyz789
   Stream ID: 4
   Amount: Rp 1,000
   User ID: demo-user
   Expires: 15/1/2025, 22:00:00

🔄 Approving payment...
   Session ID: session_1756584975508_abc123def
   Transaction ID: UPSTREAM-1756584975508-xyz789
✅ Payment berhasil diapprove!
   Stream ID: 4
   Amount: Rp 1,000
   Status: paid
   Paid At: 15/1/2025, 20:00:00
   Expires At: 15/1/2025, 22:00:00
   Remaining Time: 120 minutes

🔍 Checking access...
✅ User has paid access!
   Stream ID: 4
   Session ID: session_1756584975508_abc123def
   User ID: demo-user
   Paid At: 15/1/2025, 20:00:00
   Expires At: 15/1/2025, 22:00:00

🎉 Done!
```

## 🔒 **Security Features:**

### **Validation:**
- ✅ Session ID validation
- ✅ Transaction ID validation
- ✅ Stream ID validation
- ✅ User ID validation
- ✅ Expiry time validation

### **Access Control:**
- ✅ Admin-only approval
- ✅ Session-based verification
- ✅ Real-time status check
- ✅ Automatic cleanup

## 🎯 **Benefits:**

### **✅ Testing:**
- Easy payment approval untuk testing
- Multiple approval methods
- Detailed logging dan feedback
- Real-time status verification

### **✅ Development:**
- No need real payment untuk testing
- Quick iteration cycle
- Debug-friendly interface
- Comprehensive logging

### **✅ Production Ready:**
- Secure approval process
- Session management
- Access control
- Audit trail

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
