const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const kysymyksetRouter = require('./controllers/kysymys')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')

mongoose.connect(config.mongoUrl)
mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(middleware.logger)

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/kysymykset', kysymyksetRouter)

app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}