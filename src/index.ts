import createServer from 'lib/createServer'

const app = createServer()

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`))
