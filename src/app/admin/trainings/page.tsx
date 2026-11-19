'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, Upload, Link as LinkIcon, Plus, X, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DragDropUpload } from '@/components/ui/drag-drop-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import Image from 'next/image'

interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  format: string;
  level: string;
  price: number;
  images: string[];
  category: string;
  startDate?: string;
  endDate?: string;
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  const [formData, setFormData] = useState<Omit<Training, 'id'> & { videos: string[] }>({
    title: '',
    description: '',
    duration: '',
    format: 'Online',
    level: 'Beginner',
    price: 0,
    images: [],
    videos: [],
    category: '',
    startDate: '',
    endDate: ''
  })

  const [imageUploads, setImageUploads] = useState<{
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
    }
  }>({
    0: {
      file: null,
      preview: null,
      uploading: false,
      error: null
    }
  })

  const [videoUploads, setVideoUploads] = useState<{
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
      progress: number
    }
  }>({
    0: {
      file: null,
      preview: null,
      uploading: false,
      error: null,
      progress: 0
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load trainings
        const trainingsRes = await fetch('/api/trainings');
        if (trainingsRes.ok) {
          const trainingsData = await trainingsRes.json();
          setTrainings(trainingsData.trainings);
        }
        
        // Load categories
        const categoriesRes = await fetch('/api/training-categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    // Check if category already exists (case-insensitive)
    const categoryExists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    )
    
    if (categoryExists) {
      alert('Cette catégorie existe déjà! Veuillez choisir un nom différent.')
      return
    }
    
    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: ''
      }
      
      setCategories([...categories, newCategory])
      setFormData(prev => ({ ...prev, category: newCategory.name }))
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding category:', error)
    }
  }

  const handleFileSelect = async (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    
    setImageUploads(prev => ({
      ...prev,
      [index]: {
        file,
        preview,
        uploading: true,
        error: null
      }
    }))

    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        const newImages = [...formData.images];
        newImages[index] = data.filePaths[0];
        setFormData(prev => ({ ...prev, images: newImages }));
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: null
          }
        }))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        if (process.env.NODE_ENV === 'development') console.error('Upload failed:', errorData);
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || 'Upload failed'
          }
        }))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Upload error:', error);
      setImageUploads(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }))
    }
  }

  const handleImageEdit = async (editedImageBlob: Blob, index: number) => {
    // Convert blob to file
    const file = new File([editedImageBlob], 'edited-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    // Clean up the old preview URL if it exists
    const oldUpload = imageUploads[index]
    if (oldUpload?.preview && oldUpload.preview.startsWith('blob:')) {
      URL.revokeObjectURL(oldUpload.preview)
    }

    // Update preview immediately with the new blob
    const preview = URL.createObjectURL(editedImageBlob)
    setImageUploads(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        file,
        preview,
        uploading: true,
        error: null
      }
    }))

    // Upload the edited image
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update the specific image in the array
        const newImages = [...formData.images];
        newImages[index] = data.filePaths[0];
        setFormData(prev => ({ ...prev, images: newImages }));
        
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: null
          }
        }))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        if (process.env.NODE_ENV === 'development') console.error('Edited image upload failed:', errorData);
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || 'Upload failed'
          }
        }))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Edited image upload error:', error);
      setImageUploads(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }))
    }
  }

  const handleFileRemove = (index: number) => {
    const upload = imageUploads[index]
    if (upload?.preview) {
      URL.revokeObjectURL(upload.preview)
    }
    
    const newUploads = { ...imageUploads }
    delete newUploads[index]
    setImageUploads(newUploads)
    
    // Clear the image URL as well
    const newImages = [...formData.images]
    newImages[index] = ''
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleVideoSelect = async (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    
    setVideoUploads(prev => ({
      ...prev,
      [index]: {
        file,
        preview,
        uploading: true,
        error: null,
        progress: 0
      }
    }))

    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setVideoUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            progress: Math.min(prev[index].progress + Math.random() * 30, 90)
          }
        }))
      }, 200)

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(progressInterval)

      if (res.ok) {
        const data = await res.json();
        
        // Complete the progress bar
        setVideoUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            progress: 100
          }
        }))

        // Store video URLs in the videos array
        const newVideos = [...formData.videos];
        newVideos[index] = data.filePaths[0];
        setFormData(prev => ({ ...prev, videos: newVideos }));
        
        // Update preview with server URL
        setVideoUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            preview: data.filePaths[0], // Use server URL for preview
            uploading: false,
            error: null,
            progress: 0
          }
        }))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        if (process.env.NODE_ENV === 'development') console.error('Video upload failed:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        setVideoUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || `Video upload failed (${res.status})`,
            progress: 0
          }
        }))
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Video upload error:', error);
      setVideoUploads(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          uploading: false,
          error: error instanceof Error ? error.message : 'Video upload failed',
          progress: 0
        }
      }))
    }
  }

  const handleVideoRemove = (index: number) => {
    const upload = videoUploads[index]
    if (upload?.preview) {
      URL.revokeObjectURL(upload.preview)
    }
    
    const newUploads = { ...videoUploads }
    delete newUploads[index]
    setVideoUploads(newUploads)
    
    // Clear the video URL as well
    const newVideos = [...formData.videos]
    newVideos[index] = ''
    setFormData(prev => ({ ...prev, videos: newVideos }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      format: 'Online',
      level: 'Beginner',
      price: 0,
      images: [],
      videos: [],
      category: '',
      startDate: '',
      endDate: ''
    } as Omit<Training, 'id'> & { videos: string[] })
    setImageUploads({})
    setVideoUploads({})
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const handleAddTraining = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
        alert('Please fill in all required fields (title, description, category)');
        return;
      }
      
      // Use the images from formData.images (already uploaded via handleFileSelect)
      let finalImageUrls = formData.images.filter(url => url && url.trim() !== '')

      // Ensure at least one image
      if (finalImageUrls.length === 0) {
        finalImageUrls = ['/api/placeholder/400/300']
      }

      const trainingData = {
        ...formData,
        images: finalImageUrls
      }

      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (res.ok) {
        const data = await res.json();
        setTrainings([...trainings, data.training]);
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        const responseText = await res.text();
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') console.error('Failed to parse error response:', parseError);
          errorData = { error: responseText || 'Unknown error' };
        }
        
        if (process.env.NODE_ENV === 'development') console.error('Failed to create training:', errorData);
        alert('Failed to create training: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding training:', error)
      alert('Error creating training: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  const handleUpdateTraining = async () => {
    if (!selectedTraining?.id) return
    
    try {
      const trainingData = {
        ...formData
      }

      const res = await fetch(`/api/trainings/${selectedTraining.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (res.ok) {
        const data = await res.json();
        setTrainings(trainings.map(t => 
          t.id === selectedTraining.id 
            ? data.training
            : t
        ))
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        const responseText = await res.text();
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') console.error('Failed to parse update error response:', parseError);
          errorData = { error: responseText || 'Unknown error' };
        }
        
        if (process.env.NODE_ENV === 'development') console.error('Failed to update training:', errorData);
        alert('Failed to update training: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating training:', error)
      alert('Error updating training: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  const handleDelete = async (trainingId: string) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      setDeleting(trainingId)
      try {
        const res = await fetch(`/api/trainings/${trainingId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setTrainings(trainings.filter(t => t.id !== trainingId))
          setIsDeleteDialogOpen(false)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting training:', error)
      } finally {
        setDeleting(null)
      }
    }
  }

  const openEditDialog = (training: Training) => {
    setSelectedTraining(training)
    setFormData({
      title: training.title,
      description: training.description,
      duration: training.duration,
      format: training.format,
      level: training.level,
      price: training.price,
      images: training.images || [],
      videos: (training as any).videos || [],
      category: training.category,
      startDate: training.startDate || '',
      endDate: training.endDate || ''
    } as Omit<Training, 'id'> & { videos: string[] })
    
    // Set up video uploads state for existing videos
    const existingVideos = (training as any).videos || []
    const videoUploadsState: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } } = {}
    existingVideos.forEach((videoUrl: string, index: number) => {
      if (videoUrl) {
        videoUploadsState[index] = {
          file: null,
          preview: videoUrl,
          uploading: false,
          error: null,
          progress: 0
        }
      }
    })
    setVideoUploads(videoUploadsState)
    
    // Reset image states for edit
    setImageUploads({})
    setIsEditDialogOpen(true)
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
              Gérer les Formations
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Ajouter, modifier ou supprimer des programmes de formation.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Ajouter une Formation
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter une Nouvelle Formation</DialogTitle>
                </DialogHeader>
                <TrainingForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddTraining}
                    onCancel={() => setIsAddDialogOpen(false)}
                    imageUploads={imageUploads}
                    setImageUploads={setImageUploads}
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    onImageEdit={handleImageEdit}
                    videoUploads={videoUploads}
                    setVideoUploads={setVideoUploads}
                    onVideoSelect={handleVideoSelect}
                    onVideoRemove={handleVideoRemove}
                    categories={categories}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    showAddCategory={showAddCategory}
                    setShowAddCategory={setShowAddCategory}
                    onAddCategory={handleAddCategory}
                />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <p className="text-sm sm:text-base">Chargement...</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {trainings.map((training) => (
                  <div key={training.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {(() => {
                          const imageUrl = (training as any).images?.[0]
                          
                          if (imageUrl && imageUrl.trim() !== '') {
                            return (
                              <>
                                <Image
                                  src={imageUrl}
                                  alt={training.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    if (process.env.NODE_ENV === 'development') console.error('Image failed to load:', imageUrl, 'Error:', e)
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    // Show fallback
                                    const fallback = target.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                  unoptimized
                                />
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 hidden">
                                  <div className="text-center text-gray-500">
                                    <span className="text-xs">Échec du chargement de l&apos;image</span>
                                  </div>
                                </div>
                              </>
                            )
                          } else {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-center text-gray-500">
                                  <span className="text-xs">Aucune image</span>
                                </div>
                              </div>
                            )
                          }
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base break-words">{training.title}</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{training.category} | {training.level} | {training.duration}</p>
                        <p className="text-xs text-gray-500">
                          {(training as any).images?.length || 0} image(s) • {training.price > 0 ? `${new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(training.price)}` : 'Gratuit'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(training)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => {
                        setSelectedTraining(training)
                        setIsDeleteDialogOpen(true)
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Modifier la Formation</DialogTitle>
                </DialogHeader>
                <TrainingForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdateTraining}
                    onCancel={() => setIsEditDialogOpen(false)}
                    imageUploads={imageUploads}
                    setImageUploads={setImageUploads}
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    onImageEdit={handleImageEdit}
                    videoUploads={videoUploads}
                    setVideoUploads={setVideoUploads}
                    onVideoSelect={handleVideoSelect}
                    onVideoRemove={handleVideoRemove}
                    categories={categories}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    showAddCategory={showAddCategory}
                    setShowAddCategory={setShowAddCategory}
                    onAddCategory={handleAddCategory}
                />
            </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer la Formation</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer &quot;{selectedTraining?.title}&quot; ? Cette action ne peut pas être annulée.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedTraining?.id && handleDelete(selectedTraining.id)}
                disabled={deleting === selectedTraining?.id}
              >
                {deleting === selectedTraining?.id ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </main>
  )
}

// Training Form Component - Exact copy of ProductForm structure
function TrainingForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel,
  imageUploads,
  setImageUploads,
  onFileSelect,
  onFileRemove,
  onImageEdit,
  videoUploads,
  setVideoUploads,
  onVideoSelect,
  onVideoRemove,
  categories,
  newCategoryName,
  setNewCategoryName,
  showAddCategory,
  setShowAddCategory,
  onAddCategory
}: {
  formData: Omit<Training, 'id'> & { videos: string[] }
  setFormData: (data: Omit<Training, 'id'> & { videos: string[] }) => void
  onSubmit: () => void
  onCancel: () => void
  imageUploads: {
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
    }
  }
  setImageUploads: (uploads: {
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
    }
  }) => void
  onFileSelect: (index: number, file: File) => void
  onFileRemove: (index: number) => void
  onImageEdit: (editedImageBlob: Blob, index: number) => void
  videoUploads: {
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
      progress: number
    }
  }
  setVideoUploads: (uploads: {
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
      progress: number
    }
  }) => void
  onVideoSelect: (index: number, file: File) => void
  onVideoRemove: (index: number) => void
  categories: Category[]
  newCategoryName: string
  setNewCategoryName: (name: string) => void
  showAddCategory: boolean
  setShowAddCategory: (show: boolean) => void
  onAddCategory: () => void
}) {
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData({ ...formData, [field]: value } as Omit<Training, 'id'> & { videos: string[] })
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    const newIndex = formData.images.length
    setFormData({ ...formData, images: [...formData.images, ''] })
    setImageUploads({
      ...imageUploads,
      [newIndex]: {
        file: null,
        preview: null,
        uploading: false,
        error: null
      }
    })
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    
    // Clean up upload state
    onFileRemove(index)
  }

  const handleDateChange = (field: string, value: string) => {
    const newForm = { ...formData, [field]: value } as Omit<Training, 'id'> & { videos: string[] }
    
    // Calculate duration if both dates are set
    if (newForm.startDate && newForm.endDate) {
      const startDate = new Date(newForm.startDate)
      const endDate = new Date(newForm.endDate)
      
      // Ensure end date is after start date
      if (endDate >= startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        newForm.duration = diffDays.toString()
      } else {
        newForm.duration = ''
      }
    }
    
    setFormData(newForm)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titre de la Formation</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Entrez le titre de la formation"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="mt-2 w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Nouvelle Catégorie
          </Button>
          {showAddCategory && (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Entrez le nom de la nouvelle catégorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Ajouter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddCategory(false)
                    setNewCategoryName('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Entrez la description de la formation"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de Début</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de Fin</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duration">Durée (Jours)</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="Calculé automatiquement"
            readOnly
            className="bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="price">Prix (DT)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="format">Format</Label>
          <Select value={formData.format} onValueChange={(value) => handleChange('format', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">En ligne</SelectItem>
              <SelectItem value="Hybrid">Hybride</SelectItem>
              <SelectItem value="In-person">En personne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="level">Niveau</Label>
        <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Débutant</SelectItem>
            <SelectItem value="Intermediate">Intermédiaire</SelectItem>
            <SelectItem value="Advanced">Avancé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Images</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              URL
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
            >
              <Upload className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {formData.images.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Aucune image ajoutée</p>
              <p className="text-sm text-gray-500">Ajoutez au moins une image pour créer la formation</p>
            </div>
          )}
          
          {formData.images.map((image, index) => (
            <div key={index} className="space-y-2 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Image {index + 1}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImageField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Retirer
                </Button>
              </div>
              
              {uploadMode === 'url' ? (
                <div className="space-y-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Image URL"
                  />
                  {image && (
                    <div className="relative border rounded-lg p-2">
                      <img
                        src={image}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <DragDropUpload
                  onFileSelect={(file) => onFileSelect(index, file)}
                  onRemove={() => onFileRemove(index)}
                  onImageEdit={(editedImageBlob) => onImageEdit(editedImageBlob, index)}
                  preview={imageUploads[index]?.preview || (image && image.trim() !== '' ? image : null)}
                  loading={imageUploads[index]?.uploading || false}
                  error={imageUploads[index]?.error || null}
                  className="w-full"
                  enableEditing={true}
                  aspectRatio={16/9}
                  cropShape="rect"
                />
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Image
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Videos</Label>
        </div>
        
        <div className="space-y-4">
          {Object.keys(videoUploads).map((key) => {
            const index = parseInt(key)
            return (
              <div key={index} className="space-y-2 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Video {index + 1}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onVideoRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Retirer
                  </Button>
                </div>
                
                <VideoUpload
                  onFileSelect={(file) => onVideoSelect(index, file)}
                  onRemove={() => onVideoRemove(index)}
                  preview={videoUploads[index]?.preview || null}
                  loading={videoUploads[index]?.uploading || false}
                  error={videoUploads[index]?.error || null}
                  uploadProgress={videoUploads[index]?.progress || 0}
                  className="w-full"
                />
              </div>
            )
          })}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newIndex = Object.keys(videoUploads).length
              const newVideoUploads = { ...videoUploads }
              newVideoUploads[newIndex] = {
                file: null,
                preview: null,
                uploading: false,
                error: null,
                progress: 0
              }
              setVideoUploads(newVideoUploads)
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Vidéo
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!formData.title.trim() || !formData.category.trim() || formData.images.length === 0}
        >
          Enregistrer la Formation
        </Button>
      </div>
      
      {(!formData.title.trim() || !formData.category.trim() || formData.images.length === 0) && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Veuillez remplir tous les champs requis :</p>
          <ul className="list-disc list-inside space-y-1">
            {!formData.title.trim() && <li>Le titre de la formation est requis</li>}
            {!formData.category.trim() && <li>La sélection de la catégorie est requise</li>}
            {formData.images.length === 0 && <li>Au moins une image est requise</li>}
          </ul>
        </div>
      )}
    </div>
  )
}