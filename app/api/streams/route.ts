import { NextRequest, NextResponse } from 'next/server'
import { getStreams, getLiveStreams, getPaidStreams } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    let streams

    // Filter berdasarkan type jika ada
    if (type === 'live') {
      streams = await getLiveStreams()
    } else if (type === 'paid') {
      streams = await getPaidStreams()
    } else {
      streams = await getStreams()
    }

    return NextResponse.json(streams)
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    )
  }
}
