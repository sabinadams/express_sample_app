import prismaMock from 'lib/__mocks__/prisma'
import * as QuoteService from 'services/quote.service'
import { describe, expect, it, vi } from 'vitest'

vi.mock('lib/prisma')

describe('quote.service', () => {
  describe('createQuote', () => {
    it('should return the new quote', async () => {
      prismaMock.quote.create.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      const newQuote = await QuoteService.createQuote('test quote', [], 2)
      expect(newQuote).toHaveProperty('id')
      expect(newQuote).toHaveProperty('text')
      expect(newQuote).toHaveProperty('userId')
      expect(newQuote).toStrictEqual({
        id: 1,
        userId: 2,
        text: 'test quote'
      })
    })

    it('should connect a user to the quote', async () => {
      prismaMock.quote.create.mockResolvedValue({
        id: 1,
        userId: 999,
        text: 'test quote'
      })

      await QuoteService.createQuote('test quote', [], 999)

      expect(prismaMock.quote.create).toHaveBeenCalledWith({
        data: {
          text: 'test quote',
          user: { connect: { id: 999 } },
          tags: { connect: [] }
        }
      })
    })

    it('should connect tags to the quote', async () => {
      prismaMock.quote.create.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      await QuoteService.createQuote('test quote', [9, 8, 7], 2)

      expect(prismaMock.quote.create).toHaveBeenCalledWith({
        data: {
          text: 'test quote',
          user: { connect: { id: 2 } },
          tags: { connect: [{ id: 9 }, { id: 8 }, { id: 7 }] }
        }
      })
    })
  })

  describe('getQuotesByUser', () => {
    it('should return quotes for a user', async () => {
      prismaMock.quote.findMany.mockResolvedValue([
        {
          id: 1,
          userId: 2,
          text: 'test quote'
        }
      ])

      const quotes = await QuoteService.getQuotesByUser(2)

      expect(quotes).toHaveLength(1)
      expect(quotes[0]).toHaveProperty('id')
      expect(quotes[0]).toHaveProperty('text')
      expect(quotes[0]).toHaveProperty('userId')
      expect(quotes[0]).toStrictEqual({
        id: 1,
        userId: 2,
        text: 'test quote'
      })
    })

    it('should filter by userId and include tags', async () => {
      prismaMock.quote.findMany.mockResolvedValue([
        {
          id: 1,
          userId: 2,
          text: 'test quote'
        }
      ])

      await QuoteService.getQuotesByUser(2)

      expect(prismaMock.quote.findMany).toHaveBeenCalledWith({
        where: { userId: 2 },
        include: { tags: true }
      })
    })
  })

  describe('getQuoteById', () => {
    it('should return a quote by id', async () => {
      prismaMock.quote.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      const quote = await QuoteService.getQuoteById(1)

      expect(quote).toHaveProperty('id')
      expect(quote).toHaveProperty('text')
      expect(quote).toHaveProperty('userId')
      expect(quote).toStrictEqual({
        id: 1,
        userId: 2,
        text: 'test quote'
      })
    })

    it('should filter by userId and include tags', async () => {
      prismaMock.quote.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      await QuoteService.getQuoteById(1)

      expect(prismaMock.quote.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { tags: true }
      })
    })
  })

  describe('deleteQuote', () => {
    it('should return the deleted', async () => {
      prismaMock.quote.delete.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      const quote = await QuoteService.deleteQuote(1)

      expect(quote).toHaveProperty('id')
      expect(quote).toHaveProperty('text')
      expect(quote).toHaveProperty('userId')
      expect(quote).toStrictEqual({
        id: 1,
        userId: 2,
        text: 'test quote'
      })
    })

    it('should filter by id', async () => {
      prismaMock.quote.delete.mockResolvedValue({
        id: 1,
        userId: 2,
        text: 'test quote'
      })

      await QuoteService.deleteQuote(1)

      expect(prismaMock.quote.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })
})
