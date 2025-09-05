import mysql from 'mysql2/promise'

// Database connection pool for MySQL (optimized for high performance)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'upstream_user',
  password: process.env.DB_PASSWORD || 'upstream_password',
  database: process.env.DB_NAME || 'upstream_db',
  
  // Connection pool settings for high performance
  connectionLimit: 20,
  
  // Query settings
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // Performance optimizations
  multipleStatements: false,
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: true
})

// Category interface
export interface Category {
  id: string
  name: string
  img_url?: string
  created_at?: string
  updated_at?: string
}

// Stream interface
export interface Stream {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  category?: string
  price: number
  is_live: boolean
  is_paid: boolean
  is_visible: boolean
  is_popular?: boolean
  scheduled_time?: string
  estimated_duration?: string
  chat_live?: string
  chat_nolive?: string
  view?: number
  created_at?: string
  updated_at?: string
}

// Payment interface
export interface Payment {
  id: string
  user_id: string
  stream_id: string
  trx_id: string
  amount: number
  qris_data: string
  status: 'pending' | 'paid' | 'expired' | 'failed'
  expired_at: number
  created_at?: string
  stream_title?: string // Added for JOIN queries
}

// Viewer interface
export interface Viewer {
  id: number
  user_id: string
  stream_id: string
  created_at?: string
}

// Database query function
export async function query(text: string, params?: (string | number | boolean | Date | null)[]) {
  try {
    const start = Date.now()
    const [rows] = await pool.execute(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: Array.isArray(rows) ? rows.length : 1 })
    return { rows: Array.isArray(rows) ? rows : [rows], rowCount: Array.isArray(rows) ? rows.length : 1 }
  } catch (error) {
    console.error('Database query error:', error)
    console.error('Query:', text)
    console.error('Params:', params)
    throw error
  }
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
      scheduled_time ASC,
      created_at DESC
  `)
  return result.rows as Stream[]
}

// Get stream by ID
export async function getStreamById(id: string): Promise<Stream | null> {
  const result = await query('SELECT * FROM streams WHERE id = ?', [id])
  return (result.rows[0] as Stream) || null
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const result = await query('SELECT * FROM categories ORDER BY name ASC')
  return result.rows as Category[]
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await query('SELECT * FROM categories WHERE id = ?', [id])
  return (result.rows[0] as Category) || null
}

// Create category
export async function createCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category> {
  const result = await query(
    'INSERT INTO categories (id, name, img_url) VALUES (?, ?, ?)',
    [category.id, category.name, category.img_url || null]
  )
  return { ...category, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
}

// Update category
export async function updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
  const fields = []
  const values = []
  
  if (category.name !== undefined) {
    fields.push('name = ?')
    values.push(category.name)
  }
  if (category.img_url !== undefined) {
    fields.push('img_url = ?')
    values.push(category.img_url)
  }
  
  if (fields.length === 0) return null
  
  values.push(id)
  const result = await query(
    `UPDATE categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  )
  
  if (result.rowCount === 0) return null
  return getCategoryById(id)
}

// Delete category
export async function deleteCategory(id: string): Promise<boolean> {
  const result = await query('DELETE FROM categories WHERE id = ?', [id])
  return result.rowCount > 0
}

// Get live streams
export async function getLiveStreams(): Promise<Stream[]> {
  const result = await query('SELECT * FROM streams WHERE is_live = true AND is_visible = true ORDER BY created_at DESC')
  return result.rows as Stream[]
}

// Get paid streams
export async function getPaidStreams(): Promise<Stream[]> {
  const result = await query('SELECT * FROM streams WHERE is_paid = true AND is_visible = true ORDER BY created_at DESC')
  return result.rows as Stream[]
}

// Create payment record
export async function createPayment(userId: string, streamId: string, trxId: string, amount: number): Promise<Payment> {
  const expiredAt = Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours from now as Unix timestamp
  const result = await query(
    'INSERT INTO payments (id, user_id, stream_id, trx_id, amount, qris_data, status, expired_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
    [userId, streamId, trxId, amount, '', 'pending', expiredAt]
  )
  // Get the inserted record
  const payment = await getPaymentByTrxId(trxId)
  return payment!
}

// Update payment status
export async function updatePaymentStatus(trxId: string, status: 'pending' | 'paid' | 'expired' | 'failed'): Promise<Payment | null> {
  await query('UPDATE payments SET status = ? WHERE trx_id = ?', [status, trxId])
  return await getPaymentByTrxId(trxId)
}

