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

    // Generate unique transaction ID
    const trxId = `UPSTREAM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create payment record in database
    const payment = await createPayment(userId, streamId, trxId, amount)

    // Generate QRIS data using external API
    const qrisResponse = await fetch('https://rest.otomatis.vip/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        amount: amount,
        uuid: '2a27740e-3c41-449d-a6de-4dd35217e2da',
        expire: 1200
      })
    })

    if (!qrisResponse.ok) {
      return NextResponse.json(
        { error: 'Gagal generate QRIS dari provider' },
        { status: 500 }
      )
    }

    const qrisData = await qrisResponse.json()

    if (!qrisData.status || !qrisData.data) {
      return NextResponse.json(
        { error: 'Response QRIS tidak valid' },
        { status: 500 }
      )
    }

    // Generate QR code data URL using local library
    const qrCodeDataUrl = await QRCode.toDataURL(qrisData.data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'QRIS berhasil digenerate',
      data: {
        qrCode: qrCodeDataUrl,
        trxId: trxId,
        amount: amount,
        streamId: streamId,
        userId: userId,
        expiresAt: payment.expires_at,
        qrisData: qrisData.data
      }
    })

  } catch (error) {
    console.error('Error generating QRIS:', error)
    return NextResponse.json(
      { error: 'Gagal generate QRIS' },
      { status: 500 }
    )
  }
}
