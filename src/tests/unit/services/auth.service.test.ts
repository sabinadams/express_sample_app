import prismaMock from 'lib/__mocks__/prisma'
import * as AuthService from 'services/auth.service'
import { describe, expect, it, vi } from 'vitest'

vi.mock('lib/prisma')

describe('auth.service', () => {
  describe('findUserByName', () => {
    it('should return a user', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({
        id: 1,
        username: 'testname',
        password: 'hashedpass'
      })
      const user = await AuthService.findUserByUsername('testname')
      expect(user).toStrictEqual({
        id: 1,
        username: 'testname',
        password: 'hashedpass'
      })
    })
  })
})
