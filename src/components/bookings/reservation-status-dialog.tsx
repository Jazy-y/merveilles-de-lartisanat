'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
// Using native JavaScript date formatting

interface Booking {
  id: string
  status: string
  selectedDate: string | null
  createdAt: string
  updatedAt: string
  adminMessage: string | null
  participantName: string | null
  participantEmail: string | null
  participantPhone: string | null
  slots: number
  totalPrice: number
  notes: string | null
  event: {
    id: string
    title: string
  }
  eventType: 'workshop' | 'training'
}

interface BookingHistory {
  id: string
  status: string
  selectedDate: string | null
  createdAt: string
  updatedAt: string
  adminMessage: string | null
  slots: number
  totalPrice: number
  event: {
    id: string
    title: string
  }
}

interface ReservationStatusDialogProps {
  bookingId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>
    case 'CONFIRMED':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>
    case 'REFUSED':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusé</Badge>
    case 'COMPLETED':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Complété</Badge>
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Annulé</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'REFUSED':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'PENDING':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

export default function ReservationStatusDialog({
  bookingId,
  open,
  onOpenChange
}: ReservationStatusDialogProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [history, setHistory] = useState<BookingHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && bookingId) {
      fetchBookingStatus()
    } else {
      setBooking(null)
      setHistory([])
      setError(null)
    }
  }, [open, bookingId])

  const fetchBookingStatus = async () => {
    if (!bookingId) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/bookings/${bookingId}/status`)
      
      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
        setHistory(data.history || [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Erreur lors du chargement du statut de la réservation.')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error fetching booking status:', error)
      setError('Erreur lors du chargement du statut de la réservation.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifiée'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Statut de la réservation</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && booking && (
          <div className="space-y-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{booking.event.title}</CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                  <span className="font-medium">Statut:</span>
                  <span>{getStatusBadge(booking.status)}</span>
                </div>

                {/* Date */}
                {booking.selectedDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Date de la réservation</p>
                      <p className="text-gray-600">{formatDate(booking.selectedDate)}</p>
                    </div>
                  </div>
                )}

                {/* Participant Info */}
                {(booking.participantName || booking.participantEmail || booking.participantPhone) && (
                  <div className="space-y-2">
                    <p className="font-medium">Informations du participant</p>
                    {booking.participantName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{booking.participantName}</span>
                      </div>
                    )}
                    {booking.participantEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{booking.participantEmail}</span>
                      </div>
                    )}
                    {booking.participantPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{booking.participantPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Nombre de places</p>
                    <p className="text-gray-600">{booking.slots}</p>
                  </div>
                  <div>
                    <p className="font-medium">Prix total</p>
                    <p className="text-gray-600">{booking.totalPrice.toFixed(2)} DT</p>
                  </div>
                </div>

                {/* Created/Updated */}
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Date de création</p>
                    <p className="text-gray-600">{formatDateTime(booking.createdAt)}</p>
                  </div>
                </div>

                {/* Admin Message */}
                {booking.adminMessage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Message de l'administrateur</p>
                        <p className="text-amber-800 mt-1">{booking.adminMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div>
                    <p className="font-medium">Notes</p>
                    <p className="text-gray-600">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historique des réservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((h) => (
                      <div key={h.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(h.status)}
                            <span className="font-medium">{h.event.title}</span>
                          </div>
                          {getStatusBadge(h.status)}
                        </div>
                        {h.selectedDate && (
                          <p className="text-sm text-gray-600">
                            Date: {formatDate(h.selectedDate)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Créée le: {formatDateTime(h.createdAt)}
                        </p>
                        {h.adminMessage && (
                          <p className="text-sm text-gray-600 mt-1">
                            Message: {h.adminMessage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

