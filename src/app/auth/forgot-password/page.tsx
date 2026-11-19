'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erreur : impossible d\'envoyer l\'e-mail de réinitialisation.')
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Un e-mail de réinitialisation a été envoyé à votre adresse.')
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=Un e-mail de réinitialisation a été envoyé à votre adresse.')
      }, 2000)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error sending reset email:', error)
      toast.error('Erreur : impossible d\'envoyer l\'e-mail de réinitialisation.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="card-luxury shadow-luxury">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mot de passe oublié</h1>
            <p className="text-gray-600 mt-2">
              {success 
                ? 'Un e-mail de réinitialisation a été envoyé à votre adresse.'
                : 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.'}
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-center">
                    Vérifiez votre boîte de réception. Vous serez redirigé vers la page de connexion dans quelques secondes.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="w-full btn-luxury"
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-luxury" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/auth/signin" 
                className="inline-flex items-center text-sm text-amber-600 hover:text-amber-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

