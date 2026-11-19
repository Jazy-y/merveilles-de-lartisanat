'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { initializeDatabase } from '@/lib/database-init'
import { toast } from 'sonner'

export default function InitDatabasePage() {
  const { data: session } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Check if user is admin
  if (!user || (user as any)?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
              <div className="space-x-4">
                <Link href="/en/profile">
                  <Button>Go to Profile</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const handleInitializeDatabase = async () => {
    setLoading(true)
    try {
      await initializeDatabase()
      setInitialized(true)
      toast.success('Database initialized successfully!')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error initializing database:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to initialize database')
      } else {
        toast.error('Failed to initialize database')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/en/admin" className="inline-flex items-center text-amber-600 hover:text-amber-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Database Initialization</h1>
          <p className="text-gray-600">Set up your e-commerce database with sample data</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-amber-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Initialize Database</h2>
                <p className="text-gray-600">This will create sample products and categories in your database</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This action will add sample data to your database. If you already have products and categories, 
                    this will not overwrite them. The initialization is safe to run multiple times.
                  </p>
                </div>
              </div>
            </div>

            {/* What will be created */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What will be created:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Products (5 items)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Handcrafted Ceramic Vase</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Artisan Wooden Bowl Set</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Handwoven Textile Wall Hanging</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Copper Handcrafted Jewelry Box</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Handmade Leather Journal</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Categories (5 categories)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Home Decor</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Kitchen & Dining</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Textiles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Jewelry & Accessories</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Stationery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Database Collections */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Collections:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">products</p>
                  <Badge variant="outline" className="text-xs">Collection</Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">categories</p>
                  <Badge variant="outline" className="text-xs">Collection</Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">orders</p>
                  <Badge variant="outline" className="text-xs">Collection</Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">users</p>
                  <Badge variant="outline" className="text-xs">Collection</Badge>
                </div>
              </div>
            </div>

            {/* Initialize Button */}
            <div className="pt-6 border-t">
              {initialized ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Initialized!</h3>
                  <p className="text-gray-600 mb-4">Your database has been successfully set up with sample data.</p>
                  <div className="space-x-4">
                    <Link href="/products">
                      <Button>View Products</Button>
                    </Link>
                    <Link href="/en/admin">
                      <Button variant="outline">Back to Admin</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={handleInitializeDatabase}
                    disabled={loading}
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Initializing Database...
                      </>
                    ) : (
                      <>
                        <Database className="h-5 w-5 mr-2" />
                        Initialize Database
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    This process usually takes 10-30 seconds
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}