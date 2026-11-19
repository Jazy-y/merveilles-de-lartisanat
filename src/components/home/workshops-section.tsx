'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Sparkles, 
  ArrowRight,
  CircleDot,
  Scissors,
  Cookie,
  Flame,
  Star
} from 'lucide-react'
import Link from 'next/link'

export function WorkshopsSection() {
  const workshops = [
    {
      icon: CircleDot,
      title: "Poterie Traditionnelle",
      description: "Découvrez l&apos;art ancestral de la poterie tunisienne",
      duration: "4h",
      participants: "8 max",
      emoji: "🪔"
    },
    {
      icon: Scissors,
      title: "Broderie Artisanale",
      description: "Apprenez les techniques de broderie traditionnelle",
      duration: "3h",
      participants: "6 max",
      emoji: "🧵",
      link: "/trainings/cmge51iwj0001tzyg7v9ujdzk"
    },
    {
      icon: Cookie,
      title: "Pâtisserie Traditionnelle",
      description: "Créez des douceurs authentiques de Tunisie",
      duration: "3h",
      participants: "10 max",
      emoji: "🍯"
    },
    {
      icon: Flame,
      title: "Harissa & Épices",
      description: "Maîtrisez l&apos;art des épices et condiments",
      duration: "2h",
      participants: "12 max",
      emoji: "🌶️",
      link: "/trainings/cmge6e43z0003tzyg430eu2ma"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-amber-200 mb-6">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Expériences Authentiques</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Participer à des ateliers vivants en Tunisie ✨
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            🇹🇳 La Tunisie , pays d&apos;accueil chaleureux, t&apos;ouvre les portes de ses traditions et de son artisanat.
            <br />
            ⏳ En une demi-journée, plonge dans l&apos;univers des maîtres artisans.
            <br />
            🙌 Tu ne seras pas simple spectateur : tu mettras la main à la pâte, guidé par leur savoir-faire authentique.
          </p>
          
          <div className="mt-8">
            <Badge variant="secondary" className="px-4 py-2 text-base bg-amber-100 text-amber-800 border-amber-200">
              Un moment riche, créatif et inoubliable
            </Badge>
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {workshops.map((workshop, index) => {
            const hasLink = (workshop as any).link;
            
            const CardComponent = (
              <Card 
                className="group bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{workshop.emoji}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {workshop.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{workshop.participants}</span>
                    </div>
                  </div>
                  
                  <Link href={hasLink ? (workshop as any).link : "/workshops"}>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      size="sm"
                    >
                      Réserver Maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
            
            if (hasLink) {
              return (
                <Link key={index} href={(workshop as any).link}>
                  {CardComponent}
                </Link>
              );
            }
            
            return (
              <div key={index}>
                {CardComponent}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-600">Carthage, Tunisie 🇹🇳</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt pour une expérience inoubliable ?
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Rejoignez nos maîtres artisans pour une immersion totale dans l&apos;artisanat tunisien. 
              Chaque atelier est une occasion unique d&apos;apprendre, créer et partager.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/workshops">
                <Button 
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white px-8 py-3 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Voir tous les ateliers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 px-8 py-3 text-base"
                >
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}