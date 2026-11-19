import { NextResponse } from 'next/server'

/**
 * Enhanced security headers for production
 */
/**
 * Origins allowed to embed the storefront in an iframe (e.g. a portfolio
 * showcase). Space-separated list from ALLOWED_FRAME_ANCESTORS.
 */
const FRAME_ANCESTORS = (process.env.ALLOWED_FRAME_ANCESTORS || '').trim()

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    FRAME_ANCESTORS ? `frame-ancestors 'self' ${FRAME_ANCESTORS}` : "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // X-Frame-Options cannot list origins; CSP frame-ancestors takes over when embedding is allowed
  if (!FRAME_ANCESTORS) response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Content-Security-Policy', csp)
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

/**
 * Security headers for API routes
 */
export function addAPISecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

