import prisma from './helpers/prisma'
import type { Quote, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import app from 'lib/createServer'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('/quotes', async () => {
  describe('[*] /quotes', () => {
    it('should return an authentication error if not provided an Authorization header', async () => {
      const { body, status } = await request(app).get('/quotes')
      expect(status).toBe(401)
      expect(body.message).toBe('`Authorization` header is required.')
    })
    it('should return an authentication error if provided an invalid session token', async () => {
      const { body, status } = await request(app)
        .post('/quotes')
        .set({ Authorization: 'bearer invalidtoken' })
        .send({ text: 'test quote' })

      expect(status).toBe(401)
      expect(body.message).toBe('Invalid access token.')
    })
  })

  describe('[GET] /quotes', () => {
    let user: User & { quotes: Quote[] }
    beforeEach(async () => {
      user = await prisma.user.create({
        include: {
          quotes: true
        },
        data: {
          username: 'test',
          password: bcrypt.hashSync('test', 8),
          quotes: {
            createMany: {
              data: [
                {
                  text: 'test quote 1'
                },
                {
                  text: 'test quote 2'
                }
              ]
            }
          }
        }
      })
    })
    it("should return a list of signed-in user's quotes", async () => {
      // create a second user with only 1 quote
      await prisma.user.create({
        data: {
          username: 'test2',
          password: bcrypt.hashSync('test', 8),
          quotes: {
            create: {
              text: 'test quote'
            }
          }
        }
      })

      // Sign in the new user
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test2',
        password: 'test'
      })

      // Get quotes
      const { body, status } = await request(app)
        .get('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })

      // Make sure only the second user's quote is returned
      expect(status).toBe(200)
      expect(body.length).toBe(1)
      expect(body[0].text).toBe('test quote')
    })
    it("should include each post's tags", async () => {
      const { id } = await prisma.tag.create({
        select: { id: true },
        data: {
          name: 'tag1',
          color: '#000000'
        }
      })
      await prisma.quote.update({
        where: { id: user.quotes[0].id },
        data: {
          tags: {
            connect: { id }
          }
        }
      })

      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      // Get quotes
      const { body, status } = await request(app)
        .get('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })

      expect(status).toBe(200)
      expect(body[0].tags.length).toBe(1)
      expect(body[0].tags[0].name).toBe('tag1')
    })
  })

  describe('[POST] /quotes', () => {
    let user: User
    beforeEach(async () => {
      user = await prisma.user.create({
        include: {
          quotes: true
        },
        data: {
          username: 'test',
          password: bcrypt.hashSync('test', 8)
        }
      })
    })
    it('should create a new quote', async () => {
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      const { body, status } = await request(app)
        .post('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })
        .send({ text: 'test quote 3' })

      const quotes = await prisma.quote.count()

      expect(status).toBe(200)
      expect(quotes).toBe(1)
      expect(body.quote.text).toBe('test quote 3')
    })
    it('should return a 400 when given invalid input', async () => {
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      const { status } = await request(app)
        .post('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })
        .send({ invalid: 'test quote 3' })

      const quotes = await prisma.quote.count()
      expect(status).toBe(400)
      expect(quotes).toBe(0)
    })
    it('should associate the new quote with the signed-in user', async () => {
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      await request(app)
        .post('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })
        .send({ text: 'test quote 3' })

      const quote = await prisma.quote.findFirst({
        where: { text: 'test quote 3' }
      })

      expect(quote?.userId).toBe(user.id)
    })
  })

  describe('[DELETE] /quotes/:id', () => {
    // let user: User
    beforeEach(async () => {
      await prisma.user.create({
        include: {
          quotes: true
        },
        data: {
          username: 'test',
          password: bcrypt.hashSync('test', 8)
        }
      })
    })
    it('should return a 400 if no quote is associated with the given id', async () => {
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      const { status, body } = await request(app)
        .delete('/quotes/9999')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })

      console.log(status, body)

      expect(status).toBe(400)
      expect(body.message).toBe('Quote not found.')
    })
    it('should return a 401 the signed-in user is not the owner of the quote')
    it('should delete the quote')
    it('should clear orphaned tags')
  })
})
