'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background"
      suppressHydrationWarning={true}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/0ef40ad4-5b6f-4145-83e0-b6d4c484aa07.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-foreground/20" aria-hidden />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-6 drop-shadow-sm"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Merveilles de l&apos;Artisanat
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-sans">
          Boutique premium d&apos;artisanat tunisien — vaisselle, linge de table et décor d&apos;exception.
        </p>
        <Link href="/products">
          <Button
            size="lg"
            className="bg-black text-white hover:bg-black/90 border-0 px-8 py-6 h-auto text-base font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm"
          >
            Découvrir la collection
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
