import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Token invalide ou expiré' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true,
      message: 'Token valide' 
    }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error verifying reset token:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification du token.' 
    }, { status: 500 })
  }
}

