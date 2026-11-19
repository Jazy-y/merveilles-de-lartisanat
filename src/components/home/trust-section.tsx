'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, Award, Users, Heart, Shield, CheckCircle } from 'lucide-react'

export function TrustSection() {
  const trustPoints = [
    {
      icon: Award,
      title: 'Authenticité Garantie',
      description: 'Produits certifiés par des maîtres artisans tunisiens',
    },
    {
      icon: Shield,
      title: 'Qualité Premium',
      description: 'Sélection rigoureuse de pièces d\'exception',
    },
    {
      icon: Heart,
      title: 'Héritage Culturel',
      description: 'Traditions millénaires préservées et transmises',
    },
    {
      icon: CheckCircle,
      title: 'Satisfaction Garantie',
      description: '98% de clients satisfaits de leurs achats',
    },
  ]

  const stats = [
    { value: '4.9/5', label: 'Note Moyenne', icon: Star },
    { value: '2.5K+', label: 'Clients Satisfaits', icon: Users },
    { value: '50+', label: 'Maîtres Artisans', icon: Award },
    { value: '98%', label: 'Taux de Satisfaction', icon: Heart }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--background-alt)] to-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Confiance & Authenticité
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
            Nous sommes fiers de représenter l&apos;artisanat tunisien authentique.
            Chaque produit et chaque expérience reflète notre engagement envers la qualité,
            l&apos;authenticité et la préservation du patrimoine culturel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustPoints.map((point, index) => (
            <Card
              key={index}
              className="bg-[var(--card)] border-l-4 border-l-[var(--foreground)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--foreground)] text-[var(--primary-foreground)]">
                  <point.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{point.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-[var(--card)] rounded-xl p-8 shadow-sm border-2 border-[var(--border)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--foreground)] text-[var(--primary-foreground)]">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)] mb-2">{stat.value}</div>
                <div className="text-sm text-[var(--muted-foreground)] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--foreground)] bg-[var(--card)]">
            <Award className="h-5 w-5 text-[var(--foreground)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              Héritage UNESCO • Traditions Millénaires • Artisans Certifiés
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

