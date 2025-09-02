import { NextRequest, NextResponse } from 'next/server'
import { getPaymentByTrxId, updatePaymentStatus, hasPaidAccess, query, Payment } from '@/lib/database'

// Payment webhook interface
interface PaymentWebhook {
  amount: number
  terminal_id: string
  merchant_id: string
  trx_id: string
  rrn: string
  custom_ref: string
  vendor: string
  status: 'success' | 'failed' | 'pending' | 'expired'
  created_at: string
  finish_at: string
}

export async function POST(request: NextRequest) {
  try {
    const webhookData: PaymentWebhook = await request.json()
    
    console.log('Payment webhook received:', webhookData)
    
    // Validate required field - only trx_id is needed
    if (!webhookData.trx_id) {
      console.error('Invalid webhook data: missing trx_id')
      return NextResponse.json(
        { error: 'Invalid webhook data: trx_id required' },
        { status: 400 }
      )
    }
    
    // Get payment from database - try multiple ways to find payment
    let payment = await getPaymentByTrxId(webhookData.trx_id)
    
    // If not found by trx_id, try to find by RRN (Reference Number)
    if (!payment && webhookData.rrn) {
      console.log('Payment not found by trx_id, trying RRN:', webhookData.rrn)
      payment = await getPaymentByTrxId(webhookData.rrn)
    }
    
    // If still not found, try to find recent pending payment for this user and stream
    if (!payment && webhookData.amount) {
      console.log('Trying to find recent pending payment for amount:', webhookData.amount)
      const recentPayments = await query(
        'SELECT * FROM payments WHERE amount = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
        [webhookData.amount, 'pending']
      )
      if (recentPayments.rows.length > 0) {
        payment = recentPayments.rows[0] as Payment
        console.log('Found recent pending payment:', payment?.trx_id)
      }
    }
    
    if (!payment) {
      console.error('Payment not found for trx_id:', webhookData.trx_id, 'RRN:', webhookData.rrn)
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Check if payment is already paid
    if (payment.status === 'paid') {
      console.log('Payment already paid for trx_id:', webhookData.trx_id)
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        data: {
          trx_id: webhookData.trx_id,
          status: 'paid',
          already_processed: true
        }
      })
    }
    
    // Update payment status to paid (since callback = success)
    const updatedPayment = await updatePaymentStatus(webhookData.trx_id, 'paid')
    
    if (!updatedPayment) {
      console.error('Failed to update payment status')
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }
    
    // Log successful payment update
    console.log('Payment status updated to paid:', {
      trx_id: webhookData.trx_id,
      old_status: payment.status,
      vendor: webhookData.vendor || 'unknown',
      amount: webhookData.amount || payment.amount,
      rrn: webhookData.rrn || 'unknown'
    })
    
    // Check if user has access
    const hasAccess = await hasPaidAccess(payment.user_id, payment.stream_id)
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        trx_id: webhookData.trx_id,
        status: 'paid',
        amount: payment.amount,
        vendor: webhookData.vendor || 'unknown',
        rrn: webhookData.rrn || 'unknown',
        has_access: hasAccess,
        processed_at: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error processing payment webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for webhook verification (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trxId = searchParams.get('trx_id')
    
    if (!trxId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      )
    }
    
    // Get payment status
    const payment = await getPaymentByTrxId(trxId)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Check if user has access
    const hasAccess = await hasPaidAccess(payment.user_id, payment.stream_id)
    
    return NextResponse.json({
      success: true,
      data: {
        trx_id: payment.trx_id,
        status: payment.status,
        amount: payment.amount,
        has_access: hasAccess,
        expires_at: new Date(payment.expired_at * 1000).toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
