import prisma from './helpers/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import app from 'lib/createServer'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('/auth', () => {
  describe('[POST] /auth/signup', () => {
    it('should respond with a `200` status code and user details', async () => {
      const { body, status } = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })

      const newUser = await prisma.user.findFirst()

      expect(status).toBe(200)
      expect(newUser).not.toBeNull()
      expect(body.user).toStrictEqual({
        username: 'testusername',
        id: newUser?.id
      })
    })
    it('should respond with a valid session token when successful', async () => {
      const { body } = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })
      expect(body).toHaveProperty('token')
      expect(jwt.verify(body.token, process.env.API_SECRET as string))
    })
    it('should respond with a `400` status code if a user exists with the provided username', async () => {
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
    it('should respond with a `400` status code if an invalid request body is provided', async () => {
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
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          username: 'testusername',
          password: bcrypt.hashSync('testpassword', 8)
        }
      })
    })
    it('should respond with a `200` status code when provided valid credentials', async () => {
      const { status } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })

      expect(status).toBe(200)
    })
    it('should respond with the user details when successful', async () => {
      const { body } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })
      const keys = Object.keys(body.user)
      expect(keys.length).toBe(2)
      expect(keys).toStrictEqual(['id', 'username'])
      expect(body.user.username).toBe('testusername')
    })
    it('should respond with a valid session token when successful', async () => {
      const { body } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'testpassword'
      })

      expect(body).toHaveProperty('token')
      expect(jwt.verify(body.token, process.env.API_SECRET as string))
    })
    it('should respond with a `400` status code when given invalid credentials', async () => {
      const { body, status } = await request(app).post('/auth/signin').send({
        username: 'testusername',
        password: 'wrongpassword'
      })
      expect(status).toBe(400)
      expect(body).not.toHaveProperty('token')
    })
    it('should respond with a `400` status code when the user cannot be found', async () => {
      const { body, status } = await request(app).post('/auth/signin').send({
        username: 'wrongusername',
        password: 'testpassword'
      })
      expect(status).toBe(400)
      expect(body).not.toHaveProperty('token')
    })
    it('should respond with a `400` status code when given an invalid request body', async () => {
      const { body, status } = await request(app).post('/auth/signin').send({
        email: 'test@prisma.io', // should be username
        password: 'testpassword'
      })
      expect(status).toBe(400)
      expect(body.message).toBe(
        `Invalid or missing input provided for: username`
      )
    })
  })
})
