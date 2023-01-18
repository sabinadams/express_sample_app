import resetDb from './helpers/reset-db'
import bcrypt from 'bcrypt'
import createServer from 'lib/createServer'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

const app = createServer().listen(3001, () => {
  console.log('Server listening')
})

describe('/auth', async () => {
  afterEach(async () => {
    await resetDb()
  })
  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app).post('/auth/signup').send({
        username: 'testusername',
        password: 'testpassword'
      })

      console.log(response)
    })
  })
  describe('/auth/signin', () => {
    it('should create a new user 2', async () => {
      expect(1).toBe(1)
    })
  })
})
