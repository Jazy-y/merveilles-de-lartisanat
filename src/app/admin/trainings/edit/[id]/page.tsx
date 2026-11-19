'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

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
}

export default function EditTrainingPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Training>>({})

  useEffect(() => {
    const loadTraining = async () => {
      if (!id) return
      try {
        const res = await fetch(`/api/trainings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data.training);
        }
      } catch (err) {
        setError('Failed to load training.')
      }
    }
    loadTraining()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/trainings')
      } else {
        setError('Failed to update training. Please try again.')
      }
    } catch (err) {
      setError('Failed to update training. Please try again.')
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

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Modifier la Formation</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="title">Title</label>
                <Input id="title" name="title" value={form.title || ''} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea id="description" name="description" value={form.description || ''} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-xs sm:text-sm">Prix (TND)</label>
                  <Input id="price" name="price" type="number" value={form.price || 0} onChange={handleChange} className="w-full" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-xs sm:text-sm">Durée</label>
                  <Input id="duration" name="duration" value={form.duration || ''} onChange={handleChange} className="w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="format" className="text-xs sm:text-sm">Format</label>
                  <Select name="format" onValueChange={(value) => handleSelectChange('format', value)} value={form.format || 'Online'}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez le format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">En ligne</SelectItem>
                      <SelectItem value="Hybrid">Hybride</SelectItem>
                      <SelectItem value="In-person">En présentiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="level" className="text-xs sm:text-sm">Niveau</label>
                  <Select name="level" onValueChange={(value) => handleSelectChange('level', value)} value={form.level || 'Beginner'}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Débutant</SelectItem>
                      <SelectItem value="Intermediate">Intermédiaire</SelectItem>
                      <SelectItem value="Advanced">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category">Category</label>
                <Input id="category" name="category" value={form.category || ''} onChange={handleChange} required />
              </div>

              {error && <p className="text-xs sm:text-sm text-red-600 break-words">{error}</p>}

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Link href="/admin/trainings" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Mise à jour...' : 'Mettre à Jour la Formation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  )
}
