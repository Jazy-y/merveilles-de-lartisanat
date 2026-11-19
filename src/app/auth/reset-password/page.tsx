'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { validatePasswordStrength, getPasswordStrength } from '@/lib/password-validation'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'faible' | 'moyen' | 'fort'>('faible')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    // Verify token on mount
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        setVerifying(false)
        toast.error('Token de réinitialisation manquant')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          setTokenValid(false)
          toast.error(data.error || 'Token invalide ou expiré')
        } else {
          setTokenValid(true)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error verifying token:', error)
        setTokenValid(false)
        toast.error('Erreur lors de la vérification du token')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  useEffect(() => {
    // Update password strength as user types
    if (password) {
      setPasswordStrength(getPasswordStrength(password))
    } else {
      setPasswordStrength('faible')
    }
  }, [password])

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'fort':
        return 'bg-green-500'
      case 'moyen':
        return 'bg-yellow-500'
      case 'faible':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'fort':
        return 'Fort'
      case 'moyen':
        return 'Moyen'
      case 'faible':
        return 'Faible'
      default:
        return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token de réinitialisation manquant')
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    // Validate password strength
    const validation = validatePasswordStrength(password)
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Le mot de passe ne respecte pas les exigences')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la réinitialisation du mot de passe')
        setLoading(false)
        return
      }

      toast.success('Mot de passe réinitialisé avec succès !')
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/signin?message=Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.')
      }, 1500)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error resetting password:', error)
      toast.error('Erreur lors de la réinitialisation du mot de passe')
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <main className="min-h-screen py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-luxury shadow-luxury">
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Vérification du token...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!tokenValid) {
    return (
      <main className="min-h-screen py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-luxury shadow-luxury">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Token invalide ou expiré</h2>
              <p className="text-gray-600 mb-6">
                Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
              </p>
              <Link href="/auth/forgot-password">
                <Button className="btn-luxury">
                  Demander un nouveau lien
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="card-luxury shadow-luxury">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Réinitialiser le mot de passe</h1>
            <p className="text-gray-600 mt-2">
              Entrez votre nouveau mot de passe
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Force du mot de passe:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength === 'fort' ? 'text-green-600' :
                        passwordStrength === 'moyen' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength === 'fort' ? 'bg-green-500 w-full' :
                          passwordStrength === 'moyen' ? 'bg-yellow-500 w-2/3' :
                          'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Exigences:</p>
                  <ul className="text-xs text-gray-500 space-y-1 ml-4">
                    <li className={password.length >= 8 ? 'text-green-600' : ''}>
                      {password.length >= 8 ? '✓' : '○'} Minimum 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} Doit contenir au moins une majuscule
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Doit contenir au moins un chiffre
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-luxury" 
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/signin" 
                className="text-sm text-amber-600 hover:text-amber-500 font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-luxury shadow-luxury">
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

