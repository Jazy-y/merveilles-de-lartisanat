'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCSRFHeaders } from '@/lib/csrf-client'

interface TrainingEnrollment {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
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
  training: {
    id: string
    title: string
    startDate: string
    endDate: string
    description: string
    duration: string
    format: string
    level: string
    category: string
    price: number
  }
}
import { BookOpen, User, DollarSign, Eye, CheckCircle, XCircle, Clock, Award } from 'lucide-react'
import Link from 'next/link'

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/training-enrollments', {
          method: 'GET',
          headers: await createCSRFHeaders(),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments')
        }
        
        const enrollmentsData = await response.json()
        setEnrollments(enrollmentsData)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading enrollments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEnrollments()
  }, [])

  const handleStatusUpdate = async (enrollmentId: string, newStatus: TrainingEnrollment['status']) => {
    try {
      const response = await fetch(`/api/training-enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: await createCSRFHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update enrollment status')
      }
      
      setEnrollments(enrollments.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, status: newStatus, updatedAt: new Date().toISOString() }
          : enrollment
      ))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating enrollment status:', error)
      alert('Failed to update enrollment status')
    }
  }

  const getStatusColor = (status: TrainingEnrollment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: TrainingEnrollment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <Award className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredEnrollments = filter === 'all' 
    ? enrollments 
    : enrollments.filter(enrollment => enrollment.status === filter)

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Training Enrollments</h1>
            <p className="text-gray-600">Manage all training enrollments</p>
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inscriptions aux Formations</h1>
            <p className="text-sm sm:text-base text-gray-600">Gérez toutes les inscriptions aux formations</p>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les inscriptions</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg break-words">
                    Inscription #{enrollment.id?.slice(-8).toUpperCase()}
                  </CardTitle>
                  <Badge className={`${getStatusColor(enrollment.status)} flex items-center gap-1 text-xs`}>
                    {getStatusIcon(enrollment.status)}
                    {enrollment.status === 'PENDING' ? 'En attente' : 
                     enrollment.status === 'CONFIRMED' ? 'Confirmé' :
                     enrollment.status === 'COMPLETED' ? 'Terminé' :
                     enrollment.status === 'CANCELLED' ? 'Annulé' : 'Inconnu'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{enrollment.participantName || enrollment.user?.name || 'Utilisateur inconnu'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <span className="mr-2">📧</span>
                    <span className="truncate break-all">{enrollment.participantEmail || enrollment.user?.email || 'Aucun email'}</span>
                  </div>
                  {enrollment.participantPhone && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                      <span className="mr-2">📞</span>
                      <span className="truncate">{enrollment.participantPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{enrollment.training?.title || 'Formation inconnue'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {enrollment.training?.startDate ? new Date(enrollment.training.startDate).toLocaleDateString('fr-FR') : 'Aucune date'}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <span className="mr-2">⏱️</span>
                    <span className="truncate">{enrollment.training?.duration || 'Durée inconnue'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 break-words">
                    <span className="mr-2">📚</span>
                    <span className="truncate">{enrollment.training?.level || 'Niveau inconnu'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    {new Intl.NumberFormat('fr-TN', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(enrollment.totalPrice)}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {enrollment.slots} place{enrollment.slots > 1 ? 's' : ''}
                  </div>
                  
                  {enrollment.notes && (
                    <div className="text-xs sm:text-sm text-gray-600 break-words">
                      <strong>Notes :</strong> {enrollment.notes}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t">
                    <Select
                      value={enrollment.status}
                      onValueChange={(value: TrainingEnrollment['status']) => 
                        handleStatusUpdate(enrollment.id!, value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Link href={`/admin/enrollments/${enrollment.id}`} className="w-full sm:w-auto">
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

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune inscription trouvée</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {filter === 'all' 
                ? 'Aucune inscription aux formations n\'a encore été effectuée.'
                : `Aucune inscription ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmée' : filter === 'completed' ? 'terminée' : 'annulée'} trouvée.`
              }
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
