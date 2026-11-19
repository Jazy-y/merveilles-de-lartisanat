import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Workshop categories - can be extended to use database later
    const categories = [
      { id: '1', name: 'Bijoux', description: 'Jewelry making workshops' },
      { id: '2', name: 'Broderie', description: 'Embroidery workshops' },
      { id: '3', name: 'Mosaïque', description: 'Mosaic art workshops' },
      { id: '4', name: 'Pottery', description: 'Pottery and ceramics workshops' },
      { id: '5', name: 'Textile', description: 'Textile and fabric workshops' },
      { id: '6', name: 'Woodworking', description: 'Woodworking and carpentry workshops' },
      { id: '7', name: 'Painting', description: 'Painting and drawing workshops' },
      { id: '8', name: 'Sculpture', description: 'Sculpture workshops' },
    ]

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching workshop categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

