'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Award, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  format: string;
  level: string;
  price: number;
  images: string[];
  category: string;
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/trainings');
        if (res.ok) {
          const data = await res.json();
          setTrainings(data.trainings);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading trainings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Formations Professionnelles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Améliorez vos compétences et développez votre entreprise artisanale avec nos programmes de formation complets. 
              Apprenez auprès d&apos;experts de l&apos;industrie et connectez-vous avec d&apos;autres artisans.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="w-full h-48 bg-gray-200 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Formations Professionnelles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Améliorez vos compétences et développez votre entreprise artisanale avec nos programmes de formation complets. 
            Apprenez auprès d&apos;experts de l&apos;industrie et connectez-vous avec d&apos;autres artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainings.map((training) => (
            <Card key={training.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  {(() => {
                    // Use first image from images array as cover, fallback to main image
                    const coverImage = training.images && training.images.length > 0 
                      ? training.images[0] 
                      : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    
                    return coverImage && coverImage !== 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={coverImage}
                          alt={training.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-gray-400" />
                      </div>
                    );
                  })()}
                  <Badge className="absolute top-2 left-2 bg-amber-500">
                    {training.category}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-blue-500">
                    {training.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-3">
                  {training.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {training.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {training.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {training.format}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    Niveau {training.level}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-600">
                    {formatPrice(training.price)}
                  </span>
                  <Link href={`/trainings/${training.id}`} passHref>
                    <Button>
                      Voir Détails
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
