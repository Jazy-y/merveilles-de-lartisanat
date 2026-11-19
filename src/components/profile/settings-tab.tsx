'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, Lock, MapPin, Plus, Edit, Trash2, Home, Building, Eye, EyeOff, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { validatePasswordStrength, getPasswordStrength } from '@/lib/password-validation'
import Select from 'react-select'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './address-form-styles.css'
import { countries, Country } from '@/lib/countries'

interface Address {
  id: string
  type: 'billing' | 'shipping'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export default function SettingsTab() {
  const { data: session, update } = useSession({
    required: false
  })
  const router = useRouter()
  const user = session?.user
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState<'faible' | 'moyen' | 'fort'>('faible')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Email update state
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailFormData, setEmailFormData] = useState({
    newEmail: user?.email || '',
    password: ''
  })
  const [emailLoading, setEmailLoading] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  // Update emailFormData when user email changes
  useEffect(() => {
    if (user?.email && !isEditingEmail) {
      setEmailFormData(prev => ({
        ...prev,
        newEmail: user.email || prev.newEmail
      }))
    }
  }, [user?.email, isEditingEmail])
  
  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    type: 'shipping' as 'billing' | 'shipping',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  })
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string}>({})

  // Helper function to get default country
  const getDefaultCountry = () => {
    // Try to get country from user's locale or default to US
    const locale = navigator.language || 'en-US'
    const countryCode = locale.split('-')[1] || 'US'
    const country = countries.find(c => c.code === countryCode)
    return country?.name || 'United States'
  }

  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordStrength(getPasswordStrength(passwordData.newPassword))
    } else {
      setPasswordStrength('faible')
    }
  }, [passwordData.newPassword])

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

  const handleChangePassword = async () => {
    if (!user) return

    if (!passwordData.currentPassword) {
      toast.error('Le mot de passe actuel est requis')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    // Validate password strength
    const validation = validatePasswordStrength(passwordData.newPassword)
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Le mot de passe ne respecte pas les exigences')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Impossible de mettre à jour le mot de passe');
      } else {
        toast.success('Mot de passe mis à jour avec succès.');
        setPasswordData({ 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        });
        setIsEditingPassword(false);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating password:', error);
      toast.error(error.message || 'Impossible de mettre à jour le mot de passe');
    } finally {
      setLoading(false);
    }
  }

  // Validation function
  const validateAddressForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!addressForm.firstName.trim()) {
      errors.firstName = 'Le prénom est requis'
    }
    if (!addressForm.lastName.trim()) {
      errors.lastName = 'Le nom est requis'
    }
    if (!addressForm.address1.trim()) {
      errors.address1 = 'L\'adresse est requise'
    }
    if (!addressForm.city.trim()) {
      errors.city = 'La ville est requise'
    }
    if (!addressForm.state.trim()) {
      errors.state = 'Le département/région est requis'
    }
    if (!addressForm.zipCode.trim()) {
      errors.zipCode = 'Le code postal est requis'
    }
    if (!addressForm.country) {
      errors.country = 'Le pays est requis'
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (addressForm.phone) {
      // Remove any non-digit characters except + for validation
      const cleanPhone = addressForm.phone.replace(/[^\d+]/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.phone = 'Veuillez entrer un numéro de téléphone valide (10-15 chiffres)'
      }
    }
    
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveAddress = () => {
    if (!validateAddressForm()) {
      toast.error('Veuillez corriger les erreurs avant d\'enregistrer')
      return
    }

    // TODO: Implement address saving to database
    const newAddress: Address = {
      id: Date.now().toString(),
      ...addressForm
    }
    
    if (editingAddress) {
      setAddresses(addresses.map(addr => addr.id === editingAddress.id ? newAddress : addr))
      setEditingAddress(null)
    } else {
      setAddresses([...addresses, newAddress])
      setIsAddingAddress(false)
    }
    
    setAddressForm({
      type: 'shipping',
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'France',
      phone: '',
      isDefault: false
    })
    setAddressErrors({})
    
    toast.success(editingAddress ? 'Adresse mise à jour avec succès !' : 'Adresse ajoutée avec succès !')
  }

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId))
    toast.success('Adresse supprimée avec succès !')
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    })
    setAddressErrors({})
    setIsAddingAddress(true)
  }

  return (
    <div className="space-y-8">
      {/* Security Settings */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-foreground" />
              <span>Paramètres de sécurité</span>
            </CardTitle>
            {!isEditingPassword && (
              <Button
                variant="outline"
                onClick={() => setIsEditingPassword(true)}
                className="flex items-center space-x-2 border-border text-foreground hover:bg-muted"
              >
                <Lock className="h-4 w-4" />
                <span>Modifier le mot de passe</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingPassword && (
            <div className="space-y-6 p-6 bg-muted rounded-lg border border-border">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                    Mot de passe actuel
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Entrez votre mot de passe actuel"
                      className="border-border focus:border-foreground focus:ring-foreground/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Entrez votre nouveau mot de passe"
                      className="border-border focus:border-foreground focus:ring-foreground/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Force du mot de passe:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength === 'fort' ? 'text-green-600' :
                          passwordStrength === 'moyen' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
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
                    <p className="text-xs text-muted-foreground">Exigences:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '○'} Minimum 8 caractères
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Doit contenir au moins une majuscule et un chiffre
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirmez votre nouveau mot de passe"
                      className="border-border focus:border-foreground focus:ring-foreground/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingPassword(false)
                    setPasswordData({ 
                      currentPassword: '', 
                      newPassword: '', 
                      confirmPassword: '' 
                    })
                  }}
                  className="w-full sm:w-auto border-border"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="w-full sm:w-auto "
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Update Section */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-foreground" />
              <span>Modification de l'e-mail</span>
            </CardTitle>
            {!isEditingEmail && (
              <Button
                variant="outline"
                onClick={() => setIsEditingEmail(true)}
                className="flex items-center space-x-2 border-border text-foreground hover:bg-muted"
              >
                <Mail className="h-4 w-4" />
                <span>Modifier l'e-mail</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingEmail ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Adresse e-mail actuelle</p>
              <p className="text-base font-semibold text-foreground">{user?.email || 'Non fourni'}</p>
            </div>
          ) : (
            <div className="space-y-6 p-6 bg-muted rounded-lg border border-border">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-sm font-medium text-foreground">
                    Nouvelle adresse e-mail
                  </Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={emailFormData.newEmail}
                    onChange={(e) => setEmailFormData({ ...emailFormData, newEmail: e.target.value })}
                    placeholder="Nouvelle adresse e-mail"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailPassword" className="text-sm font-medium text-foreground">
                    Confirmez avec votre mot de passe actuel
                  </Label>
                  <div className="relative">
                    <Input
                      id="emailPassword"
                      type={showEmailPassword ? 'text' : 'password'}
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                      placeholder="Mot de passe actuel"
                      className="border-border focus:border-foreground focus:ring-foreground/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showEmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingEmail(false)
                    setEmailFormData({
                      newEmail: user?.email || '',
                      password: ''
                    })
                  }}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={async () => {
                    if (!user) return

                    if (!emailFormData.password) {
                      toast.error('Le mot de passe est requis pour modifier l\'adresse e-mail')
                      return
                    }

                    if (!emailFormData.newEmail || emailFormData.newEmail === user.email) {
                      toast.error('Veuillez entrer une nouvelle adresse e-mail')
                      return
                    }

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(emailFormData.newEmail)) {
                      toast.error('Format d\'e-mail invalide')
                      return
                    }

                    setEmailLoading(true)
                    try {
                      const res = await fetch('/api/user/email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: emailFormData.newEmail,
                          password: emailFormData.password,
                        }),
                      });

                      if (!res.ok) {
                        const data = await res.json();
                        toast.error(data.error || 'Impossible de mettre à jour l\'adresse e-mail.');
                      } else {
                        const newEmail = emailFormData.newEmail
                        
                        // Update local state first
                        setEmailFormData({
                          newEmail: newEmail,
                          password: ''
                        })
                        
                        // Trigger NextAuth update - this will call jwt callback with trigger='update'
                        // and fetch fresh user data from database including the new email
                        await update()
                        
                        // Wait a moment for session to update
                        await new Promise(resolve => setTimeout(resolve, 200))
                        
                        // Show success message
                        toast.success('Adresse e-mail mise à jour avec succès.')
                        setIsEditingEmail(false)
                        
                        // Force router refresh to update all components
                        router.refresh()
                        
                        // Dispatch event to notify other components after a short delay
                        setTimeout(() => {
                          window.dispatchEvent(new Event('session-update'))
                        }, 500)
                      }
                    } catch (error: any) {
                      if (process.env.NODE_ENV === 'development') console.error('Error updating email:', error);
                      toast.error(error.message || 'Impossible de mettre à jour l\'adresse e-mail.');
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading}
                  className="w-full sm:w-auto "
                >
                  <Save className="h-4 w-4 mr-2" />
                  {emailLoading ? 'Mise à jour...' : 'Mettre à jour l\'e-mail'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Management */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-foreground" />
              <span>Gestion des adresses</span>
            </CardTitle>
            <Button
              onClick={() => setIsAddingAddress(true)}
              className=""
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une adresse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingAddress && (
            <div className="space-y-6 p-6 bg-muted rounded-lg border border-border mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une nouvelle adresse'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Type d'adresse</Label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as 'billing' | 'shipping' })}
                    className="w-full p-2 border border-border rounded-lg focus:border-foreground focus:ring-foreground/20"
                  >
                    <option value="shipping">Adresse de livraison</option>
                    <option value="billing">Adresse de facturation</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Entreprise (Optionnel)</Label>
                  <Input
                    value={addressForm.company}
                    onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                    placeholder="Nom de l'entreprise"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Prénom</Label>
                  <Input
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    placeholder="Prénom"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Nom</Label>
                  <Input
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                    placeholder="Nom"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-foreground">Ligne d'adresse 1</Label>
                  <Input
                    value={addressForm.address1}
                    onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                    placeholder="Rue et numéro"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-foreground">Ligne d'adresse 2 (Optionnel)</Label>
                  <Input
                    value={addressForm.address2}
                    onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                    placeholder="Appartement, suite, etc."
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Ville</Label>
                  <Input
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Ville"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Département/Région</Label>
                  <Input
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Département/Région"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Code postal</Label>
                  <Input
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="border-border focus:border-foreground focus:ring-foreground/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Pays</Label>
                  <Select
                    value={countries.find(country => country.name === addressForm.country)}
                    onChange={(selectedOption) => {
                      const newCountry = selectedOption?.name || ''
                      setAddressForm({ ...addressForm, country: newCountry })
                      if (addressErrors.country) {
                        setAddressErrors({ ...addressErrors, country: '' })
                      }
                    }}
                    options={countries}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.name}
                    placeholder="Sélectionner un pays..."
                    isSearchable
                    className={`react-select-container ${addressErrors.country ? 'error' : ''}`}
                    classNamePrefix="react-select"
                    formatOptionLabel={(option) => (
                      <div className="flex items-center space-x-2">
                        <span>{option.name}</span>
                        <span className="text-xs text-muted-foreground">({option.phoneCode})</span>
                      </div>
                    )}
                  />
                  {addressErrors.country && (
                    <p className="text-sm text-red-600">{addressErrors.country}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-foreground">Numéro de téléphone (Optionnel)</Label>
                  <div className={`phone-input-container ${addressErrors.phone ? 'error' : ''}`}>
                    <PhoneInput
                      country={countries.find(c => c.name === addressForm.country)?.code.toLowerCase() || 'fr'}
                      value={addressForm.phone}
                      onChange={(phone) => {
                        setAddressForm({ ...addressForm, phone })
                        if (addressErrors.phone) {
                          setAddressErrors({ ...addressErrors, phone: '' })
                        }
                      }}
                      placeholder="Entrer le numéro de téléphone"
                      enableSearch
                      disableSearchIcon={false}
                      searchPlaceholder="Rechercher des pays..."
                    />
                  </div>
                  {addressErrors.phone && (
                    <p className="text-sm text-red-600">{addressErrors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingAddress(false)
                    setEditingAddress(null)
                    setAddressForm({
                      type: 'shipping',
                      firstName: '',
                      lastName: '',
                      company: '',
                      address1: '',
                      address2: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: 'United States',
                      phone: '',
                      isDefault: false
                    })
                    setAddressErrors({})
                  }}
                  className="w-full sm:w-auto border-border"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveAddress}
                  className="w-full sm:w-auto "
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAddress ? 'Mettre à jour l\'adresse' : 'Ajouter l\'adresse'}
                </Button>
              </div>
            </div>
          )}

          {/* Address List */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucune adresse ajoutée</h3>
                <p className="text-muted-foreground mb-4">Ajoutez votre première adresse pour commencer.</p>
                <Button onClick={() => setIsAddingAddress(true)} className="">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une adresse
                </Button>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="p-4 border border-border rounded-lg hover:border-foreground/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {address.type === 'billing' ? (
                          <Building className="w-5 h-5 text-foreground" />
                        ) : (
                          <Home className="w-5 h-5 text-foreground" />
                        )}
                        <h4 className="font-semibold text-foreground capitalize">
                          {address.type === 'billing' ? 'Adresse de facturation' : 'Adresse de livraison'}
                        </h4>
                        {address.isDefault && (
                          <span className="px-2 py-1 text-xs bg-muted text-foreground rounded-full">
                            Par défaut
                          </span>
                        )}
                      </div>
                      <div className="text-foreground space-y-1">
                        <p>{address.firstName} {address.lastName}</p>
                        {address.company && <p>{address.company}</p>}
                        <p>{address.address1}</p>
                        {address.address2 && <p>{address.address2}</p>}
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                        {address.phone && (
                          <p className="flex items-center space-x-1">
                            <span>📞</span>
                            <span>{address.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="border-border"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}