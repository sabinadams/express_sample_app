import prisma from './helpers/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import app from 'lib/createServer'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('/auth', async () => {
  describe('[POST] /auth/signup', () => {
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
    it('should return a validation error when invalid request body provided', async () => {
      const { body, status } = await request(app).post('/auth/signup').send({
        email: 'test@prisma.io', // should be username
        password: 'wrongpassword'
      })

      expect(status).toBe(400)
      expect(body.message).toBe(
        `Invalid or missing input provided for: username`
      )
    })
  })

  describe('[POST] /auth/signin', () => {
    it('should sign in an existing user with valid credentials', async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: bcrypt.hashSync('testpassword', 8)
        }
      })

      const { status } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })

      expect(status).toBe(200)
    })
    it("should return only a user's username", async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: bcrypt.hashSync('testpassword', 8)
        }
      })

      const { body } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })

      expect(body.username).toBe('testusername')
      expect(body).not.toHaveProperty('password')
    })
    it('should return a valid session token when successful', async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: bcrypt.hashSync('testpassword', 8)
        }
      })

      const { body } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })

      expect(body).toHaveProperty('token')
      expect(jwt.verify(body.token, process.env.API_SECRET as string))
    })
    it('should return a 400 when given invalid credentials', async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: bcrypt.hashSync('testpassword', 8)
        }
      })

      const { body, status } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'wrongpassword'
      })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('token')
    })
    it('should return a 400 when user not found', async () => {
      const { body, status } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'wrongpassword'
      })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('token')
    })
    it('should return a validation error when invalid request body provided', async () => {
      const { body, status } = await request(app).post('/auth/signin').send({
        email: 'test@prisma.io', // should be username
        password: 'wrongpassword'
      })

      expect(status).toBe(400)
      expect(body.message).toBe(
        `Invalid or missing input provided for: username`
      )
    })
  })
})
