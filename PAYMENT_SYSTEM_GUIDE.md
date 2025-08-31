# 🔐 Payment System Guide - Upstream Streaming

## 🎯 **Sistem Payment yang Sederhana dan Sinkron**

### **Fitur Utama:**
- ✅ **Persistent Storage**: Session disimpan di file `data/sessions.json`
- ✅ **Auto Sync**: Session tidak hilang saat server restart
- ✅ **Simple Approval**: Satu command untuk approve payment
- ✅ **Real-time Access**: Check access langsung dari localStorage

## 🛠 **Tools yang Tersedia:**

### **1. Approve Payment Script:**
```bash
# Approve payment untuk stream tertentu
node scripts/approve-payment.js <stream_id>

# Contoh:
node scripts/approve-payment.js 2
node scripts/approve-payment.js 4
```

### **2. Admin Interface:**
```
http://localhost:3001/admin/approve
```

### **3. API Endpoints:**
- `POST /api/force-approve` - Approve payment
- `GET /api/check-access` - Check user access
- `GET /api/user-sessions` - Get user sessions

## 🔄 **Flow Payment:**

### **Step 1: User Klik "Bayar"**
- User diarahkan ke halaman payment
- QRIS code digenerate
- Session ID disimpan di localStorage

### **Step 2: Admin Approve Payment**
```bash
# Via terminal
node scripts/approve-payment.js 2

# Via admin interface
http://localhost:3001/admin/approve
```

### **Step 3: User Refresh Page**
- Session ID di localStorage otomatis ter-check
- Button berubah jadi "👑 Tonton"
- User bisa akses stream

## 📁 **File Structure:**

```
├── lib/
│   └── session.ts              # Session manager dengan persistent storage
├── app/
│   ├── api/
│   │   ├── force-approve/      # Approve payment API
│   │   ├── check-access/       # Check access API
│   │   └── user-sessions/      # User sessions API
│   └── admin/
│       └── approve/            # Admin interface
├── scripts/
│   └── approve-payment.js      # Approve payment script
└── data/
    └── sessions.json           # Persistent session storage
```

## 🔧 **Session Management:**

### **Session Properties:**
```typescript
interface PaymentSession {
  userId: string           // User identifier
  streamId: string         // Stream identifier
  trxId: string           // Transaction ID
  amount: number          // Payment amount
  status: 'pending' | 'paid' | 'expired'
  paidAt?: number         // Payment timestamp
  expiresAt: number       // Expiry timestamp (2 hours)
}
```

### **Session Duration:**
- **2 jam** per session
- **1 payment = 1 stream access**
- **Auto-expire** setelah 2 jam

### **Storage:**
- **File-based**: `data/sessions.json`
- **Persistent**: Tidak hilang saat server restart
- **Auto-save**: Setiap perubahan otomatis tersimpan

## 🎯 **Quick Commands:**

### **Approve Payment:**
```bash
# Approve stream 2
node scripts/approve-payment.js 2

# Approve stream 4
node scripts/approve-payment.js 4
```

### **Check Sessions:**
```bash
# Via API
curl "http://localhost:3001/api/user-sessions?userId=demo-user"

# Via admin interface
http://localhost:3001/admin/approve
```

### **Test Access:**
```bash
# Check specific access
curl "http://localhost:3001/api/check-access?sessionId=session_xxx&streamId=2"
```

## 🔍 **Troubleshooting:**

### **Problem: Session tidak bekerja**
```bash
# 1. Approve payment
node scripts/approve-payment.js 2

# 2. Copy commands dari output
# 3. Paste di browser console
# 4. Refresh page
```

### **Problem: Server restart**
```bash
# Session otomatis tersimpan di file
# Tidak perlu approve ulang
# Cukup refresh browser
```

### **Problem: Access denied**
```bash
# 1. Check admin interface
http://localhost:3001/admin/approve

# 2. Approve payment jika belum
node scripts/approve-payment.js <stream_id>

# 3. Refresh browser
```

## 📋 **Admin Interface Features:**

### **Quick Actions:**
- ✅ Approve Stream 2
- ✅ Approve Stream 4
- 🔄 Refresh Sessions

### **Session List:**
- Session ID
- Stream ID
- Status (PAID/PENDING/EXPIRED)
- Amount
- Created/Expires time
- Remaining time

## 🎯 **Best Practices:**

### **1. Always use approve script:**
```bash
node scripts/approve-payment.js <stream_id>
```

### **2. Check admin interface:**
```
http://localhost:3001/admin/approve
```

### **3. Verify access:**
```bash
curl "http://localhost:3001/api/check-access?sessionId=xxx&streamId=2"
```

### **4. Monitor sessions:**
- Check `data/sessions.json` untuk melihat semua sessions
- Sessions otomatis expired setelah 2 jam
- File-based storage = persistent across restarts

## 🔄 **Migration dari Sistem Lama:**

### **Jika ada session lama:**
1. **Hapus localStorage lama:**
   ```javascript
   localStorage.removeItem('currentSessionId')
   localStorage.removeItem('currentTrxId')
   ```

2. **Approve payment baru:**
   ```bash
   node scripts/approve-payment.js 2
   ```

3. **Set session baru:**
   ```javascript
   // Copy dari output script
   localStorage.setItem('currentSessionId', 'session_xxx')
   localStorage.setItem('currentTrxId', 'UPSTREAM-xxx')
   ```

4. **Refresh page**

---

**Status**: ✅ READY  
**Priority**: HIGH  
**Last Updated**: January 2025
