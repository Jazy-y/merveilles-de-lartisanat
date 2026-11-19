'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Image as ImageIcon, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function NewTrainingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [useImageUrl, setUseImageUrl] = useState<boolean>(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [form, setForm] = useState<Omit<Training, 'id'> & { startDate: string; endDate: string; images: string[] }>({
    title: '',
    description: '',
    duration: '',
    format: 'Online',
    level: 'Beginner',
    price: 0,
    images: [],
    category: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/training-categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading training categories:', error)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => {
      const newForm = { ...prev, [name]: value }
      
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
      
      return newForm
    })
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    // Check if category already exists (case-insensitive)
    const categoryExists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    )
    
    if (categoryExists) {
      setError('Cette catégorie existe déjà! Veuillez choisir un nom différent.')
      return
    }
    
    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: ''
      }
      
      setCategories(prev => [...prev, newCategory])
      setForm(prev => ({ ...prev, category: newCategory.name }))
      setNewCategoryName('')
      setShowAddCategory(false)
      setError(null) // Clear any previous errors
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding category:', error)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const newFiles = [...imageFiles]
      newFiles[index] = file
      setImageFiles(newFiles)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPreviews = [...imagePreviews]
        newPreviews[index] = e.target?.result as string
        setImagePreviews(newPreviews)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (index: number, url: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = url
    setImageUrls(newUrls)
  }

  const addImageField = () => {
    setImageUrls(prev => [...prev, ''])
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    setImageUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let finalImageUrls: string[] = [];
      
      if (useImageUrl) {
        // Use URLs
        finalImageUrls = imageUrls.filter(url => url.trim() !== '')
      } else {
        // Upload files
        const formData = new FormData();
        for (const file of imageFiles) {
          if (file) {
            formData.append('files', file);
          }
        }

        if (formData.has('files')) {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            finalImageUrls = data.filePaths;
          } else {
            if (process.env.NODE_ENV === 'development') console.error('Image upload failed');
          }
        }
      }

      // Prepare training data with calculated duration and images
      const trainingData = {
        ...form,
        duration: form.duration || (form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : ''),
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
        router.push('/admin/trainings')
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add training');
      }
    } catch (err) {
      setError('Failed to add training. Please try again.')
      if (process.env.NODE_ENV === 'development') console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/trainings" className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-amber-600 mb-4 sm:mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Retour aux Formations
        </Link>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gradient mb-6 sm:mb-8">Ajouter une Nouvelle Formation</h1>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900">Détails de la Formation</h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Titre de la Formation</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Entrez le titre de la formation"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="Décrivez ce que les participants apprendront..."
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[120px]"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
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
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>
                {showAddCategory && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Entrez le nom de la nouvelle catégorie"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddCategory(false)
                          setNewCategoryName('')
                        }}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <h2 className="text-2xl font-display font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-amber-600" />
                Training Images
              </h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Image Input Options */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={!useImageUrl ? "default" : "outline"}
                      onClick={() => setUseImageUrl(false)}
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Télécharger des Fichiers
                    </Button>
                    <Button
                      type="button"
                      variant={useImageUrl ? "default" : "outline"}
                      onClick={() => setUseImageUrl(true)}
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Utiliser des URLs
                    </Button>
                  </div>

                  {imageUrls.every(url => !url.trim()) && imageFiles.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-amber-300 rounded-lg">
                      <Upload className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Aucune image ajoutée pour le moment</p>
                      <p className="text-sm text-gray-500">Ajoutez au moins une image pour créer la formation</p>
                    </div>
                  )}

                  {!useImageUrl ? (
                    <div className="space-y-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4 border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Image {index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700 border-red-300"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Retirer
                            </Button>
                          </div>
                          {imagePreviews[index] && (
                            <div className="relative">
                              <Image
                                src={imagePreviews[index]}
                                alt={`Aperçu de la formation ${index + 1}`}
                                width={400}
                                height={300}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                            className="mt-2"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFiles(prev => [...prev, null as any])
                          setImagePreviews(prev => [...prev, ''])
                        }}
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="border rounded-lg p-4 border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Image {index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700 border-red-300"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Retirer
                            </Button>
                          </div>
                          <Input
                            type="url"
                            placeholder="https://exemple.com/image.jpg"
                            value={url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            className="w-full border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          />
                          {url && (
                            <div className="relative mt-2">
                                                              <Image
                                                                src={url}
                                                                alt={`Aperçu de la formation ${index + 1}`}
                                                                width={400}
                                                                height={300}
                                                                className="w-full h-32 object-cover rounded-lg border"
                                                              />                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addImageField}
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une Image URL
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Settings */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900">Paramètres de la Formation</h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">Prix (TND)</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    value={form.price} 
                    onChange={handleChange} 
                    placeholder="0.00"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration (Days)</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    value={form.duration} 
                    onChange={handleChange} 
                    placeholder="Calculé automatiquement à partir des dates"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Date de Début</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    value={form.startDate} 
                    onChange={handleDateChange} 
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">Date de Fin</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    value={form.endDate} 
                    onChange={handleDateChange} 
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="format" className="text-sm font-medium text-gray-700">Format</Label>
                  <Select name="format" onValueChange={(value) => handleSelectChange('format', value)} defaultValue={form.format}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                      <SelectValue placeholder="Sélectionnez le format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="In-person">In-person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium text-gray-700">Level</Label>
                  <Select name="level" onValueChange={(value) => handleSelectChange('level', value)} defaultValue={form.level}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {(!form.title.trim() || !form.category.trim() || !form.description.trim() || !form.startDate || !form.endDate || (imageUrls.every(url => !url.trim()) && imageFiles.length === 0)) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-amber-800 font-medium mb-2">Veuillez compléter tous les champs requis :</p>
                <ul className="text-amber-700 text-sm list-disc list-inside space-y-1">
                  {!form.title.trim() && <li>Le titre de la formation est requis</li>}
                  {!form.category.trim() && <li>La sélection d'une catégorie est requise</li>}
                  {!form.description.trim() && <li>La description est requise</li>}
                  {!form.startDate && <li>La date de début est requise</li>}
                  {!form.endDate && <li>La date de fin est requise</li>}
                  {(imageUrls.every(url => !url.trim()) && imageFiles.length === 0) && <li>Au moins une image est requise</li>}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <Link href="/admin/trainings" className="w-full sm:w-auto">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 w-full sm:w-auto">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading || !form.title.trim() || !form.category.trim() || !form.description.trim() || !form.startDate || !form.endDate || (imageUrls.every(url => !url.trim()) && imageFiles.length === 0)}
              className="btn-luxury px-4 sm:px-8 w-full sm:w-auto"
            >
              {loading ? 'Création en cours...' : 'Créer la Formation'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
