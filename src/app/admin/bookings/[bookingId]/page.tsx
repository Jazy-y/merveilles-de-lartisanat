 'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCSRFHeaders } from '@/lib/csrf-client'
import { ArrowLeft, Calendar, MapPin, User, DollarSign, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface WorkshopBooking {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalPrice: number
  slots: number
  createdAt: string
  updatedAt: string
  // Enrollment form data
  participantName?: string | null
  participantEmail?: string | null
  participantPhone?: string | null
  selectedDate?: string | null
  notes?: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  workshop: {
    id: string
    title: string
    schedule: string
    hours: string
    duration: string
    location: string
    price: number
    description: string
    slots: number
    availableSlots: number
    category: string
  }
}

export default function AdminBookingDetailsPage() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState<WorkshopBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId || typeof bookingId !== 'string') {
        setError('Invalid Booking ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/workshop-bookings/${bookingId}`, {
          method: 'GET',
          headers: await createCSRFHeaders(),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const bookingData = await response.json()
        setBooking(bookingData)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading booking:', error)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId])

  const handleStatusUpdate = async (newStatus: WorkshopBooking['status']) => {
    if (!booking) return

    try {
      const response = await fetch(`/api/workshop-bookings/${bookingId}`, {
        method: 'PUT',
        headers: await createCSRFHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }
      
      setBooking({ ...booking, status: newStatus })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating booking status:', error)
      alert('Failed to update booking status')
    }
  }

  const getStatusColor = (status: WorkshopBooking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: WorkshopBooking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The requested booking could not be found.'}</p>
            <Link href="/admin/bookings">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/bookings" className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux Réservations
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                Réservation #{booking.id?.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Détails de la réservation d'atelier</p>
            </div>
            <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 text-xs sm:text-sm`}>
              {getStatusIcon(booking.status)}
              {booking.status === 'PENDING' ? 'En attente' : 
               booking.status === 'CONFIRMED' ? 'Confirmé' :
               booking.status === 'CANCELLED' ? 'Annulé' :
               booking.status === 'COMPLETED' ? 'Terminé' : 'Inconnu'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Booking Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm mt-1">{booking.participantName || booking.user?.name || 'Unknown User'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm mt-1">{booking.participantEmail || booking.user?.email || 'No email'}</p>
              </div>
              {booking.participantPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm mt-1">📞 {booking.participantPhone}</p>
                </div>
              )}
              {booking.selectedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Preferred Date</label>
                  <p className="text-sm mt-1">
                    {new Date(booking.selectedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                  {booking.user?.id || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Date</label>
                <p className="text-sm mt-1">
                  {new Date(booking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workshop Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Détails de l'Atelier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Titre de l'Atelier</label>
                <p className="text-xs sm:text-sm mt-1 font-medium break-words">{booking.workshop?.title || 'Atelier inconnu'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Horaire</label>
                <p className="text-xs sm:text-sm mt-1 break-words">
                  {(booking.workshop as any)?.schedule || (booking as any)?.date || 'Aucun horaire'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Heures</label>
                <p className="text-xs sm:text-sm mt-1 break-words">
                  {booking.workshop?.hours || 'Aucune heure spécifiée'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Durée</label>
                <p className="text-xs sm:text-sm mt-1 break-words">
                  {booking.workshop?.duration || 'Aucune durée spécifiée'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Lieu</label>
                <p className="text-xs sm:text-sm mt-1 flex items-center gap-1 break-words">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {booking.workshop?.location || 'Aucun lieu'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Catégorie</label>
                <p className="text-xs sm:text-sm mt-1 break-words">{booking.workshop?.category || 'Aucune catégorie'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600">Prix par Place</label>
                <p className="text-xs sm:text-sm mt-1 font-medium">
                  {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(booking.workshop?.price || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Résumé de la Réservation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Places Réservées :</span>
                <span className="font-medium">{booking.slots}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Prix par Place :</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(booking.workshop?.price || 0)}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2">
                <span>Prix Total :</span>
                <span className="text-amber-600 break-words">
                  {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(booking.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {booking.notes && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Notes Supplémentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">{booking.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                Gestion du Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-600 mb-2 block">Mettre à Jour le Statut</label>
                <Select
                  value={booking.status}
                  onValueChange={(value: WorkshopBooking['status']) => handleStatusUpdate(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                <p>Statut actuel : <span className="font-medium">{booking.status === 'PENDING' ? 'En attente' : 
                 booking.status === 'CONFIRMED' ? 'Confirmé' :
                 booking.status === 'CANCELLED' ? 'Annulé' :
                 booking.status === 'COMPLETED' ? 'Terminé' :
                 String(booking.status)}</span></p>
                <p>Dernière mise à jour : {new Date(booking.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
