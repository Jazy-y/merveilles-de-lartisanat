'use client'

import Image from 'next/image'

export function EditorialSection() {
  return (
    <section
      className="py-16 md:py-24 bg-[var(--background)]"
      aria-label="Our craftsmanship"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[var(--muted)] order-2 lg:order-1">
            <Image
              src="/83c89abc-df29-412b-a26c-3da0057e01f6.jpeg"
              alt="Artisanat et savoir-faire"
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6 order-1 lg:order-2">
            <h2
              className="text-3xl md:text-4xl font-serif text-[var(--foreground)] leading-tight"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              L&apos;art du fait main
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              Chaque pièce de notre collection naît du savoir-faire de maîtres
              artisans. Des techniques transmises de génération en génération,
              un respect du matériau et du temps, pour des objets qui traversent
              les modes et les années.
            </p>
            <p className="text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              Nous sélectionnons pour vous des créations d&apos;exception :
              vaisselle, linge de table, décor et luminaires, pensés pour une
              maison raffinée et une table généreuse.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
