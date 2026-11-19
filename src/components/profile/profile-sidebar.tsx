'use client'

import { User, Package, Heart, Star, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts: {
    orders: number
    wishlist: number
    reviews: number
  }
  isMobile?: boolean
  onMobileClose?: () => void
}

const menuItems = [
  { id: 'account', label: 'Compte', icon: User },
  { id: 'orders', label: 'Commandes', icon: Package, countKey: 'orders' as const },
  { id: 'wishlist', label: 'Favoris', icon: Heart, countKey: 'wishlist' as const },
  { id: 'reviews', label: 'Avis', icon: Star, countKey: 'reviews' as const },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export default function ProfileSidebar({ 
  activeTab, 
  onTabChange, 
  counts,
  isMobile = false,
  onMobileClose 
}: ProfileSidebarProps) {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <nav className={cn(
      "bg-card rounded-lg shadow-sm border border-border",
      isMobile ? "w-full" : "w-64"
    )}>
      <div className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const count = item.countKey ? counts[item.countKey] : undefined
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-muted text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )} />
                <span>{item.label}</span>
              </div>
              {count !== undefined && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-2 border-border",
                    isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {count}
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

