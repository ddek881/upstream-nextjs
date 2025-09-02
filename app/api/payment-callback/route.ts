import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByTrxId, updatePaymentStatus, hasPaidAccess } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trxId = searchParams.get('trxId')
    const userId = searchParams.get('userId') || 'demo-user'
    const streamId = searchParams.get('streamId')

    if (!trxId) {
      return NextResponse.json(
        { error: 'Transaction ID diperlukan' },
        { status: 400 }
      )
    }

    // Get payment from database
    const payment = await getPaymentByTrxId(trxId)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if payment is expired
    const now = Math.floor(Date.now() / 1000)
    
    if (now > payment.expired_at && payment.status === 'pending') {
      await updatePaymentStatus(trxId, 'expired')
      payment.status = 'expired'
    }

    // Check if user has paid access (if streamId provided)
    let hasAccess = false
    if (streamId) {
      hasAccess = await hasPaidAccess(userId, streamId)
    }

    return NextResponse.json({
      success: true,
      data: {
        trxId: payment.trx_id,
        streamId: payment.stream_id,
        userId: payment.user_id,
        amount: payment.amount,
        status: payment.status,
        expiresAt: new Date(payment.expired_at * 1000).toISOString(),
        hasAccess: hasAccess
      }
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Gagal check payment status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { trxId, status } = await request.json()

    if (!trxId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID dan status diperlukan' },
        { status: 400 }
      )
    }

    // Update payment status in database
    const payment = await updatePaymentStatus(trxId, status)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status berhasil diupdate',
      data: {
        trxId: payment.trx_id,
        streamId: payment.stream_id,
        userId: payment.user_id,
        amount: payment.amount,
        status: payment.status,
        expiresAt: new Date(payment.expired_at * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Gagal update payment status' },
      { status: 500 }
    )
  }
}
