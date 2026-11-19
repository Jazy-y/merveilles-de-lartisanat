import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/csrf'

export async function GET(req: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId } = await params

    // Fetch the enrollment
    const enrollment = await prisma.trainingBooking.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            duration: true,
            format: true,
            level: true,
            category: true,
            price: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error fetching training enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training enrollment' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    // CSRF protection
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }

    // Check authentication and admin role
    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId } = await params
    const { status } = await req.json()

    // Validate status
    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the enrollment status
    const updatedEnrollment = await prisma.trainingBooking.update({
      where: { id: enrollmentId },
      data: { status: status as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            duration: true,
            format: true,
            level: true,
            category: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error updating training enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to update training enrollment' },
      { status: 500 }
    )
  }
}
