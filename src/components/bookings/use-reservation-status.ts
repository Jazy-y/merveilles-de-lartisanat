'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ReservationStatus {
  hasReservation: boolean
  booking: {
    id: string
    status: string
    selectedDate: string | null
    adminMessage: string | null
    event: {
      id: string
      title: string
    }
  } | null
}

interface UseReservationStatusProps {
  eventType: 'workshop' | 'training'
  eventId: string | null
  selectedDate: string | null
  enabled?: boolean
}

export function useReservationStatus({
  eventType,
  eventId,
  selectedDate,
  enabled = true
}: UseReservationStatusProps) {
  const [status, setStatus] = useState<ReservationStatus>({
    hasReservation: false,
    booking: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (!enabled || !session?.user || !eventId || !selectedDate) {
      setStatus({ hasReservation: false, booking: null })
      setLoading(false)
      return
    }

    const checkReservation = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          eventType,
          eventId,
          selectedDate: selectedDate.trim()
        })

        const res = await fetch(`/api/bookings/check?${params.toString()}`)
        
        if (res.ok) {
          const data = await res.json()
          setStatus({
            hasReservation: data.hasReservation,
            booking: data.booking
          })
        } else {
          const errorData = await res.json().catch(() => ({}))
          setError(errorData.error || 'Erreur lors de la vérification de la réservation.')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error checking reservation status:', error)
        setError('Erreur lors de la vérification de la réservation.')
      } finally {
        setLoading(false)
      }
    }

    checkReservation()
  }, [eventType, eventId, selectedDate, enabled, session?.user])

  return {
    status,
    loading,
    error,
    hasReservation: status.hasReservation,
    booking: status.booking
  }
}

