import { prisma } from "../lib/prisma";

export const createQuote = async (text: string, tags: number[], userId: number) => {
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

export const getQuotesByUser = async (id: number) => {
  return await prisma.quote.findMany({
    where: { userId: id },
    include: { tags: true }
  })
}

export const getQuoteById = async (id: number) => {
  return await prisma.quote.findUnique({
    where: { id },
    include: { tags: true }
  })
}

export const deleteQuote = async (id: number) => {
  return await prisma.quote.delete({
    where: { id }
  })
}