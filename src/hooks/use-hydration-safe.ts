'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to safely handle client-side only rendering to prevent hydration mismatches
 * caused by browser extensions or other client-side modifications
 */
export function useHydrationSafe() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to clean up browser extension attributes that cause hydration issues
 */
export function useCleanupExtensions() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const cleanup = () => {
      // Remove common browser extension attributes
      const problematicAttrs = [
        'bis_skin_checked',
        'data-bis_skin_checked',
        'bis_register',
        'data-bis_register',
        '__processed_104fe8bf-bedd-4a0d-b2e7-5f6181169876__'
      ]

      problematicAttrs.forEach(attr => {
        try {
          const elements = document.querySelectorAll(`[${attr}]`)
          elements.forEach(element => {
            element.removeAttribute(attr)
          })
        } catch (e) {
          // Ignore errors for individual attributes
        }
      })
    }

    // Run cleanup immediately
    cleanup()

    // Set up mutation observer to catch dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      let shouldCleanup = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element
          if (target.hasAttribute('bis_skin_checked') || 
              target.hasAttribute('data-bis_skin_checked')) {
            shouldCleanup = true
          }
        }
      })
      
      if (shouldCleanup) {
        cleanup()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked']
    })

    // Clean up observer after 30 seconds
    const timeout = setTimeout(() => {
      observer.disconnect()
    }, 30000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [])
}

