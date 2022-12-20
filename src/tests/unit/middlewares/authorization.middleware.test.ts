import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import authorization from 'middlewares/authorization.middleware'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(public type: string, public message: string) {}
  }
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('authorization.middleware', () => {
  let request: Request
  let response: Response
  let next = vi.fn()
  beforeEach(() => {
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    } as unknown as Response
    request = {} as Request
    next = vi.fn()
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

  it('should throw an error if invalid `authorization` header passed', async () => {
    request['headers'] = {
      authorization: 'Bearer'
    }

    await authorization(request, response, next)

    expect(next).toHaveBeenCalled()
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
    expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
    expect(next.mock.calls[0][0].type).toBe('unauthorized')
  })
})
