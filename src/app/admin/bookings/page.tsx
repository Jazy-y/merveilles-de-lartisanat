'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCSRFHeaders } from '@/lib/csrf-client'

interface WorkshopBooking {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalPrice: number
  slots: number
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  workshop: {
    id: string
    title: string
    date: string
    location: string
    price: number
    description: string
    slots: number
    availableSlots: number
    category: string
  }
}
import { Calendar, MapPin, User, DollarSign, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<WorkshopBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/workshop-bookings', {
          method: 'GET',
          headers: await createCSRFHeaders(),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        
        const bookingsData = await response.json()
        setBookings(bookingsData)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  const handleStatusUpdate = async (bookingId: string, newStatus: WorkshopBooking['status']) => {
    try {
      const response = await fetch(`/api/workshop-bookings/${bookingId}`, {
        method: 'PUT',
        headers: await createCSRFHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ))
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

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter)

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Workshop Bookings</h1>
            <p className="text-gray-600">Manage all workshop bookings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
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
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Réservations d'Ateliers</h1>
            <p className="text-sm sm:text-base text-gray-600">Gérez toutes les réservations d'ateliers</p>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les réservations</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg break-words">
                    Réservation #{booking.id?.slice(-8).toUpperCase()}
                  </CardTitle>
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 text-xs`}>
                    {getStatusIcon(booking.status)}
                    {booking.status === 'PENDING' ? 'En attente' : 
                     booking.status === 'CONFIRMED' ? 'Confirmé' :
                     booking.status === 'CANCELLED' ? 'Annulé' :
                     booking.status === 'COMPLETED' ? 'Terminé' : 'Inconnu'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.user?.name || 'Utilisateur inconnu'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{(booking.workshop as any)?.schedule || (booking as any)?.date || 'Aucun horaire'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    {new Intl.NumberFormat('fr-TN', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(booking.totalPrice || 0)}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="mr-2">🎫</span>
                    {booking.slots} place{booking.slots !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.workshop?.location || 'Aucun lieu'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t">
                    <Select
                      value={booking.status}
                      onValueChange={(value: WorkshopBooking['status']) => 
                        handleStatusUpdate(booking.id!, value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Link href={`/admin/bookings/${booking.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Voir les détails</span>
                        <span className="sm:hidden">Détails</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {filter === 'all' 
                ? 'Aucune réservation d\'atelier n\'a encore été effectuée.'
                : `Aucune réservation ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmée' : 'annulée'} trouvée.`
              }
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
