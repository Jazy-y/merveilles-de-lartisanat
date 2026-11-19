'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Edit, Trash2, Upload, Link as LinkIcon, Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DragDropUpload } from '@/components/ui/drag-drop-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Workshop {
  id: string;
  title: string;
  description: string;
  location: string;
  schedule: string;
  hours: string;
  duration: string;
  price: number;
  images: string[];
  videos: string[];
  category: string;
  slots: number;
  availableSlots: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  const [formData, setFormData] = useState<Workshop & { startDay: string; endDay: string; startTime: string; endTime: string }>({
    id: '',
    title: '',
    description: '',
    location: '',
    schedule: '',
    hours: '',
    duration: '1 journée',
    startDay: '',
    endDay: '',
    startTime: '',
    endTime: '',
    price: 0,
    images: [''],
    videos: [],
    category: '',
    slots: 10,
    availableSlots: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const [imageUploads, setImageUploads] = useState<{ [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }>({})
  const [videoUploads, setVideoUploads] = useState<{ [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }>({})
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load workshops
        const workshopsRes = await fetch('/api/workshops');
        if (workshopsRes.ok) {
          const workshopsData = await workshopsRes.json();
          setWorkshops(workshopsData.workshops);
        }
        
        // Load categories
        const categoriesRes = await fetch('/api/workshop-categories');
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

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      location: '',
      schedule: '',
      hours: '',
      duration: '1 journée',
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
      price: 0,
      images: [''],
      videos: [],
      category: '',
      slots: 10,
      availableSlots: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    setImageUploads({})
    setVideoUploads({})
    setUploadMode('url')
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value } as Workshop & { startDay: string; endDay: string; startTime: string; endTime: string })
  }

  const handleFileSelect = async (file: File, index: number) => {
    const preview = URL.createObjectURL(file)
    
    setImageUploads(prev => ({
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
        if (process.env.NODE_ENV === 'development') console.error('Upload failed:', errorData);
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || 'Upload failed',
            progress: 0
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
          error: error instanceof Error ? error.message : 'Upload failed',
          progress: 0
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
            error: errorData.error || 'Upload failed',
            progress: 0
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
          error: error instanceof Error ? error.message : 'Upload failed',
          progress: 0
        }
      }))
    }
  }

  const handleFileRemove = (index: number) => {
    if (imageUploads[index]?.preview) {
      URL.revokeObjectURL(imageUploads[index].preview)
    }
    
    setImageUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[index];
      return newUploads;
    })
    
    // Clear the image URL in the form data
    const newImages = [...formData.images];
    newImages[index] = '';
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

  const addImageField = () => {
    const newIndex = formData.images.length;
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
    setImageUploads(prev => ({
      ...prev,
      [newIndex]: {
        file: null,
        preview: null,
        uploading: false,
        error: null,
        progress: 100
      }
    }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    
    // Clean up upload state
    handleFileRemove(index)
    
    // Reindex remaining uploads
    setImageUploads(prev => {
      const newUploads: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } } = {}
      Object.keys(prev).forEach(key => {
        const idx = parseInt(key)
        if (idx < index) {
          newUploads[idx] = prev[idx]
        } else if (idx > index) {
          newUploads[idx - 1] = prev[idx]
        }
      })
      return newUploads
    })
  }

  const handleAddWorkshop = async () => {
    try {
      // Combine day and time fields into schedule and hours
      const workshopData = {
        ...formData,
        schedule: formData.startDay && formData.endDay ? `${formData.startDay} à ${formData.endDay}` : formData.schedule,
        hours: formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : formData.hours
      }
      
      // Remove the temporary fields
      const { startDay, endDay, startTime, endTime, ...finalData } = workshopData

      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkshops([...workshops, data.workshop]);
        setIsAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding workshop:', error)
    }
  }

  const handleUpdateWorkshop = async () => {
    if (!selectedWorkshop?.id) return
    
    try {
      const res = await fetch(`/api/workshops/${selectedWorkshop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkshops(workshops.map(w => 
          w.id === selectedWorkshop.id 
            ? data.workshop
            : w
        ))
        setIsEditDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating workshop:', error)
    }
  }

  const handleDelete = async (workshopId: string) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      setDeleting(workshopId)
      try {
        const res = await fetch(`/api/workshops/${workshopId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setWorkshops(workshops.filter(w => w.id !== workshopId))
          setIsDeleteDialogOpen(false)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting workshop:', error)
      } finally {
        setDeleting(null)
      }
    }
  }

  const openEditDialog = (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    setFormData({
      ...workshop,
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: ''
    })
    
    // Set up video uploads state for existing videos
    const existingVideos = (workshop as any).videos || []
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
    
    setIsEditDialogOpen(true)
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
              Gérer les Ateliers
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Ajouter, modifier ou supprimer des ateliers.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Ajouter un Atelier
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter un Nouvel Atelier</DialogTitle>
                </DialogHeader>
                <WorkshopForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddWorkshop}
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
                    addImageField={addImageField}
                    removeImageField={removeImageField}
                    uploadMode={uploadMode}
                    setUploadMode={setUploadMode}
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
                {workshops.map((workshop) => (
                  <div key={workshop.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {(() => {
                          const imageUrl = (workshop as any).images?.[0]
                          
                          if (imageUrl && imageUrl.trim() !== '') {
                            return (
                              <>
                                <Image
                                  src={imageUrl}
                                  alt={workshop.title}
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
                                    <span className="text-xs">Image failed to load</span>
                                  </div>
                                </div>
                              </>
                            )
                          } else {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-center text-gray-500">
                                  <span className="text-xs">No image</span>
                                </div>
                              </div>
                            )
                          }
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base break-words">{workshop.title}</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{workshop.category} | {workshop.schedule} | {workshop.location}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{workshop.availableSlots} places disponibles</Badge>
                          <Badge variant="secondary" className="text-xs">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(workshop.price)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(workshop)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                        setSelectedWorkshop(workshop)
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
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Modifier l'Atelier</DialogTitle>
                </DialogHeader>
                <WorkshopForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdateWorkshop}
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
                    addImageField={addImageField}
                    removeImageField={removeImageField}
                    uploadMode={uploadMode}
                    setUploadMode={setUploadMode}
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
              <DialogTitle>Delete Workshop</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete &quot;{selectedWorkshop?.title}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedWorkshop?.id && handleDelete(selectedWorkshop.id)}
                disabled={deleting === selectedWorkshop?.id}
              >
                {deleting === selectedWorkshop?.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </main>
  )
}

function WorkshopForm({ 
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
    addImageField,
    removeImageField,
    uploadMode,
    setUploadMode,
    categories,
    newCategoryName,
    setNewCategoryName,
    showAddCategory,
    setShowAddCategory,
    onAddCategory
  }: {
    formData: Workshop & { startDay: string; endDay: string; startTime: string; endTime: string }
    setFormData: (data: Workshop & { startDay: string; endDay: string; startTime: string; endTime: string }) => void
    onSubmit: () => void
    onCancel: () => void
    imageUploads: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }
    setImageUploads: (uploads: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }) => void
    onFileSelect: (file: File, index: number) => void
    onFileRemove: (index: number) => void
    onImageEdit: (editedImageBlob: Blob, index: number) => void
    videoUploads: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }
    setVideoUploads: (uploads: { [key: number]: { file: File | null; preview: string | null; uploading: boolean; error: string | null; progress: number; } }) => void
    onVideoSelect: (index: number, file: File) => void
    onVideoRemove: (index: number) => void
    addImageField: () => void
    removeImageField: (index: number) => void
    uploadMode: 'url' | 'file'
    setUploadMode: (mode: 'url' | 'file') => void
    categories: Category[]
    newCategoryName: string
    setNewCategoryName: (name: string) => void
    showAddCategory: boolean
    setShowAddCategory: (show: boolean) => void
    onAddCategory: () => void
  }) {

    const handleChange = (field: string, value: string | number) => {
      setFormData({ ...formData, [field]: value } as Workshop & { startDay: string; endDay: string; startTime: string; endTime: string })
    }

    const handleImageChange = (value: string, index: number) => {
      const newImages = [...formData.images];
      newImages[index] = value;
      setFormData({ ...formData, images: newImages });
    }
  
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Titre de l'Atelier</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Entrez le titre de l'atelier"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={formData.category || ''} onValueChange={(value) => handleChange('category', value)}>
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
              Add New Category
            </Button>
            {showAddCategory && (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Enter new category name"
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
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter workshop description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDay">Jour d'ouverture</Label>
            <Select value={formData.startDay || ''} onValueChange={(value) => handleChange('startDay', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ex: Lundi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lundi">Lundi</SelectItem>
                <SelectItem value="Mardi">Mardi</SelectItem>
                <SelectItem value="Mercredi">Mercredi</SelectItem>
                <SelectItem value="Jeudi">Jeudi</SelectItem>
                <SelectItem value="Vendredi">Vendredi</SelectItem>
                <SelectItem value="Samedi">Samedi</SelectItem>
                <SelectItem value="Dimanche">Dimanche</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="endDay">Jour de fermeture</Label>
            <Select value={formData.endDay || ''} onValueChange={(value) => handleChange('endDay', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ex: Vendredi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lundi">Lundi</SelectItem>
                <SelectItem value="Mardi">Mardi</SelectItem>
                <SelectItem value="Mercredi">Mercredi</SelectItem>
                <SelectItem value="Jeudi">Jeudi</SelectItem>
                <SelectItem value="Vendredi">Vendredi</SelectItem>
                <SelectItem value="Samedi">Samedi</SelectItem>
                <SelectItem value="Dimanche">Dimanche</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startTime">Heure d'ouverture</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              placeholder="Ex: 09:00"
            />
          </div>
          <div>
            <Label htmlFor="endTime">Heure de fermeture</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime || ''}
              onChange={(e) => handleChange('endTime', e.target.value)}
              placeholder="Ex: 17:00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Entrez le lieu de l'atelier"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price (TND)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || 0}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="slots">Total Slots</Label>
            <Input
              id="slots"
              type="number"
              value={formData.slots || 0}
              onChange={(e) => handleChange('slots', parseInt(e.target.value) || 0)}
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="availableSlots">Available Slots</Label>
            <Input
              id="availableSlots"
              type="number"
              value={formData.availableSlots || 0}
              onChange={(e) => handleChange('availableSlots', parseInt(e.target.value) || 0)}
              placeholder="10"
            />
          </div>
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
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-1">
                  {uploadMode === 'url' ? (
                    <div className="space-y-2">
                      <Input
                        value={image}
                        onChange={(e) => handleImageChange(e.target.value, index)}
                        placeholder="Entrez l'URL de l'image"
                      />
                      {image && image.startsWith('http') && (
                        <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          <Image 
                            src={image} 
                            alt={`Aperçu ${index + 1}`} 
                            width={128} 
                            height={96} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/api/placeholder/128/96'
                            }}
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <DragDropUpload
                      onFileSelect={(file) => onFileSelect(file, index)}
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
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                    className="mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
              Add Image
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
                      Remove
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
              Add Video
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!formData.title.trim() || !formData.category.trim()}
          >
            Save Workshop
          </Button>
        </div>
        
        {(!formData.title.trim() || !formData.category.trim()) && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Veuillez compléter tous les champs requis :</p>
            <ul className="list-disc list-inside space-y-1">
              {!formData.title.trim() && <li>Le titre de l'atelier est requis</li>}
              {!formData.category.trim() && <li>La sélection d'une catégorie est requise</li>}
            </ul>
          </div>
        )}
      </div>
    )
  }