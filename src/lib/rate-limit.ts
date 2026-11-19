import { NextRequest, NextResponse } from 'next/server'

// In-memory store for development
// In production, this should be replaced with Redis or Upstash
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export const RATE_LIMITS = {
  // Sensitive routes: 5 requests per 10 seconds
  AUTH: { maxRequests: 5, windowMs: 10 * 1000 },
  UPLOAD: { maxRequests: 5, windowMs: 10 * 1000 },
  ADMIN: { maxRequests: 5, windowMs: 10 * 1000 },
  
  // General API routes: 100 requests per 10 minutes
  GENERAL: { maxRequests: 100, windowMs: 10 * 60 * 1000 }
} as const

/**
 * Get the client's IP address from the request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to connection remote address
  return 'unknown'
}

/**
 * Check if a request should be rate limited
 */
function checkRateLimit(
  key: string, 
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, newEntry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): { allowed: boolean; response?: NextResponse } {
  const clientIP = getClientIP(request)
  const key = identifier ? `${clientIP}:${identifier}` : clientIP
  
  const result = checkRateLimit(key, config)
  
  if (!result.allowed) {
    const response = NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
    
    return { allowed: false, response }
  }
  
  return { allowed: true }
}

/**
 * Get rate limit configuration for a given path
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Auth routes
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMITS.AUTH
  }
  
  // Upload routes
  if (pathname.startsWith('/api/upload')) {
    return RATE_LIMITS.UPLOAD
  }
  
  // Admin routes
  if (pathname.startsWith('/api/admin/')) {
    return RATE_LIMITS.ADMIN
  }
  
  // All other API routes
  return RATE_LIMITS.GENERAL
}

/**
 * Rate limiting middleware for Next.js
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config?: RateLimitConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname
    const rateLimitConfig = config || getRateLimitConfig(pathname)
    
    const result = applyRateLimit(request, rateLimitConfig)
    
    if (!result.allowed) {
      return result.response!
    }
    
    return handler(request)
  }
}

