import { NextRequest, NextResponse } from 'next/server'
import { getActivePayments, getUserPayments } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // Get user's active payments
    const activePayments = await getActivePayments(userId)
    
    // Format payments for response
    const formattedPayments = activePayments.map(payment => ({
      id: payment.id,
      trxId: payment.trx_id,
      streamId: payment.stream_id,
      streamTitle: payment.stream_title,
      userId: payment.user_id,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paid_at,
      expiresAt: payment.expires_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      remainingTime: Math.max(0, new Date(payment.expires_at).getTime() - Date.now())
    }))

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        activePayments: formattedPayments,
        totalPayments: formattedPayments.length
      }
    })

  } catch (error) {
    console.error('Error fetching user payments:', error)
    return NextResponse.json(
      { error: 'Gagal fetch user payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId = 'demo-user', streamId } = await request.json()

    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID diperlukan' },
        { status: 400 }
      )
    }

    // Get all user payments
    const userPayments = await getUserPayments(userId)
    const streamPayment = userPayments.find(p => p.stream_id === streamId)
    
    if (streamPayment) {
      return NextResponse.json({
        success: true,
        data: {
          hasPayment: true,
          streamId: streamId,
          userId: userId,
          payment: {
            id: streamPayment.id,
            trxId: streamPayment.trx_id,
            amount: streamPayment.amount,
            status: streamPayment.status,
            paidAt: streamPayment.paid_at,
            expiresAt: streamPayment.expires_at,
            streamTitle: streamPayment.stream_title,
            remainingTime: Math.max(0, new Date(streamPayment.expires_at).getTime() - Date.now())
          }
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasPayment: false,
          streamId: streamId,
          userId: userId,
          message: 'User belum memiliki payment untuk stream ini'
        }
      })
    }

  } catch (error) {
    console.error('Error checking user payment:', error)
    return NextResponse.json(
      { error: 'Gagal check user payment' },
      { status: 500 }
    )
  }
}
