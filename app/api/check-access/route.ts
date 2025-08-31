import { NextRequest, NextResponse } from 'next/server'
import { hasPaidAccess, hasActivePaymentForStream, getActivePayments } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const streamId = searchParams.get('streamId')

    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID diperlukan' },
        { status: 400 }
      )
    }

    // Check if user has paid access
    const hasAccess = await hasPaidAccess(userId, streamId)
    
    if (hasAccess) {
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: true,
          streamId: streamId,
          userId: userId,
          message: 'User memiliki akses premium'
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: false,
          streamId: streamId,
          userId: userId,
          message: 'User belum membayar atau akses expired'
        }
      })
    }

  } catch (error) {
    console.error('Error checking access:', error)
    return NextResponse.json(
      { error: 'Gagal check access' },
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

    // Check if user has active payment for specific stream
    const hasActivePayment = await hasActivePaymentForStream(userId, streamId)
    
    if (hasActivePayment) {
      // Get active payments for user
      const activePayments = await getActivePayments(userId)
      const currentPayment = activePayments.find(p => p.stream_id === streamId)
      
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: true,
          streamId: streamId,
          userId: userId,
          payment: currentPayment ? {
            trxId: currentPayment.trx_id,
            amount: currentPayment.amount,
            paidAt: currentPayment.paid_at,
            expiresAt: currentPayment.expires_at,
            streamTitle: currentPayment.stream_title
          } : null,
          message: 'User memiliki akses premium untuk stream ini'
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: false,
          streamId: streamId,
          userId: userId,
          message: 'User belum memiliki akses untuk stream ini'
        }
      })
    }

  } catch (error) {
    console.error('Error checking user access:', error)
    return NextResponse.json(
      { error: 'Gagal check user access' },
      { status: 500 }
    )
  }
}
