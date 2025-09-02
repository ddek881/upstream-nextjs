# Payment Warning Popup Feature

## Overview
Fitur popup peringatan yang muncul di halaman payment untuk memberitahu user bahwa pembayaran hanya bisa digunakan di 1 browser saja.

## Fitur
- ✅ Popup peringatan muncul saat halaman payment dibuka
- ✅ Popup muncul lagi jika halaman di-refresh
- ✅ Button "Saya Mengerti" untuk menutup popup
- ✅ Desain yang konsisten dengan tema aplikasi
- ✅ Responsive design untuk mobile dan desktop

## Komponen
- `PaymentWarningPopup.tsx` - Komponen popup yang reusable
- `app/payment/page.tsx` - Halaman payment yang menggunakan popup

## Cara Kerja
1. Saat halaman payment dimuat, state `showWarningPopup` diset ke `true`
2. Popup akan muncul di semua kondisi halaman (loading, error, success, dll)
3. User harus klik "Saya Mengerti" untuk menutup popup
4. Popup akan muncul lagi jika halaman di-refresh

## Styling
- Background: Gradient orange ke red dengan backdrop blur
- Border: Orange dengan opacity
- Text: White untuk judul, orange untuk deskripsi
- Button: Gradient orange ke red dengan hover effect

## Implementasi
```tsx
// State untuk mengontrol popup
const [showWarningPopup, setShowWarningPopup] = useState(false)

// Function untuk menutup popup
const handleWarningClose = () => {
  setShowWarningPopup(false)
}

// Popup muncul di semua kondisi
<PaymentWarningPopup isOpen={showWarningPopup} onClose={handleWarningClose} />
```

## Pesan Peringatan
"Pembayaran ini hanya bisa digunakan di **1 browser saja**. Jika Anda membuka halaman ini di browser lain, pembayaran mungkin tidak akan berfungsi dengan baik."

## Testing
- Buka halaman payment dengan parameter streamId
- Popup akan muncul otomatis
- Klik "Saya Mengerti" untuk menutup
- Refresh halaman, popup akan muncul lagi
