import type { Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import validate from 'middlewares/validate.middleware'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

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

describe('validate.middleware', () => {
  let request: Request
  let response: Response
  let next = vi.fn()

  beforeEach(() => {
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response
    request = {} as Request
    next = vi.fn()
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
