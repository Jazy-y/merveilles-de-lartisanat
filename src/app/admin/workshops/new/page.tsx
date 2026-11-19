'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, MapPin, Clock, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Workshop {
  id: string;
  title: string;
  description: string;
  schedule: string;
  hours: string;
  location: string;
  duration: string;
  price: number;
  image: string;
  category: string;
}

export default function NewWorkshopPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Workshop, 'id'>>({
    title: '',
    description: '',
    schedule: 'Lundi à Vendredi',
    hours: '9h00 - 17h00',
    location: '',
    duration: '1 journée',
    price: 0,
    image: '/api/placeholder/400/300',
    category: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setForm(prev => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setForm(prev => ({ ...prev, image: '/api/placeholder/400/300' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openGoogleMaps = () => {
    const query = encodeURIComponent(form.location || 'Tunisia')
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Combine opening and closing times
      const timeString = `${(form as any).openingTime} - ${(form as any).closingTime}`
      const workshopData = {
        ...(form as any),
        time: timeString
      }
      
      // Remove the temporary fields
      const { openingTime, closingTime, ...finalForm } = workshopData
      
      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalForm),
      });

      if (res.ok) {
        router.push('/admin/workshops')
      } else {
        setError('Failed to add workshop. Please try again.')
      }
    } catch (err) {
      setError('Failed to add workshop. Please try again.')
      if (process.env.NODE_ENV === 'development') console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/workshops" className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-amber-600 mb-4 sm:mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Retour aux Ateliers
        </Link>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gradient mb-6 sm:mb-8">Ajouter un Nouvel Atelier</h1>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900">Détails de l'Atelier</h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Titre de l'Atelier</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Entrez le titre de l'atelier"
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
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Catégorie</Label>
                <Input 
                  id="category" 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  placeholder="ex. : Poterie, Fabrication de Bijoux, Textiles"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                Image de l'Atelier
              </h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border-2 border-amber-200">
                      <Image
                        src={imagePreview}
                        alt="Aperçu de l'atelier"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-amber-300 rounded-lg p-4 sm:p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-amber-400 mx-auto mb-2 sm:mb-4" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Cliquez pour télécharger l'image de l'atelier</p>
                    <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 text-sm sm:text-base"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Changer l\'Image' : 'Télécharger une Image'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card className="card-luxury">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                Horaire & Lieu
              </h2>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule" className="text-sm font-medium text-gray-700">Jours</Label>
                  <Select value={form.schedule} onValueChange={(value) => setForm(prev => ({ ...prev, schedule: value }))}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                      <SelectValue placeholder="Sélectionner les jours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lundi à Vendredi">Lundi à Vendredi</SelectItem>
                      <SelectItem value="Samedi et Dimanche">Samedi et Dimanche</SelectItem>
                      <SelectItem value="Tous les jours">Tous les jours</SelectItem>
                      <SelectItem value="Lundi, Mercredi, Vendredi">Lundi, Mercredi, Vendredi</SelectItem>
                      <SelectItem value="Mardi et Jeudi">Mardi et Jeudi</SelectItem>
                      <SelectItem value="Weekend seulement">Weekend seulement</SelectItem>
                      <SelectItem value="Sur demande">Sur demande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-sm font-medium text-gray-700">Heures</Label>
                  <Select value={form.hours} onValueChange={(value) => setForm(prev => ({ ...prev, hours: value }))}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                      <SelectValue placeholder="Sélectionner les heures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9h00 - 17h00">9h00 - 17h00</SelectItem>
                      <SelectItem value="9h00 - 12h00">9h00 - 12h00</SelectItem>
                      <SelectItem value="14h00 - 17h00">14h00 - 17h00</SelectItem>
                      <SelectItem value="14h00 - 18h00">14h00 - 18h00</SelectItem>
                      <SelectItem value="10h00 - 16h00">10h00 - 16h00</SelectItem>
                      <SelectItem value="8h00 - 12h00">8h00 - 12h00</SelectItem>
                      <SelectItem value="Sur demande">Sur demande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (TND)</Label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Lieu</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="location" 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange} 
                      placeholder="Entrez le lieu de l'atelier"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 flex-1"
                      required 
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openGoogleMaps}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Maps
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Durée</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    value={form.duration} 
                    onChange={handleChange} 
                    placeholder="Ex: 1 journée, 2 heures, 3 jours"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    required 
                  />
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

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <Link href="/admin/workshops" className="w-full sm:w-auto">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 w-full sm:w-auto">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="btn-luxury px-4 sm:px-8 w-full sm:w-auto"
            >
              {loading ? 'Création en cours...' : 'Créer l\'Atelier'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}