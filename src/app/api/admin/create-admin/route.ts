import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    if (!(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Admin User',
        role: 'ADMIN'
      }
    })

    // Log admin action
    await logAdminAction(
      (session as any).user.id,
      AUDIT_ACTIONS.CREATE_ADMIN,
      adminUser.id,
      { 
        newAdminEmail: adminUser.email,
        newAdminName: adminUser.name
      }
    );

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      userId: adminUser.id 
    }, { status: 201 })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

