# Trial Tracking System

## 🎯 **Fitur Trial Tracking**

### **1. Konsep Dasar:**
- ✅ **1 User = 1 Trial per Stream** - Setiap user hanya bisa menggunakan trial 7 detik sekali per stream
- ✅ **Persistent Storage** - Data trial usage disimpan di database PostgreSQL
- ✅ **Real-time Check** - Status trial dicek secara real-time saat user membuka stream
- ✅ **Automatic Recording** - Trial usage otomatis dicatat saat user memulai trial

### **2. Database Schema:**

#### **Tabel `trial_usage`:**
```sql
CREATE TABLE IF NOT EXISTS trial_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stream_id UUID NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
    UNIQUE(user_id, stream_id)
);
```

#### **Index untuk Performance:**
```sql
CREATE INDEX IF NOT EXISTS idx_trial_usage_user_stream ON trial_usage(user_id, stream_id);
```

### **3. API Endpoints:**

#### **GET `/api/check-trial`**
**Purpose:** Mengecek apakah user sudah menggunakan trial untuk stream tertentu

**Parameters:**
- `userId` (string): ID user
- `streamId` (string): ID stream

**Response:**
```json
{
  "success": true,
  "data": {
    "hasUsedTrial": false,
    "canUseTrial": true
  }
}
```

#### **POST `/api/check-trial`**
**Purpose:** Mencatat trial usage untuk user dan stream

**Body:**
```json
{
  "userId": "user_123",
  "streamId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trial usage berhasil dicatat",
  "data": {
    "userId": "user_123",
    "streamId": "550e8400-e29b-41d4-a716-446655440002",
    "usedAt": "2025-08-31T16:30:51.595Z"
  }
}
```

### **4. Database Functions:**

#### **`hasUsedTrial(userId, streamId)`**
```typescript
export async function hasUsedTrial(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM trial_usage WHERE user_id = $1 AND stream_id = $2',
    [userId, streamId]
  )
  return result.rows.length > 0
}
```

#### **`recordTrialUsage(userId, streamId)`**
```typescript
export async function recordTrialUsage(userId: string, streamId: string): Promise<void> {
  await query(
    'INSERT INTO trial_usage (user_id, stream_id) VALUES ($1, $2) ON CONFLICT (user_id, stream_id) DO NOTHING',
    [userId, streamId]
  )
}
```

#### **`getUserTrialHistory(userId)`**
```typescript
export async function getUserTrialHistory(userId: string): Promise<any[]> {
  const result = await query(
    'SELECT tu.*, s.title as stream_title FROM trial_usage tu JOIN streams s ON tu.stream_id = s.id WHERE tu.user_id = $1 ORDER BY tu.used_at DESC',
    [userId]
  )
  return result.rows
}
```

### **5. Frontend Implementation:**

#### **State Management:**
```typescript
const [hasUsedTrial, setHasUsedTrial] = useState(false)
const [checkingTrial, setCheckingTrial] = useState(false)
```

#### **Check Trial Usage:**
```typescript
const checkTrialUsage = async () => {
  if (!userId) return
  
  try {
    setCheckingTrial(true)
    const response = await fetch(`/api/check-trial?userId=${userId}&streamId=${stream.id}`)
    if (response.ok) {
      const data = await response.json()
      setHasUsedTrial(data.data.hasUsedTrial)
    }
  } catch (error) {
    console.error('Error checking trial usage:', error)
  } finally {
    setCheckingTrial(false)
  }
}
```

#### **Start Trial:**
```typescript
const startTrial = async () => {
  if (!userId || hasUsedTrial) return
  
  try {
    // Record trial usage first
    const response = await fetch('/api/check-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streamId: stream.id })
    })

    if (response.ok) {
      // Start trial
      setIsTrialActive(true)
      setHasUsedTrial(true)
      startCountdown()
    } else {
      const errorData = await response.json()
      alert(errorData.error || 'Gagal memulai trial')
    }
  } catch (error) {
    console.error('Error starting trial:', error)
    alert('Gagal memulai trial')
  }
}
```

### **6. UI Behavior:**

#### **Button States:**
1. **Trial Available:** "Uji Coba 7s" (biru, bisa diklik)
2. **Trial Active:** "Trial Aktif" (disabled, sedang berjalan)
3. **Trial Used:** "Trial Terpakai" (abu-abu, tidak bisa diklik)
4. **Loading:** Spinner dengan "Cek Akses..."

