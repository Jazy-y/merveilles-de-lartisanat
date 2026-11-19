import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import crypto from 'crypto'

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(req: NextRequest): Promise<NextResponse | null> {
  // Only protect state-changing methods
  if (req.method === 'GET' || req.method === 'HEAD') {
    return null
  }
  
  try {
    const session = await getServerSession(authOptions as any) as any
    const csrfToken = req.headers.get('x-csrf-token')

    // If no session, CSRF protection is not needed (handled by auth middleware)
    if (!session) {
      return null
    }
    
    // Check CSRF token
    if (!csrfToken || session.csrfToken !== csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token mismatch' }, 
        { status: 403 }
      )
    }

    return null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('❌ CSRF protection error:', error)
    return NextResponse.json(
      { error: 'CSRF validation failed' }, 
      { status: 500 }
    )
  }
}

/**
 * Add CSRF token to session
 */
export function addCSRFTokenToSession(session: any): any {
  if (session && !session.csrfToken) {
    session.csrfToken = generateCSRFToken()
  }
  return session
}
