import { Stream } from '@/lib/database'

// Sample streams data (fallback jika API tidak tersedia)
export const sampleStreams: Stream[] = [
  {
    id: '1',
    title: 'Upstream News Live',
    description: 'Live news streaming dengan berita terkini',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: false,
    price: 0,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Upstream Premium News',
    description: 'Premium news streaming dengan analisis mendalam',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: true,
    price: 1000,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '3',
    title: 'Upstream Premium Music',
    description: 'Premium music streaming dengan kualitas HD',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: true,
    price: 1000,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '4',
    title: 'Upstream Premium Sports',
    description: 'Premium sports streaming dengan komentar eksklusif',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: true,
    price: 1000,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '5',
    title: 'Upstream Sports Live',
    description: 'Live sports streaming dengan kualitas HD',
    thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: false,
    price: 0,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '6',
    title: 'Upstream Live Music',
    description: 'Live music streaming dengan kualitas premium',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop',
    is_live: true,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: false,
    price: 0,
    scheduled_time: '2025-01-15T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '7',
    title: 'Upstream Entertainment',
    description: 'Entertainment streaming dengan konten terbaru',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop',
    is_live: false,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: false,
    price: 0,
    scheduled_time: '2025-01-16T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '8',
    title: 'Upstream Premium Entertainment',
    description: 'Premium entertainment dengan konten eksklusif',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=225&fit=crop',
    is_live: false,
    is_visible: true,
    url: 'https://stream.trcell.id/hls/byon2.m3u8',
    is_paid: true,
    price: 1500,
    scheduled_time: '2025-01-16T20:00',
    estimated_duration: '2 hours',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  }
]

export const getStreams = async (): Promise<Stream[]> => {
  try {
    const response = await fetch('/api/streams')
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch streams')
  } catch (error) {
    console.error('Error fetching streams from API:', error)
    return sampleStreams
  }
}

export const getLiveStreams = async (): Promise<Stream[]> => {
  try {
    const response = await fetch('/api/streams?type=live')
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch live streams')
  } catch (error) {
    console.error('Error fetching live streams from API:', error)
    return sampleStreams.filter(stream => stream.is_live && stream.is_visible)
  }
}

export const getUpcomingStreams = async (): Promise<Stream[]> => {
  try {
    const response = await fetch('/api/streams?type=upcoming')
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch upcoming streams')
  } catch (error) {
    console.error('Error fetching upcoming streams from API:', error)
    return sampleStreams.filter(stream => !stream.is_live && stream.is_visible)
  }
}

export const getFreeStreams = async (): Promise<Stream[]> => {
  try {
    const response = await fetch('/api/streams')
    if (response.ok) {
      const streams = await response.json()
      return streams.filter((stream: Stream) => !stream.is_paid && stream.is_visible)
    }
    throw new Error('Failed to fetch free streams')
  } catch (error) {
    console.error('Error fetching free streams from API:', error)
    return sampleStreams.filter(stream => !stream.is_paid && stream.is_visible)
  }
}

export const getStreamById = async (id: string): Promise<Stream | null> => {
  try {
    const response = await fetch(`/api/streams/${id}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch stream')
  } catch (error) {
    console.error('Error fetching stream from API:', error)
    return sampleStreams.find(stream => stream.id === id) || null
  }
}
