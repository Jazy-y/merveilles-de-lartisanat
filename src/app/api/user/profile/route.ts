import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Le nom doit contenir au moins 2 caractères' }, { status: 400 })
    }

    // Update user name
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json({ 
      message: 'Profil mis à jour avec succès.',
      name: name.trim()
    }, { status: 200 })
  } catch (error) {
    // Security: Log error but return generic message
    if (process.env.NODE_ENV === 'development') console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

