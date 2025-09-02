import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Get payment statistics for each stream
    const result = await query(`
      SELECT 
        s.id as stream_id,
        s.title as stream_title,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_payments,
        COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount END), 0) as total_paid_amount
      FROM streams s
      LEFT JOIN payments p ON s.id = p.stream_id
      GROUP BY s.id, s.title
      ORDER BY s.created_at DESC
    `)

    interface PaymentRow {
      stream_id: string
      stream_title: string
      pending_payments: number
      paid_payments: number
      total_paid_amount: number
    }

    interface PaymentStatsResult {
      pending: number
      paid: number
      totalAmount: number
    }

    const paymentStats = (result.rows as PaymentRow[]).reduce((acc: Record<string, PaymentStatsResult>, row: PaymentRow) => {
      acc[row.stream_id] = {
        pending: row.pending_payments || 0,
        paid: row.paid_payments || 0,
        totalAmount: row.total_paid_amount || 0
      }
      return acc
    }, {})

    return NextResponse.json(paymentStats)
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    )
  }
}
