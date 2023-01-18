import authRouter from 'auth/auth.router'
import express from 'express'
import { errorHandler } from 'lib/middlewares'
import { authorization } from 'lib/middlewares'
import quotesRouter from 'quotes/quotes.router'

const app = express()
app.use(express.json())
app.use('/quotes', authorization, quotesRouter)
app.use('/auth', authRouter)
app.use(errorHandler)

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`))

export default app
