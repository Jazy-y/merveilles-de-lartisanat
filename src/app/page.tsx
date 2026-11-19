'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Hero } from '@/components/home/hero'
import { FeaturedProducts } from '@/components/home/featured-products'
import { TrustSection } from '@/components/home/trust-section'
import { FinalCTA } from '@/components/home/final-cta'
import { StickyCTA } from '@/components/home/sticky-cta'
import { useCleanupExtensions } from '@/hooks/use-hydration-safe'

function HomePageContent() {
  const [successMessage, setSuccessMessage] = useState('')
  const searchParams = useSearchParams()
  
  // Clean up browser extension attributes that cause hydration issues
  useCleanupExtensions()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [searchParams])
  
  return (
    <main className="min-h-screen" suppressHydrationWarning={true}>
      {successMessage && (
        <div className="bg-success/15 border border-success/40 text-success px-4 py-3 mx-4 mt-4 rounded-md relative">
          <span className="block sm:inline font-medium">{successMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:opacity-70 transition-opacity"
            onClick={() => setSuccessMessage('')}
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <Hero />
      <FeaturedProducts />
      <TrustSection />
      <FinalCTA />
      <StickyCTA />
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen" suppressHydrationWarning={true}>
        <Hero />
        <FeaturedProducts />
        <TrustSection />
        <FinalCTA />
      </main>
    }>
      <HomePageContent />
    </Suspense>
  )
}