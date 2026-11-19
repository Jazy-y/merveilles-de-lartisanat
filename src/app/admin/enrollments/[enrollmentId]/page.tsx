'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCSRFHeaders } from '@/lib/csrf-client'
import { BookOpen, User, DollarSign, Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

export default function AdminEnrollmentDetailsPage() {
  const [enrollment, setEnrollment] = useState<TrainingEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { enrollmentId } = useParams()

  useEffect(() => {
    const loadEnrollment = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/training-enrollments/${enrollmentId}`, {
          method: 'GET',
          headers: await createCSRFHeaders(),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch enrollment')
        }
        
        const enrollmentData = await response.json()
        setEnrollment(enrollmentData)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading enrollment:', error)
      } finally {
        setLoading(false)
      }
    }

    if (enrollmentId) {
      loadEnrollment()
    }
  }, [enrollmentId])

  const handleStatusUpdate = async (newStatus: TrainingEnrollment['status']) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/training-enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: await createCSRFHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update enrollment status')
      }
      
      const updatedEnrollment = await response.json()
      setEnrollment(updatedEnrollment)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating enrollment status:', error)
      alert('Failed to update enrollment status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: TrainingEnrollment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: TrainingEnrollment['status']) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!enrollment) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enrollment not found</h3>
            <p className="text-gray-600 mb-4">The enrollment you're looking for doesn't exist.</p>
            <Link href="/admin/enrollments">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Enrollments
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/enrollments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enrollment Details</h1>
              <p className="text-gray-600">Training enrollment #{enrollment.id.slice(-8)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(enrollment.status)} flex items-center space-x-1`}>
              {getStatusIcon(enrollment.status)}
              <span className="capitalize">{enrollment.status}</span>
            </Badge>
            
            <Select
              value={enrollment.status}
              onValueChange={handleStatusUpdate}
              disabled={updating}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Training Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Informations sur la Formation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{enrollment.training.title}</h3>
                <p className="text-gray-600 mt-1">{enrollment.training.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(enrollment.training.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(enrollment.training.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{enrollment.training.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Format</p>
                    <p className="font-medium">{enrollment.training.format}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">{enrollment.training.level}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{enrollment.training.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Informations Utilisateur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {enrollment.participantName || enrollment.user.name || 'No name provided'}
                </h3>
                <p className="text-gray-600">{enrollment.participantEmail || enrollment.user.email}</p>
                {enrollment.participantPhone && (
                  <p className="text-gray-600 text-sm mt-1">📞 {enrollment.participantPhone}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm">{enrollment.user.id}</p>
                </div>
                
                {enrollment.selectedDate && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Start Date</p>
                    <p className="font-medium">
                      {new Date(enrollment.selectedDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p className="font-medium">
                    {new Date(enrollment.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(enrollment.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Number of Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollment.slots}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Price per Slot</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Intl.NumberFormat('fr-TN', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(enrollment.training.price)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('fr-TN', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(enrollment.totalPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {enrollment.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Additional Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{enrollment.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
