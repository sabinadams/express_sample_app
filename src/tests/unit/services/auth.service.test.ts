import type { User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import prismaMock from 'lib/__mocks__/prisma'
import * as AuthService from 'services/auth.service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lib/prisma')
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(() => ({ id: 1 }))
  }
}))
vi.mock('bcrypt', () => ({
  default: {
    hashSync: () => 'hashedpass'
  }
}))

const env = process.env

beforeEach(() => {
  process.env = { ...env }
})

afterEach(() => {
  process.env = { ...env }
})

describe('auth.service', () => {
  describe('createUser', async () => {
    it('should create and return the user', async () => {
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        username: 'testname'
      } as User)

      const newUser = await AuthService.createUser({
        username: 'testname',
        password: 'testpass'
      })

      expect(newUser).toHaveProperty('id')
      expect(newUser).toHaveProperty('username')
      expect(newUser).toStrictEqual({
        id: 1,
        username: 'testname'
      })
    })

    it('should encrypt the password', async () => {
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        username: 'testname'
      } as User)

      await AuthService.createUser({
        username: 'testname',
        password: 'testpass'
      })

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { username: 'testname', password: 'hashedpass' },
        select: { id: true, username: true }
      })
    })
  })

  describe('generateJWT', () => {
    it('should generate a JWT', () => {
      process.env.API_SECRET = 'secret'
      AuthService.generateJWT(1)
      expect(jwt.sign).toHaveBeenCalled()
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, 'secret', {
        expiresIn: 86400
      })
    })

    it('should throw an error if there is no API_SECRET env var', () => {
      expect(() => AuthService.generateJWT(1)).toThrow()
    })
  })

  describe('validateJWT', () => {
    it('should return the token payload', () => {
      process.env.API_SECRET = 'secret'
      const payload = AuthService.validateJWT('token')
      expect(payload).toBe(1)
      expect(jwt.verify).toHaveBeenCalled()
      expect(jwt.verify).toHaveBeenCalledWith('token', 'secret')
    })
    it('should throw an error if there is no API_SECRET env var', () => {
      expect(() => AuthService.validateJWT('')).toThrow()
    })
  })
})
