import { prisma } from './prisma'

export interface AuditLogData {
  userId?: string
  action: string
  targetId?: string
  metadata?: Record<string, any>
}

/**
 * Logs an admin action to the audit trail
 * Only logs actions for users with ADMIN role
 * 
 * @param userId - The ID of the user performing the action
 * @param action - The action being performed (e.g., "CREATE_PRODUCT", "DELETE_USER")
 * @param targetId - Optional ID of the target resource (e.g., productId, trainingId)
 * @param metadata - Optional additional metadata about the action
 */
export async function logAdminAction(
  userId: string | undefined,
  action: string,
  targetId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Only log if we have a userId
    if (!userId) {
      if (process.env.NODE_ENV === 'development') console.warn('Audit log: No userId provided, skipping audit log')
      return
    }

    // Verify the user has ADMIN role before logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      if (process.env.NODE_ENV === 'development') console.warn(`Audit log: User ${userId} is not an admin, skipping audit log`)
      return
    }

    // Create the audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    })

  } catch (error) {
    // Don't throw errors from audit logging to avoid breaking the main operation
    if (process.env.NODE_ENV === 'development') console.error('Failed to create audit log:', error)
  }
}

/**
 * Predefined action constants for consistency
 */
export const AUDIT_ACTIONS = {
  // Product actions
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  
  // Training actions
  CREATE_TRAINING: 'CREATE_TRAINING',
  UPDATE_TRAINING: 'UPDATE_TRAINING',
  DELETE_TRAINING: 'DELETE_TRAINING',
  
  // Workshop actions
  CREATE_WORKSHOP: 'CREATE_WORKSHOP',
  UPDATE_WORKSHOP: 'UPDATE_WORKSHOP',
  DELETE_WORKSHOP: 'DELETE_WORKSHOP',
  
  // User actions
  UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
  CREATE_ADMIN: 'CREATE_ADMIN',
  
  // Order actions
  VIEW_ORDERS: 'VIEW_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  
  // Blog actions
  CREATE_BLOG_ARTICLE: 'CREATE_BLOG_ARTICLE',
  UPDATE_BLOG_ARTICLE: 'UPDATE_BLOG_ARTICLE',
  DELETE_BLOG_ARTICLE: 'DELETE_BLOG_ARTICLE',
  
  // File actions
  UPLOAD_FILE: 'UPLOAD_FILE',
  
  // System actions
  ACCESS_ADMIN_PANEL: 'ACCESS_ADMIN_PANEL'
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

