'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClientOnly } from '@/components/ui/client-only'
import { ArrowLeft, Upload, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [useImageUrl, setUseImageUrl] = useState<boolean>(false)
  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { images: string[] }> ({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    featured: false,
    tags: [],
    images: [],
    status: 'active'
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          if (file) {
            const formData = new FormData();
            formData.append('files', file);

            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              finalImageUrls.push(data.filePaths[0]);
            } else {
              if (process.env.NODE_ENV === 'development') console.error('Image upload failed for file:', file.name);
            }
          }
        }
      }

      // Ensure at least one image
      if (finalImageUrls.length === 0) {
        finalImageUrls = ['/api/placeholder/400/300']
      }

      const productData = {
        ...form,
        images: finalImageUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (res.ok) {

        router.push('/admin/products')
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add product');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('❌ Product creation failed:', err)
      setError(`Failed to add product: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/products" className="inline-flex items-center text-gray-600 hover:text-amber-600 mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Products
        </Link>

        <h1 className="text-4xl font-display font-bold text-gradient mb-8">Add New Product</h1>

        <ClientOnly fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-gray-600">Loading form...</span>
          </div>
        }>
          <form onSubmit={handleSubmit}>
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <h2 className="text-xl font-display font-semibold text-gray-900">Product Information</h2>
              <p className="text-gray-600 text-sm">Fill in the details below to add a new product</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea id="description" name="description" value={form.description} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="price">Price</label>
                  <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock">Stock</label>
                  <Input id="stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category">Category</label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>
                {showAddCategory && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter new category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
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
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={form.featured}
                    onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Featured Product (Show on Homepage)
                  </label>
                </div>
                <p className="text-xs text-gray-500">Check this box to display this product on the homepage</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Product Images
                </label>
                
                {/* Image Input Options */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={!useImageUrl ? "default" : "outline"}
                      onClick={() => setUseImageUrl(false)}
                      className="flex-1"
                    >
                      Upload Files
                    </Button>
                    <Button
                      type="button"
                      variant={useImageUrl ? "default" : "outline"}
                      onClick={() => setUseImageUrl(true)}
                      className="flex-1"
                    >
                      Use URLs
                    </Button>
                  </div>

                  {imageUrls.length === 0 && imageFiles.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No images added yet</p>
                      <p className="text-sm text-gray-500">Add at least one image to create the product</p>
                    </div>
                  )}

                  {!useImageUrl ? (
                    <div className="space-y-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Image {index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          {imagePreviews[index] && (
                            <div className="relative">
                              <Image
                                src={imagePreviews[index]}
                                alt={`Product preview ${index + 1}`}
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
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Image {index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <Input
                            type="url"
                            placeholder="https://i.imgur.com/example.jpg"
                            value={url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            className="w-full"
                          />
                          {url && (
                            <div className="relative mt-2">
                              <Image
                                src={url}
                                alt={`Product preview ${index + 1}`}
                                width={400}
                                height={300}
                                className="w-full h-32 object-cover rounded-lg border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/api/placeholder/400/300'
                                  target.alt = 'Image failed to load - using placeholder'
                                }}
                              />
                            </div>
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
                        Add Image URL
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {(!form.name.trim() || !form.category.trim() || (imageUrls.length === 0 && imageFiles.length === 0) || form.price <= 0) && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Please complete all required fields:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {!form.name.trim() && <li>Product name is required</li>}
                    {!form.category.trim() && <li>Category selection is required</li>}
                    {(imageUrls.length === 0 && imageFiles.length === 0) && <li>At least one image is required</li>}
                    {form.price <= 0 && <li>Price must be greater than 0</li>}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/admin/products')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !form.name.trim() || !form.category.trim() || (imageUrls.length === 0 && imageFiles.length === 0) || form.price <= 0} 
                  className="btn-luxury"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {imageFiles.length > 0 ? 'Uploading & Creating...' : 'Creating Product...'}
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        </ClientOnly>
      </div>
    </main>
  )
}