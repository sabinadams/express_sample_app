import { AppError } from 'lib/utility-classes'
import { describe, expect, it } from 'vitest'

describe('utility-classes', () => {
  describe('AppError', () => {
    it('Should set the status code based on the type of error', () => {
      const error = new AppError('validation', 'validation-error')
      const error2 = new AppError('server', 'server-error')
      const error3 = new AppError('unauthorized', 'auth-error')
      expect(error.statusCode).toBe(400)
      expect(error2.statusCode).toBe(500)
      expect(error3.statusCode).toBe(401)
    })
  })
})
