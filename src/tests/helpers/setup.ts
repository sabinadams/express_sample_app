import resetDb from './reset-db'
import createServer from 'lib/createServer'
import { afterAll, afterEach } from 'vitest'

afterEach(async () => {
  await resetDb()
})

const app = createServer().listen(3001)

afterAll(() => {
  app.close()
})
