import prisma from './helpers/prisma'
import resetDb from './helpers/reset-db'
// import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import createServer from 'lib/createServer'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

const app = createServer().listen(3001, () => {
  console.log('Server listening')
})

describe('/auth', async () => {
  afterEach(async () => {
    await resetDb()
  })
  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const { body, status } = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })

      const newUser = await prisma.user.findFirst()

      expect(status).toBe(200)
      expect(newUser).not.toBeNull()
      expect(body).toHaveProperty('user')
      expect(body.user.username).toBe('testusername')
      expect(body.user.id).toBe(newUser?.id)
    })

    it('should return a 400 if the username already exists', async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: 'somepassword'
        }
      })

      const { status, body } = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })

      const count = await prisma.user.count()

      expect(count).toBe(1)
      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
    })

    it('should return a valid session token', async () => {
      const { body } = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })
      expect(body).toHaveProperty('token')
      expect(jwt.verify(body.token, process.env.API_SECRET as string))
    })
  })
  describe('POST /auth/signin', () => {
    it('should create a new user 2', async () => {
      expect(1).toBe(1)
    })
  })
})
