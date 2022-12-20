import * as AuthController from 'controllers/auth.controller'
import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import * as AuthService from 'services/auth.service'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('services/auth.service', () => ({
  findUserByUsername: vi.fn(),
  comparePasswords: vi.fn(),
  generateJWT: vi.fn(),
  createUser: vi.fn()
}))

vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(public type: string, public message: string) {}
  }
}))

describe('AuthController', () => {
  let request: Request
  let response: Response
  let next = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response
    request = {} as Request
    next = vi.fn()
  })

  describe('signup', () => {
    it('should throw a validation error if a user already exists with username', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue({
        id: 1,
        username: 'testusername',
        password: 'hashedpass'
      })

      await AuthController.signup(request, response, next)

      expect(AuthService.findUserByUsername).toHaveBeenCalledWith(
        'testusername'
      )
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should create a new user if username not taken', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue(null)
      vi.mocked(AuthService.createUser).mockResolvedValue({
        id: 1,
        username: 'testusername'
      })
      vi.mocked(AuthService.generateJWT).mockReturnValue('testtoken')
      await AuthController.signup(request, response, next)

      expect(AuthService.createUser).toHaveBeenCalledWith(request.body)
    })

    it('should create a session token for the new user', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue(null)
      vi.mocked(AuthService.createUser).mockResolvedValue({
        id: 1,
        username: 'testusername'
      })
      vi.mocked(AuthService.generateJWT).mockReturnValue('testtoken')
      await AuthController.signup(request, response, next)

      expect(AuthService.generateJWT).toHaveBeenCalledWith(1)
    })

    it('should respond to the request with a message, the user, and the token', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue(null)
      vi.mocked(AuthService.createUser).mockResolvedValue({
        id: 1,
        username: 'testusername'
      })
      vi.mocked(AuthService.generateJWT).mockReturnValue('testtoken')
      await AuthController.signup(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        message: `Registered successfully`,
        user: {
          id: 1,
          username: 'testusername'
        },
        token: 'testtoken'
      })
    })
  })

  describe('signin', () => {
    it('should throw a validation error if no user exists with username', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue(null)
      await AuthController.signin(request, response, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].type).toBe('validation')
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
    })

    it('should throw a validation error if the password is incorrect', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue({
        id: 1,
        username: 'testusername',
        password: 'hashedpass'
      })
      vi.mocked(AuthService.comparePasswords).mockReturnValue(false)

      await AuthController.signin(request, response, next)

      expect(AuthService.comparePasswords).toHaveBeenCalledWith(
        'testpassword',
        'hashedpass'
      )
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].type).toBe('validation')
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
    })

    it('should create a session token for the successfully logged-in user', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue({
        id: 1,
        username: 'testusername',
        password: 'hashedpass'
      })
      vi.mocked(AuthService.comparePasswords).mockReturnValue(true)
      vi.mocked(AuthService.generateJWT).mockReturnValue('testtoken')

      await AuthController.signin(request, response, next)

      expect(AuthService.generateJWT).toHaveBeenCalledWith(1)
    })

    it('should respond to the request with a message, the username, and the token', async () => {
      request.body = {
        username: 'testusername',
        password: 'testpassword'
      }

      vi.mocked(AuthService.findUserByUsername).mockResolvedValue({
        id: 1,
        username: 'testusername',
        password: 'hashedpass'
      })
      vi.mocked(AuthService.comparePasswords).mockReturnValue(true)
      vi.mocked(AuthService.generateJWT).mockReturnValue('testtoken')

      await AuthController.signin(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        message: 'Login successful!',
        username: 'testusername',
        token: 'testtoken'
      })
    })
  })
})
