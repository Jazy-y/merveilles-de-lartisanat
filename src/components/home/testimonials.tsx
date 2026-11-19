'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Quote, MapPin, ChevronLeft, ChevronRight, Play, Pause, Award, Heart, Users, Globe } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import Image from 'next/image'

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
}

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'New York, USA',
    rating: 5,
    comment: 'La poterie que j&apos;ai reçue est absolument magnifique ! L&apos;artisanat est exceptionnel et elle est arrivée parfaitement emballée. Je commanderai certainement à nouveau.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    product: 'Poterie de Nabeul',
    verified: true,
    story: 'Collectionneuse d&apos;art depuis 15 ans'
  },
  {
    id: 2,
    name: 'Ahmed Ben Ali',
    location: 'Tunis, Tunisie',
    rating: 5,
    comment: 'En tant que local, je peux confirmer que ce sont d&apos;authentiques artisanats tunisiens. La qualité et l&apos;attention aux détails sont remarquables. Hautement recommandé !',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    product: 'Tapis Berbère',
    verified: true,
    story: 'Expert en artisanat traditionnel'
  },
  {
    id: 3,
    name: 'Marie Dubois',
    location: 'Paris, France',
    rating: 5,
    comment: 'J&apos;ai acheté le tapis berbère et il a dépassé mes attentes. Les couleurs sont vibrantes et le tissage est parfait. Une véritable œuvre d&apos;art !',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    product: 'Tapis Berbère',
    verified: true,
    story: 'Décoratrice d&apos;intérieur passionnée'
  },
  {
    id: 4,
    name: 'James Wilson',
    location: 'London, UK',
    rating: 5,
    comment: 'L&apos;authenticité et la beauté de ces pièces artisanales sont incomparables. Chaque détail raconte une histoire de tradition et de passion.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    product: 'Céramique Traditionnelle',
    verified: true,
    story: 'Voyageur et amateur d&apos;art'
  },
  {
    id: 5,
    name: 'Fatima Al-Zahra',
    location: 'Dubai, UAE',
    rating: 5,
    comment: 'Ces créations artisanales apportent une touche d&apos;élégance et d&apos;authenticité à ma maison. La qualité est exceptionnelle et le service client parfait.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    product: 'Bijoux Traditionnels',
    verified: true,
    story: 'Amatrice d&apos;art du Moyen-Orient'
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load products for the showcase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products.slice(0, 6)); // Take first 6 products for showcase
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading products for testimonials:', error)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <section 
      className="section-padding relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          var(--tunisian-cream-warm) 0%, 
          var(--tunisian-cream-light) 50%, 
          var(--tunisian-cream) 100%)`
      }}
      suppressHydrationWarning={true}
    >
      {/* Cultural Background Elements */}
      <div className="absolute inset-0 -z-10" suppressHydrationWarning={true}>
        <div className="absolute inset-0 islamic-pattern opacity-5"></div>
        <div 
          className="absolute top-20 right-20 w-56 h-56 gradient-cultural rounded-full animate-float-slow opacity-15"
          style={{
            transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.08}deg)`,
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-20 w-40 h-40 gradient-gold rounded-full animate-float opacity-20"
          style={{
            transform: `translateY(${scrollY * -0.1}px)`,
            animationDelay: '3s'
          }}
        ></div>
        <div className="absolute top-1/3 left-1/3 w-24 h-24 tunisian-pattern rounded-full animate-pulse-slow opacity-10"></div>
      </div>

      <div className="container-luxury relative z-10" suppressHydrationWarning={true}>
        {/* Cinematic Header */}
        <div className="text-center mb-20 animate-fade-in-up" suppressHydrationWarning={true}>
          <div className="inline-flex items-center gap-3 px-6 py-3 backdrop-luxury rounded-full shadow-luxury border border-white/30 mb-8 animate-shimmer">
            <Users className="h-5 w-5 text-amber-600 animate-pulse-slow" />
            <span className="text-sm font-medium text-amber-800 font-elegant">Témoignages Clients</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 text-shadow-soft">
            <span className="text-gradient-gold animate-shimmer">Histoires</span>
            <br />
            <span className="text-gray-800">de Nos Clients</span>
            <br />
            <span className="font-arabic text-4xl md:text-5xl text-gradient">قصص عملائنا</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-elegant">
            Découvrez pourquoi des milliers de clients dans le monde entier nous font confiance pour 
            des trésors artisanaux tunisiens authentiques. Lisez leurs histoires et expériences.
          </p>
        </div>

        {/* Interactive Carousel */}
        <div className="relative max-w-6xl mx-auto mb-16">
          {/* Main Testimonial Display */}
          <div className="relative backdrop-cultural rounded-3xl p-8 md:p-12 border border-amber-200 shadow-cinematic overflow-hidden">
            {/* Cultural Pattern Overlay */}
            <div className="absolute inset-0 pattern-geometric opacity-5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Testimonial Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center shadow-cultural animate-pulse-slow">
                      <Quote className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-6 w-6 text-amber-400 fill-current animate-shimmer"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed font-elegant italic">
                    &ldquo;{testimonials[currentIndex].comment}&rdquo;
                  </blockquote>
                  
                  <div className="flex items-center gap-4 p-4 backdrop-luxury rounded-xl border border-white/20">
                    <div className="relative">
                      <Image
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-cultural"
                      />
                      {testimonials[currentIndex].verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-display font-bold text-lg text-gray-900">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <MapPin className="h-3 w-3" />
                        {testimonials[currentIndex].location}
                      </div>
                      <div className="text-xs text-amber-600 font-elegant">
                        {testimonials[currentIndex].story}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 backdrop-luxury rounded-lg border border-amber-100">
                    <div className="text-sm font-medium text-gray-700">Produit acheté:</div>
                    <div className="text-sm text-gradient font-semibold">{testimonials[currentIndex].product}</div>
                  </div>
                </div>

                {/* Professional Product Showcase with Swiper */}
                <div className="relative w-full h-[420px] lg:h-auto lg:aspect-square flex items-center justify-center">
                  {products.length > 0 ? (
                    <Swiper
                      effect={'coverflow'}
                      grabCursor={true}
                      centeredSlides={true}
                      slidesPerView={'auto'}
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                      }}
                      coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                      }}
                      pagination={{ clickable: true }}
                      modules={[EffectCoverflow, Pagination, Autoplay]}
                      className="w-full h-full"
                    >
                      {products.map((product) => (
                        <SwiperSlide key={product.id} style={{ width: '300px', height: '380px' }}>
                          <div className="relative w-full h-full group">
                            <Image
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name || 'Produit tunisien'}
                              width={300}
                              height={380}
                              className="w-full h-full object-cover rounded-2xl shadow-cultural transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h4 className="font-bold text-lg truncate">{product.name}</h4>
                              <p className="text-amber-300 font-medium">
                                {product.price && 
                                  new Intl.NumberFormat('fr-TN', {
                                    style: 'currency',
                                    currency: 'TND'
                                  }).format(product.price)
                                }
                              </p>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                      <div className="text-8xl animate-float opacity-60">🏺</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full btn-cultural hover-glow p-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 w-8' 
                      : 'bg-gray-300 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full btn-cultural hover-glow p-0"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={toggleAutoPlay}
              className="w-12 h-12 rounded-full btn-cultural hover-glow p-0 ml-4"
            >
              {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Trust Indicators with Cultural Design */}
        <div className="text-center animate-fade-in">
          <div className="backdrop-cultural rounded-3xl p-8 border border-amber-200 shadow-cultural">
            <h3 className="text-2xl font-display font-bold text-gradient mb-8">
              La Confiance de Nos Clients
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulse-slow">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gradient-gold mb-2">4.9/5</div>
                <div className="text-sm text-gray-600 font-elegant">Note Moyenne</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 gradient-cultural rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulse-slow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gradient-gold mb-2">2.5K+</div>
                <div className="text-sm text-gray-600 font-elegant">Clients Satisfaits</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 gradient-sunset rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulse-slow">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gradient-gold mb-2">98%</div>
                <div className="text-sm text-gray-600 font-elegant">Taux de Satisfaction</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 gradient-royal rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulse-slow">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gradient-gold mb-2">50+</div>
                <div className="text-sm text-gray-600 font-elegant">Pays Desservis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}