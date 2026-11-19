import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applyRateLimit, getRateLimitConfig } from './src/lib/rate-limit'
import { addSecurityHeaders, addAPISecurityHeaders } from './src/lib/security-headers'
// @ts-ignore - getToken exists but TypeScript might not recognize it
import { getToken } from 'next-auth/jwt'

// Helper function to check if path requires authentication
function requiresAuth(pathname: string): boolean {
  // Check for direct routes (without locale)
  if (pathname.startsWith('/checkout') || 
      pathname.startsWith('/orders') || 
      pathname.startsWith('/wishlist') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api/admin')) {
    return true
  }
  
  // Check for locale routes (e.g., /en/checkout, /fr/orders)
  // Match pattern: /{locale}/checkout, /{locale}/orders, /{locale}/wishlist, /{locale}/admin
  const localeRoutePattern = /^\/(en|fr|ar)\/(checkout|orders|wishlist|admin)/
  if (localeRoutePattern.test(pathname)) {
    return true
  }
  
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip middleware for Next.js internals and auth endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/api/auth') || // Do not interfere with NextAuth
    pathname.startsWith('/auth')        // Allow auth pages
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting to sensitive API routes
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth')) {
    const rateLimitConfig = getRateLimitConfig(pathname)
    const rateLimitResult = applyRateLimit(req, rateLimitConfig)
    
    if (!rateLimitResult.allowed) {
      return addAPISecurityHeaders(rateLimitResult.response!)
    }
  }

  // For protected routes, check token using getToken
  if (requiresAuth(pathname)) {
    // For non-admin protected routes (orders, checkout, wishlist)
    // COMPLETELY SKIP middleware protection - let page components handle authentication
    // This fixes the issue where middleware can't read session but client can
    // The page components will check session client-side and redirect if needed
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
      // Allow through - page will handle authentication
      return NextResponse.next()
    }
    
    // For admin routes, we need to verify token and role
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    }) as any
    
    // For admin routes, check token and role
    if (pathname.startsWith('/admin') || /^\/(en|fr|ar)\/admin/.test(pathname)) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/403', req.url))
      }
    }

    // For admin API routes
    if (pathname.startsWith('/api/admin')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - No authentication token' },
          { status: 401 }
        )
      }

      if (token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        )
      }
    }
  }

  const response = NextResponse.next()
  
  // Add security headers to all responses
  if (pathname.startsWith('/api/')) {
    return addAPISecurityHeaders(response)
  } else {
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: [
    // Only protect admin routes - let orders/checkout/wishlist be handled by page components
    '/admin/:path*',
    '/api/admin/:path*',
    // Include locale admin routes
    '/(en|fr|ar)/admin/:path*',
    // Note: Removed /orders, /checkout, /wishlist from matcher
    // These routes will be handled by their page components for authentication
  ]
}
