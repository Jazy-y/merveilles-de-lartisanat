'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  Sparkles, 
  ArrowRight,
  Scissors,
  CircleDot,
  Palette,
  Gem,
  Puzzle,
  Star,
  Award,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export function TrainingsSection() {
  interface TrainingCard {
    id: string
    title: string
    description?: string
    images?: string[]
    category?: string
    level?: string
    duration?: string
  }

  const [featuredTrainings, setFeaturedTrainings] = useState<TrainingCard[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/trainings')
        if (res.ok) {
          const data = await res.json()
          const list: TrainingCard[] = Array.isArray(data.trainings) ? data.trainings : []
          setFeaturedTrainings(list.slice(0, 6))
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.error('Failed to load trainings for homepage', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const specializations = [
    {
      icon: Scissors,
      title: "Broderie",
      description: "Techniques traditionnelles et modernes",
      emoji: "🧵"
    },
    {
      icon: CircleDot,
      title: "Poterie",
      description: "Art de la céramique tunisienne",
      emoji: "🪔"
    },
    {
      icon: Palette,
      title: "Décoration",
      description: "Ornementation sur divers supports",
      emoji: "🎨"
    },
    {
      icon: Gem,
      title: "Bijouterie",
      description: "Création de bijoux artisanaux",
      emoji: "💍"
    },
    {
      icon: Puzzle,
      title: "Mosaïque",
      description: "Art de la mosaïque traditionnelle",
      emoji: "🧩"
    }
  ]

  const programFeatures = [
    {
      icon: Calendar,
      title: "Durée Flexible",
      description: "4 à 10 jours selon votre disponibilité",
      color: "text-blue-600"
    },
    {
      icon: Target,
      title: "Progression Structurée",
      description: "Plan technique précis jour par jour",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Accompagnement Expert",
      description: "Maîtres artisans passionnés",
      color: "text-purple-600"
    },
    {
      icon: Award,
      title: "Certification",
      description: "Attestation de compétences acquises",
      color: "text-amber-600"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-amber-200 mb-6">
            <Target className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Formation Professionnelle</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Développe tes compétences avec les maîtres artisans de Tunisie 🎯
          </h2>
          
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            ✋ Aux côtés de maîtres artisans passionnés, tu as l&apos;opportunité de renforcer tes compétences professionnelles 
            dans plusieurs spécialités de l&apos;artisanat tunisien.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-base bg-amber-100 text-amber-800 border-amber-200">
              📅 Programmes 4-10 jours
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-base bg-green-100 text-green-800 border-green-200">
              📈 Progression structurée
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-base bg-purple-100 text-purple-800 border-purple-200">
              ✨ Expérience enrichissante
            </Badge>
          </div>
        </div>

        {/* Specializations Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Spécialisations Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {specializations.map((spec, index) => (
              <Card 
                key={index}
                className="group bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">{spec.emoji}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {spec.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {spec.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Program Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Structure du Programme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Program Description */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-600">Programme Intensif</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Une expérience formatrice, pratique et enrichissante
            </h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              📅 Ces programmes sont organisés sur une durée de 4 à 10 jours, selon un plan technique précis.
              <br />
              📈 Chaque journée marque une nouvelle étape, te permettant d&apos;avancer progressivement et de maîtriser 
              les gestes, techniques et secrets de chaque savoir-faire.
              <br />
              ✨ Une expérience formatrice, pratique et enrichissante, qui allie apprentissage, créativité et authenticité.
            </p>
            
            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Certification Professionnelle</div>
                  <div className="text-sm text-gray-600">Attestation de compétences acquises</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Compétences Pratiques</div>
                  <div className="text-sm text-gray-600">Maîtrise des techniques artisanales</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Héritage Culturel</div>
                  <div className="text-sm text-gray-600">Transmission de traditions millénaires</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Opportunités d&apos;Emploi</div>
                  <div className="text-sm text-gray-600">Développement de carrière dans l&apos;artisanat</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trainings">
                <Button 
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white px-8 py-3 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Découvrir les formations
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  className="bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 px-8 py-3 text-base shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Demander un Devis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Trainings Cards */}
        {featuredTrainings.length > 0 && (
        <div className="mb-16 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-amber-200 mb-4">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">Formations Recommandées</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nos Formations à la Une
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {[1,2,3,4].map((i) => (
                <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
                  <Skeleton className="h-56 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                  nextEl: '.training-swiper-button-next',
                  prevEl: '.training-swiper-button-prev',
                }}
                pagination={{
                  clickable: true,
                  el: '.training-swiper-pagination',
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                }}
                className="training-swiper"
              >
                {featuredTrainings.map((t) => {
                  const cover = t.images && t.images.length > 0 ? t.images[0] : ''
                  return (
                    <SwiperSlide key={t.id}>
                      <Link href={`/trainings/${t.id}`} className="block h-full">
                        <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl bg-white transition-all duration-300 hover:-translate-y-2">
                          {/* Image Section */}
                          <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {cover ? (
                              <Image
                                src={cover}
                                alt={t.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <BookOpen className="h-16 w-16 text-amber-600 opacity-40" />
                              </div>
                            )}
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                              {t.category && (
                                <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 border-0 shadow-md font-medium px-3 py-1">
                                  {t.category}
                                </Badge>
                              )}
                              {t.level && (
                                <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-md font-medium px-3 py-1">
                                  {t.level}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Hover icon */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                <ArrowRight className="h-5 w-5 text-amber-600" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <CardContent className="p-6 flex-grow flex flex-col">
                            <h4 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors duration-200">
                              {t.title}
                            </h4>
                            
                            {t.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
                                {t.description}
                              </p>
                            )}
                            
                            {/* Meta information */}
                            <div className="space-y-2 mt-auto">
                              {t.duration && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  <span>{t.duration}</span>
                                </div>
                              )}
                              
                              {/* CTA */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-semibold text-amber-600">En savoir plus</span>
                                <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform duration-200" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              <div className="training-swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:scale-110 cursor-pointer">
                <ArrowRight className="h-6 w-6 text-gray-700 rotate-180" />
              </div>
              <div className="training-swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:scale-110 cursor-pointer">
                <ArrowRight className="h-6 w-6 text-gray-700" />
              </div>
              
              {/* Custom Pagination */}
              <div className="training-swiper-pagination flex justify-center mt-8 gap-2"></div>
            </>
          )}

          <div className="text-center mt-12">
            <Link href="/trainings">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-lg">
                <Target className="mr-2 h-5 w-5" />
                Voir toutes les formations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        )}

        {/* Location & Contact */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-600">Carthage, Tunisie 🇹🇳</span>
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nos formations se déroulent dans des ateliers authentiques au cœur de Carthage, 
            où l&apos;histoire et l&apos;artisanat se rencontrent pour une expérience unique.
          </p>
        </div>
      </div>
      
      {/* Swiper Custom Styles */}
      <style jsx global>{`
        .training-swiper {
          padding: 0 60px 40px 60px;
        }
        
        .training-swiper .swiper-slide {
          height: auto;
        }
        
        .training-swiper-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
          border-radius: 50%;
        }
        
        .training-swiper-pagination .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          transform: scale(1.4);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
        }
        
        @media (max-width: 768px) {
          .training-swiper {
            padding: 0 20px 40px 20px;
          }
          
          .training-swiper-button-prev,
          .training-swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}