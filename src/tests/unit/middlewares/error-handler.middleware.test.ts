import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import handler from 'middlewares/error-handler.middleware'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('error-handler.middleware', () => {
  let request: Request
  let response: Response

  beforeEach(() => {
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response
    request = {} as Request
  })

  it('should return a 400 status code when given an error with no status code', () => {
    const error = new Error('test')

    handler(error, request, response)

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({ message: 'test' })
  })

  it('should return an error with the provided statusCode', () => {
    const error = new AppError('server', 'server-error')

    handler(error, request, response)

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ message: 'server-error' })
  })
})
