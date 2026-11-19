'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DragDropUpload } from '@/components/ui/drag-drop-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import { Plus, Edit, Trash2, Eye, Search, Package, Image as ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-react'
import Link from 'next/link'
import { createCSRFHeaders, createCSRFHeadersForUpload } from '@/lib/csrf-client'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] }>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    videos: [],
    stock: 0,
    featured: false,
    isActive: true
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
        
        // Load products
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products);
        }
        
        // Load categories
        const categoriesRes = await fetch('/api/categories');
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
        headers: await createCSRFHeadersForUpload(),
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
        if (process.env.NODE_ENV === 'development') console.error('Image upload failed with status:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
        if (process.env.NODE_ENV === 'development') console.error('Upload failed:', errorData);
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || `Upload failed (${res.status})`
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
        headers: await createCSRFHeadersForUpload(),
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
        if (process.env.NODE_ENV === 'development') console.error('Edited image upload failed with status:', res.status, res.statusText);
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
        if (process.env.NODE_ENV === 'development') console.error('Edited image upload failed:', errorData);
        setImageUploads(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            uploading: false,
            error: errorData.error || `Upload failed (${res.status})`
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
        headers: await createCSRFHeadersForUpload(),
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
        setFormData((prev: any) => ({ ...prev, videos: newVideos }));
        
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
    setFormData((prev: any) => ({ ...prev, videos: newVideos }))
  }

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: await createCSRFHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts([...products, data.product]);
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        const errorData = await res.json();
        if (process.env.NODE_ENV === 'development') console.error('Error adding product:', errorData.error || 'Unknown error');
        alert(`Erreur lors de l'ajout du produit : ${errorData.error || 'Veuillez vérifier tous les champs et réessayer'}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct?.id) return
    
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: await createCSRFHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(products.map(p => 
          p.id === selectedProduct.id 
            ? data.product
            : p
        ))
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        if (process.env.NODE_ENV === 'development') console.error('Error updating product');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeleting(productId)
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: await createCSRFHeaders(),
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId))
        setIsDeleteDialogOpen(false)
      } else {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting product');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error deleting product:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      // For now, we'll add it to the local state since we don't have a categories API endpoint
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: ''
      }
      
      setCategories(prev => [...prev, newCategory])
      setFormData((prev: any) => ({ ...prev, category: newCategory.name }))
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding category:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      videos: [],
      stock: 0,
      featured: false,
      isActive: true
    } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] })
    setImageUploads({})
    setVideoUploads({})
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      videos: (product as any).videos || [],
      stock: product.stock || 0,
      featured: product.featured || false,
      isActive: product.isActive !== undefined ? product.isActive : true
    } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] })
    
    // Set up video uploads state for existing videos
    const existingVideos = (product as any).videos || []
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '0,00 DT'
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
              Gestion des Produits
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Gérez votre catalogue de produits
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddProduct}
                onCancel={() => setIsAddDialogOpen(false)}
                imageUploads={imageUploads}
                setImageUploads={setImageUploads}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                onImageEdit={handleImageEdit}
                videoUploads={videoUploads}
                setVideoUploads={setVideoUploads as any}
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

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher des produits par nom, catégorie ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Essayez d\'ajuster vos critères de recherche.'
                      : 'Aucun produit n\'a encore été ajouté.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.images && product.images[0] && product.images[0].trim() !== '' ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-amber-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Stock : {product.stock || 0}</span>
                    <span>Créé le : {formatDate(product.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="flex-1 sm:flex-initial min-w-[100px]"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Modifier</span>
                      <span className="sm:hidden">Mod.</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="flex-1 sm:flex-initial min-w-[100px]"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Supprimer</span>
                      <span className="sm:hidden">Supp.</span>
                    </Button>
                    <Link href={`/products/${product.id}`} className="flex-1 sm:flex-initial">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto min-w-[100px]">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Modifier le Produit</DialogTitle>
            </DialogHeader>
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateProduct}
              onCancel={() => setIsEditDialogOpen(false)}
              imageUploads={imageUploads}
              setImageUploads={setImageUploads}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onImageEdit={handleImageEdit}
              videoUploads={videoUploads}
              setVideoUploads={setVideoUploads as any}
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

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le Produit</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer "{selectedProduct?.name}" ? Cette action est irréversible.
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
                onClick={() => selectedProduct?.id && handleDeleteProduct(selectedProduct.id)}
                disabled={deleting === selectedProduct?.id}
              >
                {deleting === selectedProduct?.id ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}

// Product Form Component
function ProductForm({ 
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
  formData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] }
  setFormData: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] }) => void
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
      progress?: number
    }
  }
  setVideoUploads: (uploads: {
    [key: number]: {
      file: File | null
      preview: string | null
      uploading: boolean
      error: string | null
      progress?: number
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
    setFormData({ ...formData, [field]: value } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { videos: string[] })
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    const newIndex = formData.images.length
    ;(setFormData as any)((prev: any) => ({ ...prev, images: [...prev.images, ''] }))
    ;(setImageUploads as any)((prev: any) => ({
      ...prev,
      [newIndex]: {
        file: null,
        preview: null,
        uploading: false,
        error: null
      }
    }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    ;(setFormData as any)((prev: any) => ({ ...prev, images: newImages }))
    
    // Clean up upload state
    onFileRemove(index)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du Produit</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Entrez le nom du produit"
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
            Ajouter une Catégorie
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
          placeholder="Entrez la description du produit"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix (TND)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
          <Label>Images</Label>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
              className="flex-1 sm:flex-initial"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              URL
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
              className="flex-1 sm:flex-initial"
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
              <p className="text-sm text-gray-500">Ajoutez au moins une image pour créer le produit</p>
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
                  Supprimer
                </Button>
              </div>
              
              {uploadMode === 'url' ? (
                <div className="space-y-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="URL de l'image"
                  />
                  {image && (
                    <div className="relative border rounded-lg p-2">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
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
                  aspectRatio={1}
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
                  <Label className="text-sm font-medium">Vidéo {index + 1}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onVideoRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Supprimer
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

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Produit Actif
          </Label>
        </div>
        <p className="text-xs text-gray-500">Décochez pour masquer ce produit aux clients</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <Label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Produit en Vedette (Afficher sur la Page d'Accueil)
          </Label>
        </div>
        <p className="text-xs text-gray-500">Cochez cette case pour afficher ce produit sur la page d'accueil</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!formData.name.trim() || !formData.category.trim() || formData.images.length === 0 || formData.price <= 0}
          className="w-full sm:w-auto"
        >
          Enregistrer le Produit
        </Button>
      </div>
      
      {(!formData.name.trim() || !formData.category.trim() || formData.images.length === 0 || formData.price <= 0) && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Veuillez compléter tous les champs requis :</p>
          <ul className="list-disc list-inside space-y-1">
            {!formData.name.trim() && <li>Le nom du produit est requis</li>}
            {!formData.category.trim() && <li>La sélection d'une catégorie est requise</li>}
            {formData.images.length === 0 && <li>Au moins une image est requise</li>}
            {formData.price <= 0 && <li>Le prix doit être supérieur à 0</li>}
          </ul>
        </div>
      )}
    </div>
  )
}