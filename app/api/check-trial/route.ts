import { NextRequest, NextResponse } from 'next/server'
import { hasUsedTrial, recordTrialUsage } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const streamId = searchParams.get('streamId')

    if (!userId || !streamId) {
      return NextResponse.json(
        { error: 'User ID dan Stream ID diperlukan' },
        { status: 400 }
      )
    }

    const hasUsed = await hasUsedTrial(userId, streamId)

    return NextResponse.json({
      success: true,
      data: {
        hasUsedTrial: hasUsed,
        canUseTrial: !hasUsed
      }
    })

  } catch (error) {
    console.error('Error checking trial usage:', error)
    return NextResponse.json(
      { error: 'Gagal mengecek trial usage' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, streamId } = await request.json()

    if (!userId || !streamId) {
      return NextResponse.json(
        { error: 'User ID dan Stream ID diperlukan' },
        { status: 400 }
      )
    }

    // Check if user has already used trial
    const hasUsed = await hasUsedTrial(userId, streamId)
    
    if (hasUsed) {
      return NextResponse.json(
        { error: 'Anda sudah menggunakan trial untuk stream ini' },
        { status: 400 }
      )
    }

    // Record trial usage
    await recordTrialUsage(userId, streamId)

    return NextResponse.json({
      success: true,
      message: 'Trial usage berhasil dicatat',
      data: {
        userId,
        streamId,
        usedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error recording trial usage:', error)
    return NextResponse.json(
      { error: 'Gagal mencatat trial usage' },
      { status: 500 }
    )
  }
}
