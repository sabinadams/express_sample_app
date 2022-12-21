import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      auth: '/auth',
      quotes: '/quotes',
      lib: '/lib'
    }
  }
})
