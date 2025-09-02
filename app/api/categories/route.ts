import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, img_url } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: id and name' },
        { status: 400 }
      )
    }

    const category = await createCategory({ id, name, img_url })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
