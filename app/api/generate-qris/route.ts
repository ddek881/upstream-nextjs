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

    // Generate QRIS data using external API first to get trx_id
    const qrisUsername = process.env.NEXT_PUBLIC_QRIS_USERNAME || 'upstream_live'
    const qrisUuid = process.env.NEXT_PUBLIC_QRIS_UUID || '2a27740e-3c41-449d-a6de-4dd35217e2da'
    const qrisApiUrl = process.env.NEXT_PUBLIC_QRIS_API_URL || 'https://rest.otomatis.vip/api/generate'
    
    const qrisResponse = await fetch(qrisApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: qrisUsername,
        amount: amount,
        uuid: qrisUuid,
        expire: 1200
      })
    })

    if (!qrisResponse.ok) {
      console.error('QRIS API Error:', qrisResponse.status, qrisResponse.statusText)
      const errorText = await qrisResponse.text()
      console.error('QRIS API Response:', errorText)
      return NextResponse.json(
        { error: `Gagal generate QRIS dari provider (${qrisResponse.status})` },
        { status: 500 }
      )
    }

    const qrisData = await qrisResponse.json()
    console.log('QRIS API Response:', qrisData)

    if (!qrisData.status || !qrisData.data || !qrisData.trx_id) {
      console.error('Invalid QRIS response:', qrisData)
      return NextResponse.json(
        { error: 'Response QRIS tidak valid dari provider' },
        { status: 500 }
      )
    }

    // Use trx_id from QRIS API response
    const trxId = qrisData.trx_id

    // Create payment record in database with trx_id from QRIS API
    const payment = await createPayment(userId, streamId, trxId, amount)

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
        expiresAt: new Date(payment.expired_at * 1000).toISOString(),
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
