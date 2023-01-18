import authRouter from 'auth/auth.router'
import express from 'express'
import { errorHandler } from 'lib/middlewares'
import quotesRouter from 'quotes/quotes.router'

export default () => {
  const app = express()
  app.use(express.json())
  app.use('quotes', quotesRouter)
  app.use('auth', authRouter)
  app.use(errorHandler)
  return app
}
