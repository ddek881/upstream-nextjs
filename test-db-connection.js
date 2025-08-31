const { Pool } = require('pg')

const pool = new Pool({
  user: 'yandi',
  host: 'localhost',
  database: 'upstream_db',
  password: 'yandi',
  port: 5432,
})

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const client = await pool.connect()
    console.log('✅ Database connection successful')
    
    // Test query
    const result = await client.query('SELECT COUNT(*) FROM payments')
    console.log('✅ Query successful:', result.rows[0])
    
    // Test hasPaidAccess query
    const hasAccessResult = await client.query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1 AND stream_id = $2 AND status = $3 AND expires_at > NOW()',
      ['user_1756623967531_xtlyqfm8u', '550e8400-e29b-41d4-a716-446655440002', 'paid']
    )
    console.log('✅ hasPaidAccess query successful:', hasAccessResult.rows[0])
    
    client.release()
    await pool.end()
    
  } catch (error) {
    console.error('❌ Database error:', error)
  }
}

testConnection()
