const http = require('http')
const path = require('path')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const schedule = require('./utils/scheduled')
const vaskiData = require('./utils/vaskiData')
const kysymyksetRouter = require('./controllers/kysymys')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')
const kategoriatRouter = require('./controllers/kategoria')
const yleRouter = require('./controllers/yle')
const yle2019Router = require('./controllers/yle2019')
const speakRouter = require('./controllers/speak')

mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true } )
mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json({limit: '200mb', extended: true}))
app.use(express.static('build'))
app.use(middleware.logger)
function requestLogger(httpModule){
  var original = httpModule.request
  httpModule.request = function(options, callback){
    console.log(options.href||options.proto+"://"+options.host+options.path, options.method, options.headers)
    return original(options, callback)
  }
}

requestLogger(require('http'))
requestLogger(require('https'))

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/kysymykset', kysymyksetRouter)
app.use('/api/kategoriat', kategoriatRouter)
app.use('/api/yle', yleRouter)
app.use('/api/yle2019', yle2019Router)
app.use('/api/speaks', speakRouter)

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})
app.use(middleware.error)

// schedule.twitterBot
vaskiData.getSpeaks()

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