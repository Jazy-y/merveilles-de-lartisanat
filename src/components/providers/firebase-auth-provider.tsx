'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface AuthContextType {
  user: User | null
  userData: User | null
  loading: boolean
}

export function useAuth(): AuthContextType {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          // Fetch user data from database using Prisma
          const response = await fetch('/api/user/me')
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUserData({
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                image: data.user.image,
                role: data.user.role
              })
            }
          } else {
            // Fallback to session data
            setUserData({
              id: (session.user as any).id || session.user.email || '',
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              role: (session.user as any).role || 'CLIENT'
            })
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching user data:', error)
          // Fallback to session data
          setUserData({
            id: (session.user as any).id || session.user.email || '',
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: (session.user as any).role || 'CLIENT'
          })
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    }

    fetchUserData()
  }, [session])

  const user: User | null = session?.user ? {
    id: (session.user as any).id  || session.user.email || '',
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role || 'CLIENT'
  } : null

  return {
    user: userData || user,
    userData: userData || user,
    loading: status === 'loading' || loading
  }
}

