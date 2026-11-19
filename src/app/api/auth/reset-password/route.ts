import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/password-validation'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 })
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
        error: 'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.' 
      }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: passwordValidation.errors[0] || 'Le mot de passe ne respecte pas les exigences de sécurité'
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ 
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
    }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error resetting password:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la réinitialisation du mot de passe.' 
    }, { status: 500 })
  }
}

