'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingCart, Users, Calendar, GraduationCap, Book, BarChart2, Menu, X } from 'lucide-react'
import { AdminProtection } from '@/components/admin/admin-protection'
import { Button } from '@/components/ui/button'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Tableau de Bord', icon: Home },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/workshops', label: 'Ateliers', icon: Calendar },
    { href: '/admin/trainings', label: 'Formations', icon: GraduationCap },
    { href: '/admin/bookings', label: 'Réservations', icon: Calendar },
    { href: '/admin/enrollments', label: 'Inscriptions', icon: GraduationCap },
    { href: '/admin/analytics', label: 'Analyses', icon: BarChart2 },
  ]

  return (
    <AdminProtection>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-800 text-white p-4 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          {/* Mobile Menu Button - Inside Sidebar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 lg:block">
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
              <span className="text-xl sm:text-2xl font-bold">Panneau d&apos;Administration</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-gray-700 ml-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav>
            <ul className="space-y-1 sm:space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setIsMobileMenuOpen(false)}>
                    <span
                      className={`flex items-center p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                        pathname === href
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-100 min-w-0 relative">
          {/* Mobile Menu Button - Outside Sidebar */}
          {!isMobileMenuOpen && (
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {children}
        </main>
      </div>
    </AdminProtection>
  )
}

export default AdminLayout