import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up database columns...')
    
    // SQL commands to run
    const commands = [
      // 1. Add category column
      {
        sql: `ALTER TABLE streams ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'entertainment';`,
        description: 'Adding category column'
      },
      
      // 2. Add is_popular column
      {
        sql: `ALTER TABLE streams ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;`,
        description: 'Adding is_popular column'
      },
      
      // 3. Create index for is_popular
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_streams_is_popular ON streams(is_popular);`,
        description: 'Creating index for is_popular'
      },
      
      // 4. Update existing streams with category
      {
        sql: `UPDATE streams SET category = 'entertainment' WHERE category IS NULL;`,
        description: 'Updating existing streams with category'
      },
      
      // 5. Set some streams as popular
      {
        sql: `UPDATE streams SET is_popular = TRUE WHERE id IN (
          SELECT id FROM streams ORDER BY created_at DESC LIMIT 3
        );`,
        description: 'Setting some streams as popular'
      },
      
      // 6. Add chat_live column
      {
        sql: `ALTER TABLE streams ADD COLUMN chat_live TEXT;`,
        description: 'Adding chat_live column for live stream chat messages'
      },
      
      // 7. Add chat_nolive column
      {
        sql: `ALTER TABLE streams ADD COLUMN chat_nolive TEXT;`,
        description: 'Adding chat_nolive column for scheduled stream chat messages'
      }
    ]
    
    const results = []
    
    for (const command of commands) {
      try {
        console.log(`📝 Running: ${command.description}`)
        const result = await query(command.sql)
        results.push({
          success: true,
          description: command.description,
          rowsAffected: result.rowCount
        })
        console.log(`✅ Success: ${command.description}`)
      } catch (error) {
        console.error(`❌ Error: ${command.description}`, error)
        results.push({
          success: false,
          description: command.description,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results
    })
    
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
