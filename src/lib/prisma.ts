import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a mock prisma client for development without database
const createMockPrisma = (): PrismaClient => ({
  user: {
    findUnique: async (args: Prisma.UserFindUniqueArgs) => {

      return null
    },
    create: async (args: Prisma.UserCreateArgs) => {

      return { id: '1', name: 'Test User', email: 'test@example.com', role: 'CLIENT' }
    },
    findMany: async () => {

      return []
    },
    update: async (args: Prisma.UserUpdateArgs) => {

      return { id: '1', name: 'Test User', email: 'test@example.com', role: 'CLIENT' }
    }
  },
  product: {
    findMany: async () => {

      return []
    },
    create: async (args: Prisma.ProductCreateArgs) => {

      return { id: '1', name: 'Test Product' }
    },
    findUnique: async (args: Prisma.ProductFindUniqueArgs) => {

      return null
    },
    update: async (args: Prisma.ProductUpdateArgs) => {

      return { id: '1', name: 'Test Product' }
    },
    delete: async (args: Prisma.ProductDeleteArgs) => {

      return { id: '1', name: 'Test Product' }
    }
  },
  order: {
    findMany: async () => {

      return []
    },
    create: async (args: Prisma.OrderCreateArgs) => {

      return { id: '1', total: 100 }
    }
  },
  training: {
    findMany: async () => {

      return []
    },
    create: async (args: Prisma.TrainingCreateArgs) => {

      return { id: '1', title: 'Test Training' }
    },
    findUnique: async (args: Prisma.TrainingFindUniqueArgs) => {

      return null
    },
    update: async (args: Prisma.TrainingUpdateArgs) => {

      return { id: '1', title: 'Test Training' }
    },
    delete: async (args: Prisma.TrainingDeleteArgs) => {

      return { id: '1', title: 'Test Training' }
    }
  },
  workshop: {
    findMany: async () => {

      return []
    },
    create: async (args: Prisma.WorkshopCreateArgs) => {

      return { id: '1', title: 'Test Workshop' }
    },
    findUnique: async (args: Prisma.WorkshopFindUniqueArgs) => {

      return null
    },
    update: async (args: Prisma.WorkshopUpdateArgs) => {

      return { id: '1', title: 'Test Workshop' }
    },
    delete: async (args: Prisma.WorkshopDeleteArgs) => {

      return { id: '1', title: 'Test Workshop' }
    }
  },
  auditLog: {
    create: async (args: Prisma.AuditLogCreateArgs) => {

      return { id: '1', action: 'TEST_ACTION', createdAt: new Date() }
    }
  }
} as any)

let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

} catch (error) {

  prisma = createMockPrisma()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as PrismaClient

export { prisma }
