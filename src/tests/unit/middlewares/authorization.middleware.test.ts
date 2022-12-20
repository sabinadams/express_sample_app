import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import authorization from 'middlewares/authorization.middleware'
import * as AuthService from 'services/auth.service'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(public type: string, public message: string) {}
  }
}))

vi.mock('services/auth.service', () => ({
  validateJWT: vi.fn()
}))

describe('authorization.middleware', () => {
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
