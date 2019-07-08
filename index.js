const http = require('http')
const path = require('path')
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
const kategoriatRouter = require('./controllers/kategoria')
const yleRouter = require('./controllers/yle')
const yle2019Router = require('./controllers/yle2019')

mongoose.connect(config.mongoUrl)
mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json({limit: '200mb', extended: true}))
app.use(express.static('build'))
app.use(middleware.logger)

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/kysymykset', kysymyksetRouter)
app.use('/api/kategoriat', kategoriatRouter)
app.use('/api/yle', yleRouter)
app.use('/api/yle2019', yle2019Router)




app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})
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