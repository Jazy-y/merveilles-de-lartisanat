'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AccountInfoTab from '@/components/profile/account-info-tab'
import OrdersTab from '@/components/profile/orders-tab'
import WishlistTab from '@/components/profile/wishlist-tab'
import ReviewsTab from '@/components/profile/reviews-tab'
import SettingsTab from '@/components/profile/settings-tab'
import ProfileSidebar from '@/components/profile/profile-sidebar'
import { LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user
  const [activeTab, setActiveTab] = useState('account')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [counts, setCounts] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0
  })

  // Fetch counts for badges
  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const [ordersRes, wishlistRes, reviewsRes] = await Promise.all([
            fetch('/api/orders/my-orders').catch(() => null),
            fetch('/api/wishlist').catch(() => null),
            fetch('/api/reviews/my-reviews').catch(() => null)
          ])

          const newCounts = { ...counts }
          
          if (ordersRes?.ok) {
            const data = await ordersRes.json()
            newCounts.orders = data.orders?.length || 0
          }
          if (wishlistRes?.ok) {
            const data = await wishlistRes.json()
            newCounts.wishlist = data.wishlistItems?.length || 0
          }
          if (reviewsRes?.ok) {
            const data = await reviewsRes.json()
            newCounts.reviews = data.reviews?.length || 0
          }

          setCounts(newCounts)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching counts:', error)
        }
      }
      fetchCounts()
    }
  }, [user])

  if (!user) {
    return (
      <main className="min-h-screen bg-background-alt py-8 md:py-16">
        <div className="container-luxury">
          <div className="max-w-md mx-auto">
            <Card className="card-luxury shadow-luxury bg-card border-border">
              <CardContent className="text-center py-12 px-6">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">U</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4 font-display">Bon retour</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">Connectez-vous pour accéder à votre tableau de bord personnalisé et gérer votre compte.</p>
                <div className="space-y-3">
                  <Link href="/auth/signin" className="block">
                    <Button className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                      Créer un compte
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountInfoTab />
      case 'orders':
        return <OrdersTab />
      case 'wishlist':
        return <WishlistTab />
      case 'reviews':
        return <ReviewsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <AccountInfoTab />
    }
  }

  return (
    <main className="min-h-screen bg-background-alt py-6 md:py-12">
      <div className="container-luxury max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-6 md:mb-8">
          <Card className="card-luxury shadow-sm border border-border bg-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl font-bold">
                      {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                      Bon retour, {user?.name || 'Utilisateur'} !
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      Gérez votre compte, vos commandes et vos préférences
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="border-border text-destructive hover:bg-destructive/10 hover:border-destructive w-full md:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full justify-between"
          >
            <span className="flex items-center">
              <Menu className="w-4 h-4 mr-2" />
              Menu
            </span>
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block flex-shrink-0">
            <ProfileSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={counts}
            />
          </aside>

          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
                isMobile={true}
                onMobileClose={() => setIsMobileMenuOpen(false)}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Card className="card-luxury shadow-sm border border-border bg-card">
              <CardContent className="p-4 md:p-6 lg:p-8">
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
