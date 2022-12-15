import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export async function createQuote(data: Prisma.QuoteCreateArgs) {
  return await prisma.quote.create(data)
}

export async function getQuotes() {
  return await prisma.quote.findMany()
}