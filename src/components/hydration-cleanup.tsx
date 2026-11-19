'use client'

import { useCleanupExtensions } from '@/hooks/use-hydration-safe'

/**
 * Component that handles cleanup of browser extension attributes
 * that cause hydration mismatches. This component should be placed
 * high in the component tree to ensure cleanup happens early.
 */
export function HydrationCleanup() {
  useCleanupExtensions()
  return null
}

