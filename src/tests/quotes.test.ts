import prisma from './helpers/prisma'
import bcrypt from 'bcrypt'
import app from 'lib/createServer'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('/quotes', async () => {
  describe('GET /quotes', () => {
    it('should return an authentication error if not provided an Authorization header', async () => {
      const { body, status } = await request(app).get('/quotes')
      expect(status).toBe(401)
      expect(body.message).toBe('`Authorization` header is required.')
    })
    it('should return an authentication error if provided an invalid session token', async () => {
      const { body, status } = await request(app)
        .get('/quotes')
        .set({ Authorization: 'bearer notavalidtoken' })

      expect(status).toBe(401)
      expect(body.message).toBe('Invalid access token.')
    })
    it("should return a list of current user's quotes", async () => {
      // Create user with 2 quotes
      await prisma.user.create({
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
      // Create user with 1 quote
      await prisma.user.create({
        data: {
          username: 'test2',
          password: bcrypt.hashSync('test', 8),
          quotes: {
            createMany: {
              data: [
                {
                  text: 'test quote 3'
                }
              ]
            }
          }
        }
      })

      // Sign in first user
      const signinResponse = await request(app).post('/auth/signin').send({
        username: 'test',
        password: 'test'
      })

      // Get quotes
      const { body, status } = await request(app)
        .get('/quotes')
        .set({ Authorization: `Bearer ${signinResponse.body.token}` })

      expect(status).toBe(200)
      expect(body.length).toBe(2)
      expect(body[0].text).toBe('test quote 1')
      expect(body[1].text).toBe('test quote 2')
    })
  })
})