#### **Visual Indicators:**
- ✅ **Trial Available:** Button biru dengan hover effect
- ✅ **Trial Active:** Button disabled dengan opacity 50%
- ✅ **Trial Used:** Badge abu-abu dengan text "Trial Terpakai"
- ✅ **Loading State:** Spinner dengan text "Cek Akses..."

### **7. User Experience Flow:**

#### **First Time User:**
1. User membuka stream berbayar
2. Sistem mengecek trial usage (belum ada)
3. Button "Uji Coba 7s" ditampilkan
4. User klik button
5. Trial usage dicatat di database
6. Video trial dimulai (7 detik)
7. Setelah 7 detik, redirect ke payment page

#### **Returning User (Sudah Trial):**
1. User membuka stream berbayar yang sama
2. Sistem mengecek trial usage (sudah ada)
3. Badge "Trial Terpakai" ditampilkan
4. User hanya bisa klik "Bayar"

#### **Different Stream:**
1. User membuka stream berbayar yang berbeda
2. Sistem mengecek trial usage untuk stream tersebut
3. Jika belum trial, button "Uji Coba 7s" ditampilkan
4. Jika sudah trial, badge "Trial Terpakai" ditampilkan

### **8. Security Features:**

#### **Database Constraints:**
- ✅ **UNIQUE(user_id, stream_id)** - Mencegah duplicate trial usage
- ✅ **FOREIGN KEY** - Memastikan stream_id valid
- ✅ **CASCADE DELETE** - Trial usage dihapus jika stream dihapus

#### **API Validation:**
- ✅ **Required Parameters** - userId dan streamId wajib ada
- ✅ **Duplicate Check** - Mencegah recording trial yang sudah ada
- ✅ **Error Handling** - Response error yang informatif

### **9. Performance Optimization:**

#### **Database Indexes:**
- ✅ **idx_trial_usage_user_stream** - Fast lookup untuk user + stream
- ✅ **Composite Index** - Optimal untuk query yang sering digunakan

#### **Caching Strategy:**
- ✅ **Client-side State** - Trial status disimpan di component state
- ✅ **Real-time Check** - Status dicek saat component mount
- ✅ **Minimal API Calls** - Hanya panggil API saat diperlukan

### **10. Testing:**

#### **API Testing:**
```bash
# Check trial status
curl -X GET "http://localhost:3000/api/check-trial?userId=test-user&streamId=stream-123"

# Record trial usage
curl -X POST "http://localhost:3000/api/check-trial" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","streamId":"stream-123"}'
```

#### **Expected Results:**
1. **First Check:** `hasUsedTrial: false, canUseTrial: true`
2. **After Recording:** `hasUsedTrial: true, canUseTrial: false`
3. **Duplicate Recording:** Error "Anda sudah menggunakan trial untuk stream ini"

### **11. Maintenance:**

#### **Database Cleanup:**
```sql
-- View trial usage statistics
SELECT COUNT(*) as total_trials FROM trial_usage;

-- View trial usage by user
SELECT user_id, COUNT(*) as trial_count 
FROM trial_usage 
GROUP BY user_id 
ORDER BY trial_count DESC;

-- View trial usage by stream
SELECT s.title, COUNT(*) as trial_count 
FROM trial_usage tu 
JOIN streams s ON tu.stream_id = s.id 
GROUP BY s.id, s.title 
ORDER BY trial_count DESC;
```

#### **Monitoring:**
- ✅ **Trial Usage Analytics** - Track berapa banyak trial yang digunakan
- ✅ **User Behavior** - Analisis pola penggunaan trial
- ✅ **Stream Performance** - Stream mana yang paling banyak di-trial

---

## ✅ **Kesimpulan**

Sistem trial tracking memberikan:

1. **Kontrol Penuh** - Setiap user hanya bisa trial sekali per stream
2. **Data Persistence** - Trial usage tersimpan permanen di database
3. **Real-time Updates** - Status trial update secara real-time
4. **User Experience** - UI yang jelas menunjukkan status trial
5. **Security** - Mencegah abuse dengan database constraints
6. **Analytics** - Data untuk analisis penggunaan trial

**Implementasi ini memastikan fair usage dan mencegah abuse terhadap fitur trial.**
