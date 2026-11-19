/**
 * Client-side CSRF token utilities
 */

/**
 * Get CSRF token from session
 */
export async function getCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const session = await response.json()
      return session.csrfToken || null
    }
  } catch (error) {
    // Silent fail in production
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Error fetching CSRF token:', error)
    }
  }
  return null
}

/**
 * Create headers with CSRF token for API requests
 */
export async function createCSRFHeaders(): Promise<HeadersInit> {
  const csrfToken = await getCSRFToken()
  return {
    'Content-Type': 'application/json',
    ...(csrfToken && { 'x-csrf-token': csrfToken })
  }
}

/**
 * Create headers with CSRF token for FormData uploads (no Content-Type)
 */
export async function createCSRFHeadersForUpload(): Promise<HeadersInit> {
  const csrfToken = await getCSRFToken()
  return {
    ...(csrfToken && { 'x-csrf-token': csrfToken })
  }
}