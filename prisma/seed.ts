/**
 * Seeds the database with the public catalogue of Merveilles de l'Artisanat
 * (products, workshops and trainings) from prisma/seed-data/catalog.json.
 *
 * No users are created unless ADMIN_EMAIL and ADMIN_PASSWORD are provided,
 * so no default credentials ever exist.
 *
 *   npm run db:seed
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

type Catalog = {
  products: Array<Record<string, unknown> & { id: string }>
  workshops: Array<Record<string, unknown> & { id: string }>
  trainings: Array<Record<string, unknown> & { id: string; startDate?: string | null; endDate?: string | null }>
}

async function main() {
  const catalog: Catalog = JSON.parse(readFileSync(join(__dirname, 'seed-data', 'catalog.json'), 'utf8'))

  for (const p of catalog.products) {
    const { id, ...data } = p
    await prisma.product.upsert({ where: { id }, update: data as never, create: { id, ...data } as never })
  }
  for (const w of catalog.workshops) {
    const { id, ...data } = w
    await prisma.workshop.upsert({ where: { id }, update: data as never, create: { id, ...data } as never })
  }
  for (const t of catalog.trainings) {
    const { id, startDate, endDate, ...rest } = t
    const data = {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }
    await prisma.training.upsert({ where: { id }, update: data as never, create: { id, ...data } as never })
  }
  console.log(
    `Seeded ${catalog.products.length} products, ${catalog.workshops.length} workshops, ${catalog.trainings.length} trainings.`,
  )

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (email && password) {
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.')
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: { email, name: 'Administrator', password: hash, role: 'ADMIN' },
    })
    console.log(`Admin account ready: ${email}`)
  } else {
    console.log('No ADMIN_EMAIL/ADMIN_PASSWORD set: no admin account created.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
