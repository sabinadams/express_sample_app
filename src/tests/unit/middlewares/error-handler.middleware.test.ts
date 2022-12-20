import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import handler from 'middlewares/error-handler.middleware'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('error-handler.middleware', () => {
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
    handler(error, request, response)
    expect(response.status).toHaveBeenCalledWith(500)
  })

  it('should return a static error message when an unhandled error is thrown', () => {
    const error = new Error('test')
    handler(error, request, response)
    expect(response.json).toHaveBeenCalledWith({
      message: 'Oops! Something wonky happened...'
    })
  })

  it('should return an error with the provided statusCode', () => {
    const error = new AppError('server', 'server-error')
    handler(error, request, response)
    expect(response.status).toHaveBeenCalledWith(500)
  })
})
