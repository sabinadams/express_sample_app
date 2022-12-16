import express from 'express'
import errorHandlerMiddleware from 'middlewares/error-handler.middleware'
import router from 'routes/index'

const app = express()

app.use(express.json())
app.use(router)
app.use(errorHandlerMiddleware)

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`))
