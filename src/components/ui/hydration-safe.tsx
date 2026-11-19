'use client'

import { useHydrationSafe } from '@/hooks/use-hydration-safe'

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  suppressHydrationWarning?: boolean
}

/**
 * Component that prevents hydration mismatches by only rendering children on the client
 * Useful for components that might be affected by browser extensions or other client-side modifications
 */
export function HydrationSafe({ 
  children, 
  fallback = null, 
  suppressHydrationWarning = true 
}: HydrationSafeProps) {
  const isClient = useHydrationSafe()

  if (!isClient) {
    return <>{fallback}</>
  }

  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  )
}

