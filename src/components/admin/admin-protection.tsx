'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AdminProtectionProps {
  children: ReactNode
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      // Not logged in, redirect to login
      router.push('/auth/signin')
      return
    }

    if (session && session.user && (session.user as any).role !== 'ADMIN') {
      // Logged in but not admin, redirect to 403
      router.push('/403')
      return
    }
  }, [session, status, router])

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (status === 'unauthenticated' || (session && session.user && (session.user as any).role !== 'ADMIN')) {
    return null
  }

  // User is authenticated and is admin, render children
  return <>{children}</>
}

