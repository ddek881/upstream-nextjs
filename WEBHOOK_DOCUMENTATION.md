# Payment Webhook Documentation

## Endpoint
```
POST https://live.fast-stream.video/api/payment-webhook
```

## Description
Endpoint untuk menerima callback dari payment gateway pihak ketiga. Setiap callback yang masuk dianggap sebagai pembayaran yang berhasil.

## Request Format

### Minimal Required Data
```json
{
  "trx_id": "UPSTREAM-1756665643024-w3irggg6g"
}
```

### Complete Data Format
```json
{
  "amount": 1000,
  "terminal_id": "test",
  "merchant_id": "uuid",
  "trx_id": "UPSTREAM-1756665643024-w3irggg6g",
  "rrn": "112233445566",
  "custom_ref": "",
  "vendor": "NOBU",
  "status": "success",
  "created_at": "2023-07-31T10:49:37",
  "finish_at": "2023-07-31T08:49:56"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trx_id` | string | ✅ | Transaction ID yang didapat saat generate QRIS |
| `amount` | number | ❌ | Jumlah pembayaran (optional) |
| `terminal_id` | string | ❌ | ID terminal (optional) |
| `merchant_id` | string | ❌ | ID merchant (optional) |
| `rrn` | string | ❌ | Reference number (optional) |
| `custom_ref` | string | ❌ | Custom reference (optional) |
| `vendor` | string | ❌ | Payment vendor (optional) |
| `status` | string | ❌ | Payment status (optional) |
| `created_at` | string | ❌ | Created timestamp (optional) |
| `finish_at` | string | ❌ | Finished timestamp (optional) |

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "trx_id": "UPSTREAM-1756665643024-w3irggg6g",
    "status": "paid",
    "amount": 1000,
    "vendor": "NOBU",
    "rrn": "112233445566",
    "has_access": true,
    "processed_at": "2025-08-31T18:45:30.123Z"
  }
}
```

### Already Processed Response
```json
{
  "success": true,
  "message": "Payment already processed",
  "data": {
    "trx_id": "UPSTREAM-1756665643024-w3irggg6g",
    "status": "paid",
    "already_processed": true
  }
}
```

### Error Responses

#### Payment Not Found
```json
{
  "error": "Payment not found"
}
```

#### Missing trx_id
```json
{
  "error": "Invalid webhook data: trx_id required"
}
```

#### Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Logic Flow

1. **Validate trx_id** - Pastikan `trx_id` ada dalam request
2. **Find Payment** - Cari payment berdasarkan `trx_id` di database
3. **Check Status** - Jika payment sudah `paid`, return "already processed"
4. **Update Status** - Update payment status menjadi `paid`
5. **Check Access** - Verifikasi user memiliki akses ke stream
6. **Return Response** - Return response dengan data lengkap

## Testing

### Test dengan trx_id minimal
```bash
curl -X POST https://live.fast-stream.video/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{"trx_id": "UPSTREAM-1756665643024-w3irggg6g"}'
```

### Test dengan data lengkap
```bash
curl -X POST https://live.fast-stream.video/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "terminal_id": "test",
    "merchant_id": "uuid",
    "trx_id": "UPSTREAM-1756665643024-w3irggg6g",
    "rrn": "112233445566",
    "custom_ref": "",
    "vendor": "NOBU",
    "status": "success",
    "created_at": "2023-07-31T10:49:37",
    "finish_at": "2023-07-31T08:49:56"
  }'
```

## Notes

- **Hanya `trx_id` yang wajib** - Semua field lain optional
- **Callback = Success** - Setiap callback dianggap pembayaran berhasil
- **Idempotent** - Jika payment sudah `paid`, tidak akan diupdate lagi
- **Logging** - Semua webhook akan di-log untuk monitoring
- **Access Check** - Otomatis mengecek akses user setelah payment berhasil

## Integration

Untuk mengintegrasikan dengan payment gateway:

1. **Generate QRIS** - Gunakan `/api/generate-qris` untuk membuat payment
2. **Get trx_id** - Ambil `trx_id` dari response QRIS
3. **Configure Webhook** - Set webhook URL ke payment gateway
4. **Receive Callback** - Payment gateway akan POST ke webhook endpoint
5. **Verify Payment** - Gunakan `/api/check-access` untuk verifikasi akses
