'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Clock, Award, User, Calendar, CreditCard, Loader2, CheckCircle, AlertCircle, Users, Phone, Mail, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface Training {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration: string;
  format: string;
  level: string;
  price: number;
  image: string;
  images?: string[];
  videos?: string[];
  category: string;
  instructor?: {
    name: string;
    bio: string;
    image: string;
  };
  syllabus?: {
    week: number;
    topic: string;
    description: string;
  }[];
}

export default function TrainingDetailPage() {
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [notes, setNotes] = useState('')
  const [participantCount, setParticipantCount] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [showVideos, setShowVideos] = useState(false)
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false)
  const { id } = useParams()
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()

  useEffect(() => {
    const loadTraining = async () => {
      if (!id) return

      try {
        setLoading(true)
        const res = await fetch(`/api/trainings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTraining(data.training);
          setSelectedImageIndex(0); // Reset to first image when training loads
        }
      } catch (err) {
        setError('Échec du chargement de la formation. Veuillez réessayer plus tard.')
        if (process.env.NODE_ENV === 'development') console.error('Error loading training:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTraining()
  }, [id])

  // Helper function to validate image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false
    if (typeof url !== 'string') return false
    if (url.trim() === '') return false
    if (url === 'undefined' || url === 'null') return false
    
    // Check for valid image URL patterns
    const trimmedUrl = url.trim()
    if (trimmedUrl.startsWith('data:') || 
        trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://') || 
        trimmedUrl.startsWith('/') ||
        trimmedUrl.includes('.')) { // Allow any URL with a file extension
      return true
    }
    
    return false
  }

  const handlePreviousImage = () => {
    if (training?.images) {
      const validImages = training.images.filter((img: string) => isValidImageUrl(img))
      setSelectedImageIndex(prev => 
        prev === 0 ? validImages.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (training?.images) {
      const validImages = training.images.filter((img: string) => isValidImageUrl(img))
      setSelectedImageIndex(prev => 
        prev === validImages.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handlePreviousVideo = () => {
    if (training?.videos) {
      const validVideos = training.videos.filter((video: string) => video && video.trim() !== '')
      setSelectedVideoIndex(prev => 
        prev === 0 ? validVideos.length - 1 : prev - 1
      )
    }
  }

  const handleNextVideo = () => {
    if (training?.videos) {
      const validVideos = training.videos.filter((video: string) => video && video.trim() !== '')
      setSelectedVideoIndex(prev => 
        prev === validVideos.length - 1 ? 0 : prev + 1
      )
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleaned)
  }

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/')
    if (!month || !year) return false
    const monthNum = parseInt(month)
    const yearNum = parseInt('20' + year)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    
    if (monthNum < 1 || monthNum > 12) return false
    if (yearNum < currentYear) return false
    if (yearNum === currentYear && monthNum < currentMonth) return false
    return true
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!selectedDate) {
      errors.selectedDate = 'Veuillez sélectionner une date de début'
    }
    
    if (!participantName.trim()) {
      errors.participantName = 'Le nom du participant est requis'
    }
    
    if (!participantEmail.trim()) {
      errors.participantEmail = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(participantEmail)) {
      errors.participantEmail = 'Veuillez entrer un email valide'
    }
    
    if (!participantPhone.trim()) {
      errors.participantPhone = 'Le numéro de téléphone est requis'
    }
    
    if (participantCount < 1) {
      errors.participantCount = 'Au moins 1 participant est requis'
    }

    // Credit card validation
    if (paymentMethod === 'card') {
      if (!cardName.trim()) {
        errors.cardName = 'Le nom du titulaire de la carte est requis'
      }
      
      if (!cardNumber.trim()) {
        errors.cardNumber = 'Le numéro de carte est requis'
      } else if (!validateCardNumber(cardNumber)) {
        errors.cardNumber = 'Veuillez entrer un numéro de carte valide'
      }
      
      if (!cardExpiry.trim()) {
        errors.cardExpiry = 'La date d\'expiration est requise'
      } else if (!validateExpiry(cardExpiry)) {
        errors.cardExpiry = 'Veuillez entrer une date d\'expiration valide'
      }
      
      if (!cardCvv.trim()) {
        errors.cardCvv = 'Le CVV est requis'
      } else if (!/^\d{3,4}$/.test(cardCvv)) {
        errors.cardCvv = 'Veuillez entrer un CVV valide'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const processPayment = async () => {
    if (paymentMethod !== 'card') {
      return { success: true, transactionId: null }
    }

    setPaymentProcessing(true)
    try {
      // Simulate payment processing (replace with actual payment gateway integration)
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: (training?.price || 0) * participantCount,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiry: cardExpiry,
          cvv: cardCvv,
          cardName: cardName,
          description: `Training enrollment: ${training?.title}`
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Payment processing error:', error)
      return { success: false, error: 'Payment processing failed' }
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleEnrollment = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour vous inscrire à la formation')
      return
    }

    if (!training?.id) {
      alert('Informations de formation non disponibles')
      return
    }

    if (!validateForm()) {
      return
    }

    // Process payment first if credit card is selected
    if (paymentMethod === 'card') {
      const paymentResult = await processPayment()
      if (!paymentResult.success) {
        alert('Échec du paiement : ' + (paymentResult.error || 'Erreur inconnue'))
        return
      }
      setPaymentSuccess(true)
    }

    setEnrollmentLoading(true)
    try {
      const response = await fetch('/api/trainings/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingId: training.id,
          slots: participantCount,
          totalPrice: (training.price || 0) * participantCount,
          participantName,
          participantEmail,
          participantPhone,
          selectedDate,
          notes,
        }),
      })

      const data = await response.json()

      if (data.enrollment) {
        setEnrollmentSuccess(true)
        // Reset form
        setNotes('')
        setParticipantCount(1)
        setSelectedDate('')
        setParticipantName('')
        setParticipantEmail('')
        setParticipantPhone('')
        setCardNumber('')
        setCardExpiry('')
        setCardCvv('')
        setCardName('')
        setFormErrors({})
        setPaymentSuccess(false)
        toast.success('Inscription à la formation créée avec succès !', {
          description: 'Vous serez contacté pour confirmation dans les plus brefs délais.',
          duration: 5000,
        })
      } else {
        toast.error('Échec de la création de l\'inscription', {
          description: data.error || 'Erreur inconnue',
          duration: 5000,
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error creating enrollment:', error)
      toast.error('Échec de la création de l\'inscription', {
        description: 'Veuillez réessayer ou contacter le support.',
        duration: 5000,
      })
    } finally {
      setEnrollmentLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="aspect-video rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-10 w-48 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <Link href="/trainings">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Formations
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  if (!training) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Formation non trouvée</h2>
          <p className="text-gray-600">La formation que vous recherchez n'existe pas.</p>
          <Link href="/trainings">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Formations
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/trainings" className="inline-flex items-center text-gray-600 hover:text-amber-600 mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Retour aux Formations
        </Link>
        
        <div className="grid md:grid-cols-5 gap-12">
          {/* Left Column (Images) */}
          <div className="md:col-span-3">
            <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden mb-4 relative group">
              {(() => {
                const validImages = (training as any).images?.filter((img: string) => isValidImageUrl(img)) || []
                const currentImage = validImages[selectedImageIndex]
                
                return currentImage ? (
                  <Image
                    src={currentImage}
                    alt={training.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/api/placeholder/400/300'
                    }}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune image disponible</p>
                    </div>
                  </div>
                )
              })()}
              
              {/* Navigation arrows - only show if there are multiple images */}
              {(() => {
                const validImages = (training as any).images?.filter((img: string) => isValidImageUrl(img)) || []
                return validImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )
              })()}
              
              {/* Image counter */}
              {(() => {
                const validImages = (training as any).images?.filter((img: string) => isValidImageUrl(img)) || []
                return validImages.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {selectedImageIndex + 1} / {validImages.length}
                  </div>
                )
              })()}
            </div>
            
            {/* Thumbnail images */}
            {(() => {
              const validImages = (training as any).images?.filter((img: string) => isValidImageUrl(img)) || []
              return validImages.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto py-2">
                  {validImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-amber-500' 
                          : 'border-transparent hover:border-amber-300'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`Training image ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/api/placeholder/96/96'
                        }}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )
            })()}
            
            {/* Videos Section */}
            {(() => {
              const validVideos = (training as any).videos?.filter((video: string) => video && video.trim() !== '') || []
              return validVideos.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vidéos</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVideos(!showVideos)}
                    >
                      {showVideos ? 'Masquer les Vidéos' : 'Afficher les Vidéos'}
                    </Button>
                  </div>
                  
                  {showVideos && (
                    <div className="space-y-4">
                      {/* Main Video Display */}
                      <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden relative group w-full max-w-4xl mx-auto">
                        {(() => {
                          const currentVideo = validVideos[selectedVideoIndex]
                          return currentVideo ? (
                            <video
                              src={currentVideo}
                              controls
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <div className="text-center text-gray-500">
                                <BookOpen className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Aucune vidéo disponible</p>
                              </div>
                            </div>
                          )
                        })()}
                        
                        {/* Video Navigation arrows - only show if there are multiple videos */}
                        {validVideos.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                              onClick={handlePreviousVideo}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                              onClick={handleNextVideo}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {/* Video counter */}
                        {validVideos.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {selectedVideoIndex + 1} / {validVideos.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Video Thumbnails */}
                      {validVideos.length > 1 && (
                        <div className="flex space-x-3 overflow-x-auto py-2">
                          {validVideos.map((video: string, index: number) => (
                            <div
                              key={index}
                              className={`flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                                index === selectedVideoIndex 
                                  ? 'border-amber-500' 
                                  : 'border-transparent hover:border-amber-300'
                              }`}
                              onClick={() => setSelectedVideoIndex(index)}
                            >
                              <video
                                src={video}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                muted
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
            
            {training.instructor && (
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                {training.instructor.image && training.instructor.image.trim() !== '' ? (
                  <Image
                    src={training.instructor.image}
                    alt={training.instructor.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/api/placeholder/64/64'
                    }}
                    unoptimized
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{training.instructor.name}</h4>
                  <p className="text-sm text-gray-600">{training.instructor.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Details) */}
          <div className="md:col-span-2">
            <Badge variant="outline" className="mb-2">{training.category}</Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{training.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {training.duration}</div>
              <div className="flex items-center"><BookOpen className="h-4 w-4 mr-2" /> {training.format}</div>
              <div className="flex items-center"><Award className="h-4 w-4 mr-2" /> {training.level}</div>
            </div>

            <p className="text-gray-700 mb-6">{training.description}</p>

            <div className="text-3xl font-bold text-amber-600 mb-6">
              {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(training.price || 0)}
            </div>

            <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full btn-luxury text-lg py-4 h-auto"
                  onClick={(e) => {
                    if (!session) {
                      e.preventDefault()
                      toast.error('Veuillez vous connecter pour vous inscrire à la formation.')
                      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
                      return
                    }
                    setIsEnrollmentDialogOpen(true)
                  }}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  S'inscrire Maintenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-amber-100 pb-4">
                  <DialogTitle className="text-2xl font-display font-bold text-gradient flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                    S'inscrire à la Formation
                  </DialogTitle>
                  <p className="text-gray-600 mt-2">Complétez votre inscription à la formation avec les détails ci-dessous</p>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Training Summary */}
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-3">
                      <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Détails de la Formation
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Formation :</span>
                        <span className="font-medium">{training.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée :</span>
                        <span className="font-medium">{training.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format :</span>
                        <span className="font-medium">{training.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Niveau :</span>
                        <span className="font-medium">{training.level}</span>
                      </div>
                      <div className="flex justify-between border-t border-amber-200 pt-2">
                        <span className="text-gray-600">Prix par personne :</span>
                        <span className="font-bold text-amber-600">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(training.price || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enrollment Form */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-amber-600" />
                      Informations d'Inscription
                    </h3>
                    
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="selectedDate" className="text-sm font-medium text-gray-700">
                          Date de Début Préférée *
                        </Label>
                        <Input
                          id="selectedDate"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${formErrors.selectedDate ? 'border-red-300' : ''}`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {formErrors.selectedDate && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {formErrors.selectedDate}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="participantCount" className="text-sm font-medium text-gray-700">
                          Nombre de Participants *
                        </Label>
                        <Input
                          id="participantCount"
                          type="number"
                          min="1"
                          max="5"
                          value={participantCount}
                          onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                          className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${formErrors.participantCount ? 'border-red-300' : ''}`}
                        />
                        {formErrors.participantCount && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {formErrors.participantCount}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Participant Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-600" />
                        Informations de Contact Principal
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="participantName" className="text-sm font-medium text-gray-700">
                          Nom Complet *
                        </Label>
                        <Input
                          id="participantName"
                          value={participantName}
                          onChange={(e) => setParticipantName(e.target.value)}
                          placeholder="Entrez votre nom complet"
                          className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${formErrors.participantName ? 'border-red-300' : ''}`}
                        />
                        {formErrors.participantName && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {formErrors.participantName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="participantEmail" className="text-sm font-medium text-gray-700">
                            Adresse Email *
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="participantEmail"
                              type="email"
                              value={participantEmail}
                              onChange={(e) => setParticipantEmail(e.target.value)}
                              placeholder="your@email.com"
                              className={`pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${formErrors.participantEmail ? 'border-red-300' : ''}`}
                            />
                          </div>
                          {formErrors.participantEmail && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.participantEmail}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="participantPhone" className="text-sm font-medium text-gray-700">
                            Numéro de Téléphone *
                          </Label>
                          <div className={`phone-input-container ${formErrors.participantPhone ? 'error' : ''}`}>
                            <PhoneInput
                              country={'tn'}
                              value={participantPhone}
                              onChange={(phone) => {
                                setParticipantPhone(phone)
                                if (formErrors.participantPhone) {
                                  setFormErrors({ ...formErrors, participantPhone: '' })
                                }
                              }}
                              placeholder="Entrez votre numéro de téléphone"
                              enableSearch
                              disableSearchIcon={false}
                              searchPlaceholder="Rechercher un pays..."
                              inputStyle={{ 
                                width: '100%',
                                borderColor: formErrors.participantPhone ? '#ef4444' : '#fbbf24',
                                borderRadius: '6px'
                              }}
                              buttonStyle={{
                                borderColor: formErrors.participantPhone ? '#ef4444' : '#fbbf24',
                                borderRadius: '6px'
                              }}
                            />
                          </div>
                          {formErrors.participantPhone && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {formErrors.participantPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment-method" className="text-sm font-medium text-gray-700">
                          Méthode de Paiement *
                        </Label>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-green-50 border-green-200">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Paiement lors de la formation</p>
                            <p className="text-sm text-green-600">Payez en espèces lors de votre présence à la formation</p>
                          </div>
                        </div>
                        <input type="hidden" value="cash_on_delivery" onChange={() => setPaymentMethod('cash_on_delivery')} />
                      </div>

                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                        Notes Supplémentaires (Optionnel)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Toute exigence spéciale, objectif d'apprentissage ou note..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[80px]"
                      />
                    </div>

                    {/* Total Calculation */}
                    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Montant Total :</span>
                          <span className="text-2xl font-bold text-gradient">
                            {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format((training.price || 0) * participantCount)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {participantCount} participant{participantCount > 1 ? 's' : ''} × {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(training.price || 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-amber-100">
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleEnrollment}
                    disabled={enrollmentLoading || paymentProcessing}
                    className="btn-luxury px-8"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement du Paiement...
                      </>
                    ) : enrollmentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création de l'Inscription...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {paymentMethod === 'card' ? 'Payer et S\'inscrire' : 'Confirmer l\'Inscription'}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Long Description & Syllabus */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-amber-600 border-amber-600">
                Description Complète
              </button>
              {training.syllabus && (
                <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Programme
                </button>
              )}
            </nav>
          </div>
          <div className="py-6">
            <p className="text-gray-700 leading-relaxed">
              {training.longDescription || training.description}
            </p>
            {training.syllabus && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Programme</h3>
                <div className="space-y-4">
                  {training.syllabus.map((item) => (
                    <div key={item.week} className="flex space-x-4">
                      <div className="font-semibold">Semaine {item.week}</div>
                      <div>
                        <h4 className="font-semibold">{item.topic}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
