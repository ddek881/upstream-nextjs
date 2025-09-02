import { NextRequest, NextResponse } from 'next/server'
import { createPayment, hasActivePaymentForStream } from '@/lib/database'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { streamId, amount, userId = 'demo-user' } = await request.json()

    if (!streamId || !amount) {
      return NextResponse.json(
        { error: 'Stream ID dan amount diperlukan' },
        { status: 400 }
      )
    }

    // Check if user already has active payment for this stream
    const hasActivePayment = await hasActivePaymentForStream(userId, streamId)
    if (hasActivePayment) {
      return NextResponse.json(
        { error: 'Anda sudah memiliki akses untuk stream ini' },
        { status: 400 }
      )
    }

    // Generate mock trx_id for testing (format similar to real QRIS API)
    const trxId = `03C${Math.random().toString(16).substr(2, 14)}`

    // Create payment record in database
    const payment = await createPayment(userId, streamId, trxId, amount)

    // Generate mock QRIS data for testing
    const mockQrisData = `00020101021226550014ID.CO.QRIS.WWW011893600914${trxId}52045${amount}5303360540${amount}6304ABCD`

    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(mockQrisData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'QRIS Test berhasil digenerate',
      data: {
        qrCode: qrCodeDataUrl,
        trxId: trxId,
        amount: amount,
        streamId: streamId,
        userId: userId,
        expiresAt: new Date(payment.expired_at * 1000).toISOString(),
        qrisData: mockQrisData,
        isTestMode: true
      }
    })

  } catch (error) {
    console.error('Error generating QRIS fallback:', error)
    return NextResponse.json(
      { error: 'Gagal generate QRIS test' },
      { status: 500 }
    )
  }
}

// Simple CRC16 function for QRIS
function generateCRC16(data: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}
