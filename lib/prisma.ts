import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for Prisma')
  }

  // Use SQLite adapter for file: URLs (local development), PostgreSQL for production
  let adapter
  if (connectionString.startsWith('file:')) {
    adapter = new PrismaBetterSqlite3({ url: connectionString })
  } else {
    adapter = new PrismaPg({ connectionString })
  }
  return new PrismaClient({ adapter })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
