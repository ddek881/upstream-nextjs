import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string; iat: number }

    if (decoded && decoded.role === 'admin') {
      return NextResponse.json({
        success: true,
        user: {
          username: decoded.username,
          role: decoded.role
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token tidak valid atau expired' },
      { status: 401 }
    )
  }
}
