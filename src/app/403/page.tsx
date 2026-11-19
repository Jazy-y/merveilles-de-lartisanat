'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX, Home, LogIn } from 'lucide-react'

export default function ForbiddenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is not logged in, redirect to login after a short delay
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Forbidden
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-gray-600">
            <p className="mb-2">
              You don't have permission to access this page.
            </p>
            {session ? (
              <p className="text-sm">
                Your account ({session.user?.email}) doesn't have admin privileges.
              </p>
            ) : (
              <p className="text-sm">
                You need to be logged in with admin privileges to access this area.
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            
            {!session && (
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="flex-1"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
          
          {!session && (
            <p className="text-xs text-gray-500 mt-4">
              Redirecting to sign in page in 3 seconds...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

