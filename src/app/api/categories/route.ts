import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get unique categories from products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    })

    // Convert to category format with unique IDs
    const categories = products
      .map((product, index) => ({
        id: String(index + 1),
        name: product.category,
        description: `Produits de la catégorie ${product.category}`,
      }))
      .filter((cat, index, self) => 
        index === self.findIndex((c) => c.name === cat.name)
      ) // Remove duplicates
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

