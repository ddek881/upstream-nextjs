const { Pool } = require('pg')

const pool = new Pool({
  user: 'yandi',
  host: 'localhost',
  database: 'upstream_db',
  password: 'yandi',
  port: 5432,
})

async function debugHasPaidAccess() {
  try {
    console.log('🔍 Debugging hasPaidAccess function...')
    
    const userId = 'user_1756623967531_xtlyqfm8u'
    const streamId = '550e8400-e29b-41d4-a716-446655440002'
    
    console.log('📋 Parameters:')
    console.log('- userId:', userId)
    console.log('- streamId:', streamId)
    
    // Test the exact query from hasPaidAccess function
    const query = 'SELECT * FROM payments WHERE user_id = $1 AND stream_id = $2 AND status = $3 AND expires_at > NOW()'
    const params = [userId, streamId, 'paid']
    
    console.log('🔍 Query:', query)
    console.log('🔍 Params:', params)
    
    const result = await pool.query(query, params)
    
    console.log('📊 Result:')
    console.log('- Row count:', result.rowCount)
    console.log('- Rows:', result.rows)
    
    const hasAccess = result.rowCount > 0
    console.log('✅ hasAccess:', hasAccess)
    
    await pool.end()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugHasPaidAccess()
