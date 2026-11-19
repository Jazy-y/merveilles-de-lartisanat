'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag, X } from 'lucide-react'

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 sm:max-w-md">
      <div className="bg-card rounded-lg shadow-lg border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 relative">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1.5 hover:bg-muted rounded transition-colors touch-manipulation"
          aria-label="Fermer"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0 pr-8 sm:pr-0">
          <div className="text-sm font-semibold text-foreground mb-0.5">
            Découvrez nos créations
          </div>
          <div className="text-xs text-muted-foreground">
            Pièces uniques d&apos;artisanat tunisien
          </div>
        </div>

        <Link href="/products" className="w-full sm:w-auto shrink-0">
          <Button size="sm" className="w-full sm:w-auto">
            <ShoppingBag className="h-4 w-4" />
            Boutique
          </Button>
        </Link>
      </div>
    </div>
  )
}




