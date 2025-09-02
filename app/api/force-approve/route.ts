import { NextRequest, NextResponse } from 'next/server'
import { hasActivePaymentForStream, createPayment, updatePaymentStatus } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { streamId, userId = 'demo-user' } = await request.json()

    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID diperlukan' },
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
    const amount = 1000

    // Create payment record in database
    const payment = await createPayment(userId, streamId, trxId, amount)

    // Immediately update to paid status
    const updatedPayment = await updatePaymentStatus(trxId, 'paid')
    
    if (updatedPayment) {
      return NextResponse.json({
        success: true,
        message: 'Payment berhasil diapprove secara paksa',
        data: {
          trxId: updatedPayment.trx_id,
          streamId: updatedPayment.stream_id,
          userId: updatedPayment.user_id,
          amount: updatedPayment.amount,
          status: updatedPayment.status,
          expiresAt: new Date(updatedPayment.expired_at * 1000).toISOString()
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Gagal approve payment' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error force approving payment:', error)
    return NextResponse.json(
      { error: 'Gagal force approve payment' },
      { status: 500 }
    )
  }
}
