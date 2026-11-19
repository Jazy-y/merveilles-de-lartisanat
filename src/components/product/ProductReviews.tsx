'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, MessageSquare, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  })
  const [error, setError] = useState<string | null>(null)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          const reviewsData: Review[] = data.reviews;
          setReviews(reviewsData)
          setLoading(false)
          
          // Calculate review stats from real-time data
          if (reviewsData.length === 0) {
            setReviewStats({
              averageRating: 0,
              reviewCount: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            })
          } else {
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
            const averageRating = totalRating / reviewsData.length
            
            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            reviewsData.forEach(review => {
              ratingDistribution[review.rating as keyof typeof ratingDistribution]++
            })
            
            setReviewStats({
              averageRating: Math.round(averageRating * 10) / 10,
              reviewCount: reviewsData.length,
              ratingDistribution
            })
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching reviews:', error);
      }
    }

    fetchReviews();
  }, [productId])

  useEffect(() => {
    const checkUserReview = async () => {
      if (user && reviews.length > 0) {
        const userReview = reviews.find(review => review.userEmail === user.email);
        if (userReview) {
          setHasReviewed(true);
        }
      }
    }
    checkUserReview();
  }, [user, reviews]);

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (!rating || !comment.trim()) {
      setError('Please provide both a rating and a comment')
      return
    }

    if (hasReviewed) {
      setError('You have already reviewed this product')
      return
    }

    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        // Reset form
        setRating(0)
        setComment('')
        setHasReviewed(true)
        toast.success('Review submitted successfully!')
        // Refresh reviews
        window.location.reload()
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error submitting review:', error)
      setError('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = async (reviewId: string) => {
    if (!editRating || !editComment.trim()) {
      toast.error('Please provide both a rating and a comment')
      return
    }

    setSubmitting(true)
    
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      if (res.ok) {
        toast.success('Review updated successfully!')
        setEditingReviewId(null)
        // Refresh reviews
        window.location.reload()
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update review')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating review:', error)
      toast.error('Failed to update review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    setDeletingReviewId(reviewId)
    
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Review deleted successfully!')
        setHasReviewed(false)
        // Refresh reviews
        window.location.reload()
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete review')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const cancelEdit = () => {
    setEditingReviewId(null)
    setEditRating(0)
    setEditComment('')
  }

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? hoveredRating || rating : rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Reviews
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Reviews ({reviews.length})
        </h3>
        
        {user && !hasReviewed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Rating *</Label>
                  {renderStars(rating, true)}
                  <p className="text-sm text-gray-500">Click on a star to rate</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Your Review *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Tell others about your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !rating || !comment.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {user && hasReviewed && (
          <div className="flex items-center gap-2 text-green-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm">You&apos;ve reviewed this product</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Average Rating */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
              <div>
                {renderStars(reviewStats.averageRating)}
                <p className="text-sm text-gray-600 mt-1">
                  Based on {reviewStats.reviewCount} review{reviewStats.reviewCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {reviews.map((review) => {
              const isUserReview = user?.email === review.userEmail
              const isEditing = editingReviewId === review.id

              return (
                <div key={review.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{review.userName}</h4>
                          <p className="text-sm text-gray-500">{review.userEmail}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Rating</Label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= editRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                onClick={() => setEditRating(star)}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-comment" className="text-sm font-medium mb-2 block">Comment</Label>
                          <Textarea
                            id="edit-comment"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={submitting}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditReview(review.id)}
                          disabled={submitting || !editRating || !editComment.trim()}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            'Enregistrer'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{review.userName}</h4>
                          <p className="text-sm text-gray-500">{review.userEmail}</p>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      {isUserReview && (
                        <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditReview(review)}
                            disabled={deletingReviewId === review.id}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingReviewId === review.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Suppression...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}