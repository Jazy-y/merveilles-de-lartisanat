/**
 * Security headers shared by next.config.ts (applied to every route) and the
 * middleware (admin routes). Pure data, no Next.js runtime imports, so the
 * Next config can load it at build time.
 */

/**
 * Origins allowed to embed the storefront in an iframe (e.g. a portfolio
 * showcase). Space-separated list from ALLOWED_FRAME_ANCESTORS.
 */
export const FRAME_ANCESTORS = (process.env.ALLOWED_FRAME_ANCESTORS || '').trim()

export type Header = { key: string; value: string }

export function pageSecurityHeaders(): Header[] {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    FRAME_ANCESTORS ? `frame-ancestors 'self' ${FRAME_ANCESTORS}` : "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

  const headers: Header[] = [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ]
  // X-Frame-Options cannot list origins; CSP frame-ancestors takes over when embedding is allowed
  if (!FRAME_ANCESTORS) headers.push({ key: 'X-Frame-Options', value: 'DENY' })
  if (process.env.NODE_ENV === 'production') {
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' })
  }
  return headers
}

export function apiSecurityHeaders(): Header[] {
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Referrer-Policy', value: 'no-referrer' },
  ]
}
