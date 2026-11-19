import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Training categories - can be extended to use database later
    const categories = [
      { id: '1', name: 'Business & Management', description: 'Business and management training' },
      { id: '2', name: 'Marketing & Sales', description: 'Marketing and sales training' },
      { id: '3', name: 'Quality & Standards', description: 'Quality management and standards' },
      { id: '4', name: 'Technology & Digital', description: 'Technology and digital skills' },
      { id: '5', name: 'Artisan Skills', description: 'Traditional artisan skills and crafts' },
      { id: '6', name: 'Language & Communication', description: 'Language and communication skills' },
      { id: '7', name: 'Leadership & Development', description: 'Leadership and personal development' },
    ]

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching training categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

