import { NextResponse } from 'next/server'
import { apiSecurityHeaders, pageSecurityHeaders } from './security-policy'

/**
 * Security headers for middleware responses. The same headers are applied to
 * every route by next.config.ts; the middleware (admin routes only) sets them
 * too so redirects and rate-limit responses carry them.
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const { key, value } of pageSecurityHeaders()) response.headers.set(key, value)
  return response
}

/**
 * Security headers for API routes
 */
export function addAPISecurityHeaders(response: NextResponse): NextResponse {
  for (const { key, value } of apiSecurityHeaders()) response.headers.set(key, value)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}
