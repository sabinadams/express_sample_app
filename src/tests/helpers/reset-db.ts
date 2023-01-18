import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  // Reset the database
  await prisma.quote.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()
}
