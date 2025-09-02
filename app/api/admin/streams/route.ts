import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Coerce various truthy/falsey inputs (0/1, '0'/'1', true/false, 'true'/'false')
function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true
    if (v === '0' || v === 'false' || v === 'no' || v === 'off' || v === '') return false
    // Fallback: non-empty string => true
    return true
  }
  return Boolean(value)
}

// Parse various date inputs to MySQL DATETIME string (YYYY-MM-DD HH:MM:SS)
function toMySqlDatetime(input: unknown): string | null {
  if (!input) return null
  if (typeof input === 'string') {
    const trimmed = input.trim()
    // Matches datetime-local value: 2025-09-03T12:30
    const localMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.exec(trimmed)
    if (localMatch) {
      return trimmed.replace('T', ' ') + ':00'
    }
    // Matches dd/MM/yyyy, HH.mm or dd/MM/yyyy, HH:mm
    const idMatch = /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2})[.:](\d{2})$/.exec(trimmed)
    if (idMatch) {
      const [_, dd, mm, yyyy, HH, MM] = idMatch
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`
    }
    // Try native Date parsing (ISO etc.)
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 19).replace('T', ' ')
    }
    return null
  }
  if (typeof input === 'number') {
    const d = new Date(input)
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 19).replace('T', ' ')
    }
    return null
  }
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString().slice(0, 19).replace('T', ' ')
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get('includeHidden')
    
    let whereClause = ''
    if (includeHidden !== 'true') {
      whereClause = 'WHERE is_visible = true'
    }
    
    const result = await query(`
      SELECT * FROM streams 
      ${whereClause}
      ORDER BY 
        is_live DESC, 
        CASE 
          WHEN is_live = true THEN 0 
          ELSE 1 
        END,
        scheduled_time ASC,
        created_at DESC
    `)
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API received body:', body)
    console.log('Description received:', body.description)
    
    const {
      title,
      description,
      thumbnail,
      url,
      category = 'entertainment',
      is_live = false,
      is_paid = false,
      is_visible = true,
      is_popular = false,
      price = 0,
      scheduled_time,
      estimated_duration,
      chat_live = '',
      chat_nolive = '',
      view = 0
    } = body

    // Convert boolean values to ensure proper type (support 0/1 and strings)
    const isLive = toBoolean(is_live)
    const isPaid = toBoolean(is_paid)
    const isVisible = toBoolean(is_visible)
    const isPopular = toBoolean(is_popular)

    // If stream is live, set scheduled_time to null
    // Convert ISO string to MySQL datetime format
    const finalScheduledTime = !isLive ? toMySqlDatetime(scheduled_time) : null

    // Validate required fields
    if (!title || !description || !thumbnail) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, or thumbnail' },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof title !== 'string' || typeof description !== 'string' || typeof thumbnail !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data types for required fields' },
        { status: 400 }
      )
    }

    // Validate price if stream is paid
    if (isPaid && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Invalid price for paid stream' },
        { status: 400 }
      )
    }

    // Use default URL if not provided
    const finalUrl = url || 'https://stream.trcell.id/hls/byon2.m3u8'

    // Generate UUID for new stream
    const streamId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('About to insert description:', description)
    console.log('Boolean values:', { isLive, isPaid, isVisible, isPopular })
    
    // Create stream
    const result = await query(
      `INSERT INTO streams (
        id, title, description, thumbnail, url, category,
        is_live, is_paid, is_visible, is_popular, price, 
        scheduled_time, estimated_duration, chat_live, chat_nolive, view
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        streamId, title, description, thumbnail, finalUrl, category,
        isLive, isPaid, isVisible, isPopular, Number(price) || 0,
        finalScheduledTime, estimated_duration || null, chat_live || '', chat_nolive || '', Number(view) || 0
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Stream berhasil dibuat'
    })

  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      id,
      title,
      description,
      thumbnail,
      url,
      category = 'entertainment',
      is_live = false,
      is_paid = false,
      is_visible = true,
      is_popular = false,
      price = 0,
      scheduled_time,
      estimated_duration,
      chat_live = '',
      chat_nolive = '',
      view = 0
    } = body

    // Convert boolean values to ensure proper type (support 0/1 and strings)
    const isLive = toBoolean(is_live)
    const isPaid = toBoolean(is_paid)
    const isVisible = toBoolean(is_visible)
    const isPopular = toBoolean(is_popular)

    // If stream is live, set scheduled_time to null
    // Convert ISO string to MySQL datetime format
    const finalScheduledTime = !isLive ? toMySqlDatetime(scheduled_time) : null

    // Default URL on update if missing/empty
    const finalUrl = url || 'https://stream.trcell.id/hls/byon2.m3u8'

    // Validate required fields
    if (!id || !title || !description || !thumbnail || !finalUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof title !== 'string' || typeof description !== 'string' || typeof thumbnail !== 'string' || typeof finalUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data types for required fields' },
        { status: 400 }
      )
    }

    // Validate price if stream is paid
    if (isPaid && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Invalid price for paid stream' },
        { status: 400 }
      )
    }

    console.log('About to update stream with boolean values:', { isLive, isPaid, isVisible, isPopular })

    // Update stream
    const result = await query(
      `UPDATE streams SET 
        title = ?, description = ?, thumbnail = ?, url = ?, category = ?,
        is_live = ?, is_paid = ?, is_visible = ?, is_popular = ?, price = ?,
        scheduled_time = ?, estimated_duration = ?, chat_live = ?, chat_nolive = ?, view = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        title, description, thumbnail, finalUrl, category,
        isLive, isPaid, isVisible, isPopular, Number(price) || 0,
        finalScheduledTime, estimated_duration || null, chat_live || '', chat_nolive || '', Number(view) || 0, id
      ]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Stream berhasil diupdate'
    })

  } catch (error) {
    console.error('Error updating stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