// Get payment by transaction ID
export async function getPaymentByTrxId(trxId: string): Promise<Payment | null> {
  const result = await query('SELECT * FROM payments WHERE trx_id = ?', [trxId])
  return (result.rows[0] as Payment) || null
}

// Check if user has paid access to stream
export async function hasPaidAccess(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = ? AND stream_id = ? AND status = ? AND expired_at > UNIX_TIMESTAMP()',
    [userId, streamId, 'paid']
  )
  return result.rows.length > 0
}

// Get user's payment history
export async function getUserPayments(userId: string): Promise<Payment[]> {
  const result = await query(
    'SELECT p.*, s.title as stream_title FROM payments p JOIN streams s ON p.stream_id = s.id WHERE p.user_id = ? ORDER BY p.created_at DESC',
    [userId]
  )
  return result.rows as Payment[]
}

// Get active payments for user
export async function getActivePayments(userId: string): Promise<Payment[]> {
  const result = await query(
    'SELECT p.*, s.title as stream_title FROM payments p JOIN streams s ON p.stream_id = s.id WHERE p.user_id = ? AND p.status = ? AND p.expired_at > UNIX_TIMESTAMP() ORDER BY p.created_at DESC',
    [userId, 'paid']
  )
  return result.rows as Payment[]
}

// Check if user has active payment for specific stream
export async function hasActivePaymentForStream(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = ? AND stream_id = ? AND status = ? AND expired_at > UNIX_TIMESTAMP()',
    [userId, streamId, 'paid']
  )
  return result.rows.length > 0
}

// Check if user has used trial for specific stream
export async function hasUsedTrial(userId: string, streamId: string): Promise<boolean> {
  const result = await query(
    'SELECT * FROM trial_usage WHERE user_id = ? AND stream_id = ?',
    [userId, streamId]
  )
  return result.rows.length > 0
}

// Record trial usage for user and stream
export async function recordTrialUsage(userId: string, streamId: string): Promise<void> {
  await query(
    'INSERT IGNORE INTO trial_usage (id, user_id, stream_id) VALUES (UUID(), ?, ?)',
    [userId, streamId]
  )
}

// Get trial usage history for user
export async function getUserTrialHistory(userId: string): Promise<{ id: string; user_id: string; stream_id: string; used_at: Date; stream_title: string }[]> {
  const result = await query(
    'SELECT tu.*, s.title as stream_title FROM trial_usage tu JOIN streams s ON tu.stream_id = s.id WHERE tu.user_id = ? ORDER BY tu.used_at DESC',
    [userId]
  )
  return result.rows as { id: string; user_id: string; stream_id: string; used_at: Date; stream_title: string }[]
}

// Clean expired payments
export async function cleanExpiredPayments(): Promise<void> {
  await query('UPDATE payments SET status = ? WHERE expired_at <= UNIX_TIMESTAMP() AND status = ?', ['expired', 'pending'])
}

// Viewer functions
export async function addViewer(userId: string, streamId: string): Promise<void> {
  await query(
    'INSERT IGNORE INTO viewers (user_id, stream_id) VALUES (?, ?)',
    [userId, streamId]
  )
}

export async function getViewerCount(streamId: string): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM viewers WHERE stream_id = ?', [streamId])
  return Number((result.rows[0] as { count: number }).count)
}

export async function getViewers(streamId: string): Promise<Viewer[]> {
  const result = await query('SELECT * FROM viewers WHERE stream_id = ? ORDER BY created_at DESC', [streamId])
  return result.rows as Viewer[]
}

export async function hasUserViewed(userId: string, streamId: string): Promise<boolean> {
  const result = await query('SELECT * FROM viewers WHERE user_id = ? AND stream_id = ?', [userId, streamId])
  return result.rows.length > 0
}

// Get total view count (stream.view + viewers count)
export async function getTotalViewCount(streamId: string): Promise<number> {
  // Get stream view count
  const streamResult = await query('SELECT COALESCE(`view`, 0) as view FROM streams WHERE id = ?', [streamId])
  const streamView = Number((streamResult.rows[0] as { view: number })?.view || 0)
  
  // Get viewers count
  const viewersResult = await query('SELECT COUNT(*) as count FROM viewers WHERE stream_id = ?', [streamId])
  const viewersCount = Number((viewersResult.rows[0] as { count: number }).count)
  
  // Return total as number
  return streamView + viewersCount
}

// Increment stream view count
export async function incrementStreamView(streamId: string): Promise<void> {
  await query('UPDATE streams SET `view` = COALESCE(`view`, 0) + 1 WHERE id = ?', [streamId])
}

export default pool
