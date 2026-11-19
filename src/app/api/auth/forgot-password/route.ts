import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'L\'adresse e-mail est requise' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Security: Don't reveal if user exists or not (prevent user enumeration)
    // Always return success message, even if user doesn't exist
    if (!user) {
      // Return success to prevent user enumeration, but don't actually send email
      return NextResponse.json({ 
        message: 'Un e-mail de réinitialisation a été envoyé à votre adresse.' 
      }, { status: 200 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token expires in 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Generate reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'https://merveillessdelartisanatdelatunisie.com'}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetLink)
    
    if (!emailResult.success) {
      // Log the error but don't reveal it to the user (security)
      if (process.env.NODE_ENV === 'development') console.error('Failed to send password reset email:', emailResult.error)
      // In development, log the reset link for testing
      if (process.env.NODE_ENV !== 'production') {
      }
      // Still return success to prevent user enumeration
    }

    return NextResponse.json({ 
      message: 'Un e-mail de réinitialisation a été envoyé à votre adresse.' 
    }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error processing forgot password:', error)
    return NextResponse.json({ 
      error: 'Erreur : impossible d\'envoyer l\'e-mail de réinitialisation.' 
    }, { status: 500 })
  }
}

