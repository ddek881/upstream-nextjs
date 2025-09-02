import { NextRequest, NextResponse } from 'next/server'
import { getStreamById } from '@/lib/database'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const stream = await getStreamById(resolvedParams.id)
    
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // For now, return stream info with chat templates
    // In the future, this could return real chat messages from database
    const response = {
      streamId: stream.id,
      isLive: stream.is_live,
      chatLive: stream.chat_live || '',
      chatNoLive: stream.chat_nolive || '',
      message: 'Chat messages will be implemented in future updates'
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching chat data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { userId, message } = await request.json()
    
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    // For now, just acknowledge the message
    // In the future, this would save the message to database
    const response = {
      success: true,
      message: 'Message received (saving to database will be implemented in future updates)',
      data: {
        id: Date.now().toString(),
        userId,
        message,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error saving chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
