import { Pool } from 'pg'

// Database connection - disable native modules to avoid net.Socket error
const pool = new Pool({
  user: process.env.DB_USER || 'yandi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'upstream_db',
  password: process.env.DB_PASSWORD || 'yandi',
  port: parseInt(process.env.DB_PORT || '5432')
})

// Stream interface
export interface Stream {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  price: number
  is_live: boolean
  is_paid: boolean
  is_visible: boolean
  scheduled_time?: string
  estimated_duration?: string
  created_at?: string
  updated_at?: string
}

// Payment interface
export interface Payment {
  id: number
  user_id: string
  stream_id: string
  trx_id: string
  amount: number
  status: 'pending' | 'paid' | 'expired' | 'failed'
  paid_at?: string
  expires_at: string
  created_at?: string
  updated_at?: string
  stream_title?: string // Added for JOIN queries
}

// Database query function
export async function query(text: string, params?: (string | number | boolean | Date | null)[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

// Get all streams
export async function getStreams(): Promise<Stream[]> {
  const result = await query(`
    SELECT * FROM streams 
    WHERE is_visible = true 
    ORDER BY 
      is_live DESC, 
      CASE 
        WHEN is_live = true THEN 0 
        ELSE 1 
      END,
      scheduled_time ASC NULLS LAST,
      created_at DESC
  `)
  return result.rows
}

// Get stream by ID
export async function getStreamById(id: string): Promise<Stream | null> {
  const result = await query('SELECT * FROM streams WHERE id = $1', [id])
  return result.rows[0] || null
}

// Get live streams
export async function getLiveStreams(): Promise<Stream[]> {
  const result = await query('SELECT * FROM streams WHERE is_live = true AND is_visible = true ORDER BY created_at DESC')
  return result.rows
}

// Get paid streams
export async function getPaidStreams(): Promise<Stream[]> {
  const result = await query('SELECT * FROM streams WHERE is_paid = true AND is_visible = true ORDER BY created_at DESC')
  return result.rows
}

// Create payment record
export async function createPayment(userId: string, streamId: string, trxId: string, amount: number): Promise<Payment> {
  const expiresAt = new Date(Date.now() + (2 * 60 * 60 * 1000)) // 2 hours from now
  const result = await query(
    'INSERT INTO payments (user_id, stream_id, trx_id, amount, status, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, streamId, trxId, amount, 'pending', expiresAt]
  )
  return result.rows[0]
}

// Update payment status
export async function updatePaymentStatus(trxId: string, status: 'pending' | 'paid' | 'expired' | 'failed'): Promise<Payment | null> {
  const paidAt = status === 'paid' ? new Date() : null
  const result = await query(
    'UPDATE payments SET status = $1, paid_at = $2, updated_at = NOW() WHERE trx_id = $3 RETURNING *',
    [status, paidAt, trxId]
  )
  return result.rows[0] || null
}

// Get payment by transaction ID
export async function getPaymentByTrxId(trxId: string): Promise<Payment | null> {
  const result = await query('SELECT * FROM payments WHERE trx_id = $1', [trxId])
  return result.rows[0] || null
}

// Check if user has paid access to stream
export async function hasPaidAccess(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 AND stream_id = $2 AND status = $3 AND expires_at > NOW()',
    [userId, streamId, 'paid']
  )
  return result.rows.length > 0
}

// Get user's payment history
export async function getUserPayments(userId: string): Promise<Payment[]> {
  const result = await query(
    'SELECT p.*, s.title as stream_title FROM payments p JOIN streams s ON p.stream_id = s.id WHERE p.user_id = $1 ORDER BY p.created_at DESC',
    [userId]
  )
  return result.rows
}

// Get active payments for user
export async function getActivePayments(userId: string): Promise<Payment[]> {
  const result = await query(
    'SELECT p.*, s.title as stream_title FROM payments p JOIN streams s ON p.stream_id = s.id WHERE p.user_id = $1 AND p.status = $2 AND p.expires_at > NOW() ORDER BY p.created_at DESC',
    [userId, 'paid']
  )
  return result.rows
}

// Check if user has active payment for specific stream
export async function hasActivePaymentForStream(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 AND stream_id = $2 AND status = $3 AND expires_at > NOW()',
    [userId, streamId, 'paid']
  )
  return result.rows.length > 0
}

// Check if user has used trial for specific stream
export async function hasUsedTrial(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM trial_usage WHERE user_id = $1 AND stream_id = $2',
    [userId, streamId]
  )
  return result.rows.length > 0
}

// Record trial usage for user and stream
export async function recordTrialUsage(userId: string, streamId: string): Promise<void> {
  await query(
    'INSERT INTO trial_usage (user_id, stream_id) VALUES ($1, $2) ON CONFLICT (user_id, stream_id) DO NOTHING',
    [userId, streamId]
  )
}

// Get trial usage history for user
export async function getUserTrialHistory(userId: string): Promise<any[]> {
  const result = await query(
    'SELECT tu.*, s.title as stream_title FROM trial_usage tu JOIN streams s ON tu.stream_id = s.id WHERE tu.user_id = $1 ORDER BY tu.used_at DESC',
    [userId]
  )
  return result.rows
}

// Clean expired payments
export async function cleanExpiredPayments(): Promise<void> {
  await query('UPDATE payments SET status = $1 WHERE expires_at <= NOW() AND status = $2', ['expired', 'pending'])
}

export default pool
