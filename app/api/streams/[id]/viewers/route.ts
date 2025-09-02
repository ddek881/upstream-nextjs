import { NextRequest, NextResponse } from 'next/server'
import { addViewer, getViewerCount, getViewers, getTotalViewCount, incrementStreamView, Viewer } from '@/lib/database'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await request.json()
    const resolvedParams = await params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Add viewer to database
    await addViewer(userId, resolvedParams.id)

    return NextResponse.json({
      success: true,
      message: 'Viewer added successfully'
    })

  } catch (error) {
    console.error('Error adding viewer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const includeList = searchParams.get('includeList') === 'true'
    const resolvedParams = await params
    
    // Get total view count (stream.view + viewers count)
    const totalViewCount = await getTotalViewCount(resolvedParams.id)
    
    const response: { count: number; viewers?: Viewer[] } = {
      count: totalViewCount
    }
    
    // Include viewer list if requested
    if (includeList) {
      const viewers = await getViewers(resolvedParams.id)
      response.viewers = viewers
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting viewers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
