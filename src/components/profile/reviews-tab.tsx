'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Edit, Trash2, Calendar, Package } from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: string;
  rating: number;
  comment: string;
  productName: string;
  createdAt: string;
  verified: boolean;
}

const StarRating = ({ rating, setRating, size = 'md' }: { rating: number, setRating?: (rating: number) => void, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => setRating?.(star)}
          className={`${sizeClasses[size]} ${star <= rating ? 'text-foreground fill-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground`}>
          <Star className={`${sizeClasses[size]} ${star <= rating ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  )
}

function EditReviewDialog({ review, onReviewUpdated }: { review: Review, onReviewUpdated: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ rating: review.rating, comment: review.comment })

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Avis mis à jour avec succès')
        onReviewUpdated()
        setIsOpen(false)
      } else {
        toast.error('Échec de la mise à jour de l\'avis')
      }
    } catch (error) {
      toast.error('Échec de la mise à jour de l\'avis')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Modifier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'avis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Note</Label>
            <StarRating rating={formData.rating} setRating={(rating) => setFormData({ ...formData, rating })} />
          </div>
          <div>
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            />
          </div>
          <Button onClick={handleUpdate}>Mettre à jour l'avis</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ReviewsTab() {
  const { data: session } = useSession()
  const user = session?.user
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    if (user) {
      setLoading(true)
      fetch('/api/reviews/my-reviews')
        .then(res => res.json())
        .then(data => {
          setReviews(data.reviews)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [user])

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId))
        toast.success('Avis supprimé avec succès')
      } else {
        toast.error('Échec de la suppression de l\'avis')
      }
    } catch (error) {
      toast.error('Échec de la suppression de l\'avis')
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
        <h2 className="text-2xl font-bold text-foreground font-display">Mes avis</h2>
        <Badge variant="outline" className="border-border text-foreground">
          {reviews.length} {reviews.length === 1 ? 'Avis' : 'Avis'}
        </Badge>
      </div>

      {reviews.length === 0 ? (
        <Card className="card-luxury border-2 border-dashed border-border bg-card">
          <CardContent className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-foreground fill-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 font-display">Vous n&apos;avez pas encore laissé d&apos;avis</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Partagez votre expérience avec d&apos;autres clients et aidez-les à découvrir nos merveilless artisanales !
            </p>
            <Link href="/products">
              <Button className="px-8 py-6 text-base">
                Explorer les articles
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="card-luxury hover:shadow-luxury-hover transition-all duration-300 bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  {/* Review Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-5 h-5 text-foreground" />
                          <h3 className="text-xl font-semibold text-foreground">{review.productName}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg border border-border">
                      <p className="text-foreground leading-relaxed">{review.comment}</p>
                    </div>

                    {review.verified && (
                      <Badge className="bg-primary/10 text-foreground border-border w-fit">
                        ✓ Achat vérifié
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                    <EditReviewDialog review={review} onReviewUpdated={fetchReviews} />
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteReview(review.id)}
                      className="border-border text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
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
