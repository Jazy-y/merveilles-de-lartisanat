'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, X, Eye, Download } from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  totalAmount: number;
  status: string;
  type: string;
  bookingDate: string;
}

export default function BookingsTab() {
  const { data: session } = useSession()
  const user = session?.user
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        try {
          const res = await fetch('/api/bookings/my-bookings');
          if (res.ok) {
            const data = await res.json();
            setBookings(data.bookings);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching bookings:', error);
        }
        setLoading(false)
      }
      fetchBookings();
    }
  }, [user])

  const handleCancelBooking = async (bookingId: string, type: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
        toast.success('Réservation annulée avec succès')
      } else {
        toast.error('Échec de l\'annulation de la réservation')
      }
    } catch (error) {
      toast.error('Échec de l\'annulation de la réservation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-primary/10 text-foreground border-border'
      case 'PENDING':
        return 'bg-muted text-muted-foreground border-border'
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground font-display">Mes réservations</h2>
        <Badge variant="outline" className="border-border text-foreground">
          {bookings.length} {bookings.length === 1 ? 'Réservation' : 'Réservations'}
        </Badge>
      </div>

      {bookings.length === 0 ? (
        <Card className="card-luxury border-2 border-dashed border-border bg-card">
          <CardContent className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Vous n&apos;avez pas encore de réservations</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Découvrez nos ateliers et formations artisanales. Réservez votre place dès maintenant !
            </p>
            <Link href="/workshops">
              <Button className="px-8 py-6 text-base">
                Voir les ateliers
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Card key={booking.id} className="card-luxury hover:shadow-luxury-hover transition-all duration-300 bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Booking Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{booking.title}</h3>
                        <Badge className={`${getStatusColor(booking.status)} border`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${booking.totalAmount}</p>
                        <p className="text-sm text-muted-foreground">Montant total</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Calendar className="w-5 h-5 text-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(booking.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <Clock className="w-5 h-5 text-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Heure</p>
                          <p className="font-medium text-foreground">{booking.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <MapPin className="w-5 h-5 text-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Lieu</p>
                          <p className="font-medium text-foreground">{booking.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Type : {booking.type === 'workshop' ? 'Atelier' : 'Formation'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Réservé le : {new Date(booking.bookingDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                    <Button variant="outline" className="border-border">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les détails
                    </Button>
                    <Button variant="outline" className="border-border">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le billet
                    </Button>
                    {booking.status === 'CONFIRMED' && (
                      <Button 
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.id!, booking.type)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler la réservation
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
