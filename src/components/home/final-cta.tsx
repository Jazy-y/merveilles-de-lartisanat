'use client'

import { Button } from '@/components/ui/button'
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function FinalCTA() {
  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background/20 mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Commencez Votre Expérience Artisanale</span>
        </div>

        <h2
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Prêt à Découvrir l&apos;Artisanat Tunisien ?
        </h2>

        <p className="text-xl text-background/90 mb-10 leading-relaxed max-w-2xl mx-auto">
          Découvrez notre sélection de pièces uniques, créées par des maîtres artisans de Tunisie.
          Chaque achat participe à la préservation d&apos;un patrimoine millénaire.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base border-0 transition-all duration-300 rounded-sm"
              size="lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Découvrir la Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-background/20">
          <p className="text-background/80 text-sm">
            Questions ? Contactez-nous à{' '}
            <Link href="/contact" className="underline hover:text-background font-medium">
              info@merveilles.tn
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}


