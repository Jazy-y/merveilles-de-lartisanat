'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/firebase-auth-provider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Crown, User, Search } from 'lucide-react'
import Link from 'next/link'
import { getAllUsers, updateUserRole } from '@/lib/database-init'
import { toast } from 'sonner'
import { ClientOnly } from '@/components/ui/client-only'

export default function UsersPage() {
  const { user, userData } = useAuth()
  const [users, setUsers] = useState<Array<{
    id: string;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: string;
  }>>([])
  const [filteredUsers, setFilteredUsers] = useState<Array<{
    id: string;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: string;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const usersData = await getAllUsers()
        const formattedUsers = usersData.map((u: any) => ({
          id: u.id,
          name: u.name ?? undefined,
          email: u.email ?? undefined,
          role: u.role,
          createdAt: u.createdAt ? (typeof u.createdAt === 'string' ? u.createdAt : u.createdAt.toISOString()) : undefined
        }))
        setUsers(formattedUsers)
        setFilteredUsers(formattedUsers)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error loading users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole as 'ADMIN' | 'CLIENT')
      toast.success(`User role updated to ${newRole}`)
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  // Check if user is admin
  if (!user || userData?.role !== 'ADMIN') {
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

  if (loading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <ClientOnly fallback={
      <main className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    }>
      <main className="min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/en/admin" className="inline-flex items-center text-amber-600 hover:text-amber-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  All Users ({filteredUsers.length})
                </h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No users have signed up yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.name || 'No name provided'}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={`${
                        (user as any)?.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {(user as any)?.role === 'ADMIN' ? (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            ADMIN
                          </>
                        ) : (
                          'USER'
                        )}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        {(user as any)?.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, 'ADMIN')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Make Admin
                          </Button>
                        )}
                        {(user as any)?.role === 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, 'USER')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Remove Admin
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
    </ClientOnly>
  )
}
