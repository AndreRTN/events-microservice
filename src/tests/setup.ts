import { PrismaClient } from '@prisma/client'

// Set up test environment variables
process.env.API_KEY = 'test-api-key'

// Mock the production prisma to use test instance
jest.mock('../lib/prisma', () => ({
  prisma: new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db'
      }
    }
  })
}))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
})

beforeAll(async () => {
  // Ensure database schema is created
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`
  
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Event_id_key" ON "Event"("id")`
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Event_email_site_idx" ON "Event"("email", "site")`
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Event_type_idx" ON "Event"("type")`
})

beforeEach(async () => {
  await prisma.event.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

export { prisma }