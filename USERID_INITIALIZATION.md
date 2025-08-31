# 🆔 UserID Initialization System - Upstream Streaming

## 🎯 **Sistem Inisialisasi UserID Otomatis**

### **Fitur Utama:**
- ✅ **Auto Check**: Periksa userId di localStorage saat pertama kali akses
- ✅ **Auto Generate**: Buat userId baru jika belum ada
- ✅ **Global Provider**: UserID tersedia di seluruh aplikasi
- ✅ **Loading State**: Tampilkan loading saat inisialisasi
- ✅ **Persistent**: UserID tersimpan permanen di localStorage

## 🔄 **Flow Inisialisasi:**

### **1. Pertama Kali Akses Website:**
```javascript
// Check localStorage
const storedUserId = localStorage.getItem('currentUserId')

if (storedUserId) {
  // User ID sudah ada
  setUserId(storedUserId)
} else {
  // Generate new user ID
  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('currentUserId', newUserId)
  setUserId(newUserId)
}
```

### **2. Provider Setup:**
```jsx
// app/layout.tsx
<UserIDProvider>
  <div className="min-h-screen">
    <Header />
    <main>{children}</main>
  </div>
</UserIDProvider>
```

### **3. Hook Usage:**
```jsx
// Di komponen manapun
const { userId, setUserId, isLoading } = useUserID()
```

## 🛠️ **Components:**

### **1. UserIDProvider:**
```tsx
// components/UserIDProvider.tsx
export function UserIDProvider({ children }) {
  const [userId, setUserIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage
    const storedUserId = localStorage.getItem('currentUserId')
    
    if (storedUserId) {
      setUserIdState(storedUserId)
      setIsLoading(false)
    } else {
      // Generate new user ID
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('currentUserId', newUserId)
      setUserIdState(newUserId)
      setIsLoading(false)
    }
  }, [])

  return (
    <UserIDContext.Provider value={{ userId, setUserId, isLoading }}>
      {children}
    </UserIDContext.Provider>
  )
}
```

### **2. useUserID Hook:**
```tsx
export function useUserID() {
  const context = useContext(UserIDContext)
  if (context === undefined) {
    throw new Error('useUserID must be used within a UserIDProvider')
  }
  return context
}
```

## 📁 **File Structure:**

```
├── components/
│   ├── UserIDProvider.tsx      # Provider untuk userId
│   ├── HomePage.tsx            # Menggunakan useUserID
│   ├── StreamCard.tsx          # Menggunakan useUserID
│   └── ...
├── app/
│   ├── layout.tsx              # Wrap dengan UserIDProvider
│   ├── payment/page.tsx        # Menggunakan useUserID
│   ├── stream/page.tsx         # Menggunakan useUserID
│   └── ...
```

## 🎯 **User Experience:**

### **1. First Time User:**
1. **Visit website** → Loading screen
2. **Check localStorage** → No userId found
3. **Generate userId** → `user_1234567890_abc123`
4. **Save to localStorage** → Persistent storage
5. **Show homepage** → UserID displayed

### **2. Returning User:**
1. **Visit website** → Loading screen
2. **Check localStorage** → userId found
3. **Load existing userId** → `user_1234567890_abc123`
4. **Show homepage** → UserID displayed

### **3. Loading States:**
```jsx
// Show loading while userId is being initialized
if (userIdLoading) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Menyiapkan aplikasi...</p>
      {userId && <p>User ID: {userId}</p>}
    </div>
  )
}
```

## 🔧 **Implementation:**

### **1. Layout Setup:**
```tsx
// app/layout.tsx
import { UserIDProvider } from '@/components/UserIDProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <UserIDProvider>
          <div className="min-h-screen">
            <Header />
            <main>{children}</main>
          </div>
        </UserIDProvider>
      </body>
    </html>
  )
}
```

### **2. Component Usage:**
```tsx
// components/HomePage.tsx
import { useUserID } from './UserIDProvider'

export default function HomePage() {
  const { userId, isLoading: userIdLoading } = useUserID()

  if (userIdLoading) {
    return <LoadingScreen />
  }

  return (
    <div>
      <h1>Welcome to UpStream</h1>
      <div className="user-id-display">
        <p>User ID: {userId}</p>
      </div>
    </div>
  )
}
```

### **3. Payment Integration:**
```tsx
// app/payment/page.tsx
import { useUserID } from '@/components/UserIDProvider'

export default function PaymentPage() {
  const { userId, isLoading: userIdLoading } = useUserID()

  const generateQRIS = async () => {
    const requestBody = {
      streamId: streamId,
      amount: stream?.price || 0,
      userId: userId  // Use userId from context
    }
    // ... rest of the code
  }
}
```

## 🎨 **UI Features:**

### **1. Loading Screen:**
- Spinner animation
- "Menyiapkan aplikasi..." text
- UserID display (if available)

### **2. UserID Display:**
- Homepage shows user ID
- Payment page shows user ID
- Stream page shows user ID

### **3. Error Handling:**
- Context error if used outside provider
- Fallback for localStorage errors
- Graceful degradation

## 🔍 **Benefits:**

### **1. User Experience:**
- ✅ Seamless first-time experience
- ✅ No manual user registration
- ✅ Persistent user identification
- ✅ Loading states for clarity

### **2. Technical:**
- ✅ Global state management
- ✅ Context-based sharing
- ✅ Automatic initialization
- ✅ Error handling

### **3. Business:**
- ✅ User tracking
- ✅ Payment history
- ✅ Access control
- ✅ Analytics

## 🚀 **Usage Examples:**

### **1. Check User Access:**
```tsx
const { userId } = useUserID()

const checkAccess = async () => {
  const response = await fetch(`/api/check-access?userId=${userId}&streamId=${streamId}`)
  // ... handle response
}
```

### **2. Generate Payment:**
```tsx
const { userId } = useUserID()

const generatePayment = async () => {
  const response = await fetch('/api/generate-qris', {
    method: 'POST',
    body: JSON.stringify({ streamId, amount, userId })
  })
  // ... handle response
}
```

### **3. Display User Info:**
```tsx
const { userId } = useUserID()

return (
  <div className="user-info">
    <p>User ID: {userId}</p>
    <p>Status: Active</p>
  </div>
)
```

---

**Status**: ✅ IMPLEMENTED  
**Priority**: HIGH  
**Last Updated**: January 2025
