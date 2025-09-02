import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT id, title, description, LEFT(description, 100) as description_preview
      FROM streams 
      ORDER BY created_at DESC
    `)
    
    return NextResponse.json({
      total: result.rows.length,
      streams: result.rows
    })
  } catch (error) {
    console.error('Error fetching debug data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    )
  }
}
