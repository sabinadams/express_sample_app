import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.tag.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.user.deleteMany()
  ])
}
