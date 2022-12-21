import { AppError } from '../utility-classes'
import { describe, expect, it } from 'vitest'

describe('utility-classes', () => {
  describe('AppError', () => {
    it('should set the status code based on the type of error', () => {
      const error1 = new AppError('validation', 'validation-error')
      const error2 = new AppError('unauthorized', 'auth-error')
      const error3 = new AppError('server', 'server-error')
      expect(error1.statusCode).toBe(400)
      expect(error2.statusCode).toBe(401)
      expect(error3.statusCode).toBe(500)
    })

    it('should set the error message', () => {
      const error = new AppError('validation', 'validation-error')
      expect(error.message).toBe('validation-error')
    })
  })
})
