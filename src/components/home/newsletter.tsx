'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check, Gift, Bell, Users, Sparkles, Award, Heart, Star } from 'lucide-react'
import { ClientOnly } from '@/components/ui/client-only'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubscribed(true)
    setEmail('')
    setIsLoading(false)
  }

  if (isSubscribed) {
    return (
      <section 
        className="section-padding relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            var(--tunisian-gold) 0%, 
            var(--tunisian-terracotta) 50%, 
            var(--tunisian-coral) 100%)`
        }}
        suppressHydrationWarning={true}
      >
        {/* Cultural Background Elements */}
        <div className="absolute inset-0 -z-10" suppressHydrationWarning={true}>
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div 
            className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full animate-float-slow"
            style={{
              transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)`,
            }}
          ></div>
          <div 
            className="absolute bottom-10 right-10 w-32 h-32 bg-white/15 rounded-full animate-float"
            style={{
              transform: `translateY(${scrollY * -0.08}px)`,
              animationDelay: '2s'
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full animate-float-delayed"
            style={{
              transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
              animationDelay: '4s'
            }}
          ></div>
        </div>
        
        <div className="container-luxury text-center relative z-10" suppressHydrationWarning={true}>
          <div className="backdrop-luxury rounded-3xl p-12 md:p-16 shadow-cinematic border border-white/30 animate-scale-in max-w-4xl mx-auto">
            {/* Success Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 gradient-cultural rounded-full flex items-center justify-center shadow-cinematic animate-pulse-slow">
                  <Check className="h-12 w-12 text-white animate-scale-in" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-shadow-soft">
              <span className="text-white">Bienvenue dans</span>
              <br />
              <span className="text-gradient-gold animate-shimmer">Notre Communauté !</span>
              <br />
              <span className="font-arabic text-3xl md:text-4xl text-white/90">أهلاً وسهلاً</span>
            </h2>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8 font-elegant text-shadow-soft">
              Merci de rejoindre notre communauté exclusive d&apos;amateurs d&apos;art tunisien. Vous recevrez nos dernières 
              découvertes artisanales, des offres spéciales, et des histoires exclusives de nos maîtres artisans.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="backdrop-cultural rounded-xl p-6 border border-white/20 hover-lift">
                <Gift className="h-8 w-8 text-amber-300 mx-auto mb-3 animate-pulse-slow" />
                <h3 className="font-display font-semibold text-white mb-2">Offres Exclusives</h3>
                <p className="text-white/80 text-sm font-elegant">Accès prioritaire aux nouvelles collections</p>
              </div>
              <div className="backdrop-cultural rounded-xl p-6 border border-white/20 hover-lift">
                <Bell className="h-8 w-8 text-amber-300 mx-auto mb-3 animate-pulse-slow" />
                <h3 className="font-display font-semibold text-white mb-2">Actualités Artisanales</h3>
                <p className="text-white/80 text-sm font-elegant">Histoires et techniques de nos artisans</p>
              </div>
              <div className="backdrop-cultural rounded-xl p-6 border border-white/20 hover-lift">
                <Users className="h-8 w-8 text-amber-300 mx-auto mb-3 animate-pulse-slow" />
                <h3 className="font-display font-semibold text-white mb-2">Communauté VIP</h3>
                <p className="text-white/80 text-sm font-elegant">Rejoignez 5000+ passionnés d&apos;art</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 text-white/70 text-sm font-elegant">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                <span>Contenu Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>
                <span>Événements Exclusifs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow"></div>
                <span>Réductions Spéciales</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50"
      suppressHydrationWarning={true}
    >
      {/* Modern Background Elements */}
      <div className="absolute inset-0 -z-10" suppressHydrationWarning={true}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-orange-50/20"></div>
        <div 
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-2xl"
          style={{
            transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)`,
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-orange-100/30 to-amber-100/30 rounded-full"
          style={{
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        ></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10" suppressHydrationWarning={true}>
        <div className="bg-white rounded-2xl p-12 md:p-16 shadow-card border border-gray-200 max-w-5xl mx-auto">
          <div className="relative z-10">
            {/* Modern Header */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center shadow-card">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Rejoignez Notre</span>
              <br />
              <span className="text-gray-800">Communauté Exclusive</span>
              <br />
              <span className="text-3xl md:text-4xl bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent" style={{ fontFamily: 'Amiri, serif' }}>انضم إلى مجتمعنا</span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Soyez les premiers à découvrir nos nouveaux chefs-d&apos;œuvre artisanaux, recevez des offres exclusives, 
              et accédez aux coulisses des ateliers de nos maîtres artisans. Rejoignez des milliers d&apos;amateurs d&apos;art du monde entier !
            </p>

            {/* Modern Form */}
            <ClientOnly>
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-10" suppressHydrationWarning={true}>
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-gray-50 rounded-2xl border border-gray-200">
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex-1 h-14 text-base px-6 bg-white border-0 focus:bg-white rounded-xl shadow-card placeholder:text-gray-500"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-base px-8 py-3 h-14 whitespace-nowrap shadow-card hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300 rounded-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Inscription...</span>
                      </div>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Rejoindre
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ClientOnly>

            {/* Modern Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 group">
                <Gift className="h-8 w-8 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Offres Exclusives</h3>
                <p className="text-gray-600">Réductions jusqu&apos;à 30% sur les nouvelles collections</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 group">
                <Bell className="h-8 w-8 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Actualités Artisanales</h3>
                <p className="text-gray-600">Histoires et techniques de nos maîtres artisans</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 group">
                <Award className="h-8 w-8 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Accès VIP</h3>
                <p className="text-gray-600">Événements privés et lancements en avant-première</p>
              </div>
            </div>

            {/* Modern Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-card">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Aucun spam, jamais</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-card">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Désabonnement facile</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-card">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Contenu premium</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-card">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>5000+ membres actifs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}