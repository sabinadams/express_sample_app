// import prisma from './helpers/prisma'
import resetDb from './helpers/reset-db'
import createServer from 'lib/createServer'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

const app = createServer().listen(3001)

describe('/quotes', async () => {
  afterEach(async () => {
    await resetDb()
  })
  describe('GET /quotes', () => {
    it(
      'should return an authentication error if not provided a valid session token'
    )
    it("should return a list of current user's quotes", async () => {
      const { body, status } = await request(app).get('/quotes')
      expect(status).toBe(200)
      expect(body).toHaveProperty('quotes')
      expect(body.quotes.length).toBe(2)
    })
  })
})
