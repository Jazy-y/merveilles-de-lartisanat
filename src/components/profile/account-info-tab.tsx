'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Calendar, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

export default function AccountInfoTab() {
  const { data: session, update: updateSession } = useSession({
    required: false
  })
  const user = session?.user
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || ''
  })
  const [loading, setLoading] = useState(false)
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState<string | null | undefined>(user?.email)

  // Update currentEmail when user email changes
  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email)
    }
  }, [user?.email])

  // Listen for session update events and force re-fetch
  useEffect(() => {
    const handleSessionUpdate = async () => {
      // Wait a bit for session to update from NextAuth
      await new Promise(resolve => setTimeout(resolve, 500))
      // Force re-render by updating state with latest session data
      if (session?.user?.email) {
        setCurrentEmail(session.user.email)
      } else if (user?.email) {
        setCurrentEmail(user.email)
      }
    }
    
    window.addEventListener('session-update', handleSessionUpdate)
    return () => {
      window.removeEventListener('session-update', handleSessionUpdate)
    }
  }, [session?.user?.email, user?.email])
  
  // Also listen to session changes directly - this is the main way to update
  useEffect(() => {
    if (session?.user?.email) {
      setCurrentEmail(session.user.email)
    } else if (user?.email) {
      setCurrentEmail(user.email)
    }
  }, [session?.user?.email, user?.email])

  useEffect(() => {
    const fetchMemberSince = async () => {
      try {
        const res = await fetch('/api/user/created-at')
        if (res.ok) {
          const data = await res.json()
          if (data.createdAt) {
            const date = new Date(data.createdAt)
            setMemberSince(date.toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }))
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching member since:', error)
      }
    }
    if (user) {
      fetchMemberSince()
      setFormData({ name: user?.name || '' })
      setCurrentEmail(user?.email)
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Impossible de mettre à jour le profil');
      } else {
        await updateSession({ ...session, user: { ...user, name: formData.name } })
        toast.success('Profil mis à jour avec succès.');
        setIsEditing(false);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating profile:', error);
      toast.error(error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">Informations du compte</h2>
          <p className="text-sm text-muted-foreground mt-1">Consultez et gérez vos informations personnelles</p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Modifier le profil</span>
            <span className="sm:hidden">Modifier</span>
          </Button>
        )}
      </div>

      {/* Account Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <Card className="border border-border hover:border-foreground/30 transition-colors bg-card">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Nom complet</p>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Entrez votre nom complet"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base font-semibold text-foreground truncate">
                    {user?.name || 'Non fourni'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email - Read Only */}
        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Adresse e-mail</p>
                <p className="text-base font-semibold text-foreground truncate">
                  {currentEmail || user?.email || 'Non fourni'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Modifiable dans les paramètres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Since */}
        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Membre depuis</p>
                <p className="text-base font-semibold text-foreground">
                  {memberSince || 'Chargement...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Statut du compte</p>
                <p className="text-base font-semibold text-foreground">
                  Actif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <Card className="border-2 border-border bg-muted/30">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({ name: user?.name || '' })
                }}
                className="w-full sm:w-auto border-border"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={loading || !formData.name.trim()}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
