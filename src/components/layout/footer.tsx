'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden>
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center mb-6 group">
                <span className="text-3xl font-display font-bold text-background group-hover:opacity-90 transition-opacity duration-300">
                  Merveilles de l&apos;Artisanat
                </span>
              </Link>
              <p className="text-background/80 mb-6 max-w-lg leading-relaxed text-lg">
                Découvrez des trésors artisanaux extraordinaires créés par des maîtres artisans de toute la Tunisie.
                Chaque pièce incarne des siècles de tradition, de savoir-faire et de patrimoine culturel,
                préservant l&apos;artisanat authentique pour les générations futures.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-6 text-background">Liens Rapides</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-background/80 hover:text-primary transition-colors duration-300 flex items-center group">
                    <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2" />
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-background/80 hover:text-primary transition-colors duration-300 flex items-center group">
                    <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2" />
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-background/80 hover:text-primary transition-colors duration-300 flex items-center group">
                    <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2" />
                    Produits
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-background/80 hover:text-primary transition-colors duration-300 flex items-center group">
                    <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2" />
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-6 text-background">Informations de Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 group-hover:bg-white/90 transition-colors duration-300">
                    <MapPin className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-background/80 group-hover:text-background transition-colors">
                    Tunis, Tunisia
                  </span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 group-hover:bg-white/90 transition-colors duration-300">
                    <Phone className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-background/80 group-hover:text-background transition-colors">
                    +216 93802714
                  </span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 group-hover:bg-white/90 transition-colors duration-300">
                    <Mail className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-background/80 group-hover:text-background transition-colors">
                    info@merveilles.tn
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full border-t border-background/10 mt-12 pt-8">
            <div className="text-center">
              <p className="text-background/60 text-sm">
                © 2026 Merveilles de l&apos;artisanat de la Tunisie. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}