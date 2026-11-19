import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  
  const sanitized = email
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9@._-]/g, '') // Only allow alphanumeric and specific chars
    .substring(0, 254) // RFC 5321 limit
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return ''
  
  return phone
    .replace(/[^\d+\-\s()]/g, '') // Only allow digits, +, -, space, ()
    .trim()
    .substring(0, 20) // Reasonable phone number length
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') return ''
  
  try {
    const urlObj = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return ''
    }
    
    return urlObj.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject(obj: any, maxDepth: number = 5): any {
  if (maxDepth <= 0 || obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'string') {
    return sanitizeText(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1))
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeText(key)
      sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1)
    }
    return sanitized
  }
  
  return obj
}

/**
 * Validate and sanitize form data
 */
export function sanitizeFormData(data: any): any {
  if (!data || typeof data !== 'object') {
    return {}
  }
  
  const sanitized: any = {}
  
  // Sanitize common form fields
  if (data.firstName) sanitized.firstName = sanitizeText(data.firstName)
  if (data.lastName) sanitized.lastName = sanitizeText(data.lastName)
  if (data.email) sanitized.email = sanitizeEmail(data.email)
  if (data.phone) sanitized.phone = sanitizePhone(data.phone)
  if (data.address) sanitized.address = sanitizeText(data.address)
  if (data.city) sanitized.city = sanitizeText(data.city)
  if (data.postalCode) sanitized.postalCode = sanitizeText(data.postalCode)
  if (data.country) sanitized.country = sanitizeText(data.country)
  if (data.name) sanitized.name = sanitizeText(data.name)
  if (data.description) sanitized.description = sanitizeHTML(data.description)
  if (data.url) sanitized.url = sanitizeURL(data.url)
  
  // Sanitize other properties
  for (const [key, value] of Object.entries(data)) {
    if (!sanitized[key] && value !== undefined) {
      sanitized[key] = sanitizeObject(value)
    }
  }
  
  return sanitized
}

