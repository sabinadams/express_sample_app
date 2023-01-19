import resetDb from './reset-db'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  await resetDb()
})
