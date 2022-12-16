import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      lib: '/lib',
      services: '/services',
      middlewares: '/middlewares',
      controllers: '/controllers',
      routes: '/routes',
      validation: '/validation'
    }
  }
})
