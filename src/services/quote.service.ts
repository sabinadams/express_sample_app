import { prisma } from "../lib/prisma";

export async function createQuote(text: string, tags: number[], userId: number) {
  return await prisma.quote.create({ 
    data: {
      text,
      user: {
        connect: { id: userId }
      },
      tags: {
        connect: tags.map((id) => ({ id }))
      }
    }
   })
}

export async function getQuotesByUser(id: number) {
  return await prisma.quote.findMany({
    where: { userId: id },
    include: { tags: true }
  })
}

export async function getQuoteById(id: number) {
  return await prisma.quote.findUnique({
    where: { id },
    include: { tags: true }
  })
}

export async function deleteQuote(id: number) {
  return await prisma.quote.delete({
    where: { id }
  })
}