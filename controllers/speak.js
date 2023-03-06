const speakRouter = require('express').Router()
const Speak = require('../models/speak')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

speakRouter.get('/', async (request, response) => {
  const speaks = await Speak.find({})
  response.json(speaks.map(Speak.format))
})

speakRouter.get('/one/:id', async (request, response) => {
  try{
    const speak = await Speak
      .findById(request.params.id)
    response.json(Speak.format(speak))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'Cant find speak' })
  }
})

speakRouter.get('/question/:questionId', async (request, response) => {
  try{
    const speak = await Speak
      .findOne({ question: request.params.questionId})
      console.log(speak)
    response.json(Speak.format(speak))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'Cant find speak' })
  }
})

speakRouter.post('/', async (request, response) => {
    const body = request.body

    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const speak = new Speak(body)
      speak.createdAt = Date.now()
      await speak.save()
      response.json(Speak.format(speak))
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  speakRouter.put('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const speak = request.body
      speak.createdAt = Date.now()
      const edite = await Speak.findByIdAndUpdate(request.params.id, speak, { new: true })
      response.json(edite).end()
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  speakRouter.delete('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!decodedToken.id || !token) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
  
      await Speak.findByIdAndRemove(request.params.id)
      response.status(204).end()
    }catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      }else {
        console.log(exception)
        response.status(400).json({ error: 'already deleted?' })
      }
    }
  })

module.exports = speakRouter
  