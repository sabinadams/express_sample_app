import { authorization, errorHandler, validate } from '../middlewares'
import { AppError } from '../utility-classes'
import * as AuthService from 'auth/auth.service'
import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(public type: string, public message: string) {}
  }
}))

vi.mock('auth/auth.service', () => ({
  validateJWT: vi.fn()
}))

describe('middlewares', () => {
  describe('authorization', () => {
    let request: Request
    let response: Response
    const next = vi.fn()
    beforeEach(() => {
      vi.restoreAllMocks()
      response = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn()
      } as unknown as Response
      request = {} as Request
    })

    it('should immediately respond to the request if the method is OPTIONS', async () => {
      request.method = 'OPTIONS'

      await authorization(request, response, next)

      expect(response.send).toHaveBeenCalledWith({
        message: 'Preflight check successful.'
      })
    })

    it('should throw an error if no `authorization` header passed', async () => {
      request['headers'] = {}

      await authorization(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('unauthorized')
    })

    it('should throw an error if Bearer indicator not passed', async () => {
      request['headers'] = {
        authorization: 'Beaer token'
      }

      await authorization(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
      expect(next.mock.calls[0][0].type).toBe('unauthorized')
    })

    it('should throw an error if missing token', async () => {
      request['headers'] = {
        authorization: 'Bearer'
      }

      await authorization(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
      expect(next.mock.calls[0][0].type).toBe('unauthorized')
    })

    it('should throw an error if blank token', async () => {
      request['headers'] = {
        authorization: 'Bearer '
      }

      await authorization(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
      expect(next.mock.calls[0][0].type).toBe('unauthorized')
    })

    it('should set session token if success', async () => {
      request['headers'] = {
        authorization: 'Bearer token'
      }

      vi.mocked(AuthService.validateJWT).mockReturnValue(999)

      await authorization(request, response, next)

      expect(AuthService.validateJWT).toHaveBeenCalledWith('token')
      expect(request.session.userId).toBe(999)
      expect(next).toHaveBeenCalledWith()
    })

    it('should throw an error if there is a problem validating the token', async () => {
      request['headers'] = {
        authorization: 'Bearer token'
      }

      vi.mocked(AuthService.validateJWT).mockImplementation(() => {
        throw new Error('some error')
      })

      await authorization(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })
  })

  describe('errorHandler', () => {
    let request: Request
    let response: Response

    beforeEach(() => {
      vi.restoreAllMocks()
      response = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      request = {} as Request
    })

    it('should return a 500 status code when given an error with no status code', () => {
      const error = new Error('test')
      errorHandler(error, request, response)
      expect(response.status).toHaveBeenCalledWith(500)
    })

    it('should return a static error message when an unhandled error is thrown', () => {
      const error = new Error('test')
      errorHandler(error, request, response)
      expect(response.json).toHaveBeenCalledWith({
        message: 'Oops! Something wonky happened...'
      })
    })

    it('should return an error with the provided statusCode', () => {
      const error = new AppError('server', 'server-error')
      errorHandler(error, request, response)
      expect(response.status).toHaveBeenCalledWith(500)
    })
  })

  describe('validate', () => {
    let request: Request
    let response: Response
    const next = vi.fn()

    beforeEach(() => {
      vi.restoreAllMocks()
      response = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      request = {} as Request
    })

    it('should throw an error when given an invalid request', async () => {
      request.body = {}
      const schema = z.object({
        body: z.object({
          username: z.string(),
          password: z.string()
        })
      })

      await validate(schema)(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or missing inputs provided for: username, password'
      )
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should succeed with a valid request', async () => {
      request.body = { username: 'testusername' }
      const schema = z.object({
        body: z.object({
          username: z.string()
        })
      })

      await validate(schema)(request, response, next)
      expect(next).toHaveBeenCalledWith()
    })
  })
})
