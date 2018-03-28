const kysymysRouter = require('express').Router()
const Kysymys = require('../models/kysymys')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

kysymysRouter.get('/', async (request, response) => {
  const kysymykset = await Kysymys.find({})
  response.json(kysymykset.map(Kysymys.format))
})

kysymysRouter.post('/', async (request, response) => {
  const body = request.body

  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const kysymys = new Kysymys(body)
    await kysymys.save()
    response.json(Kysymys.format(kysymys))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})


kysymysRouter.get('/:id', async (request, response) => {

  try{
    const blog = await Kysymys.findById(request.params.id)
    if (blog) {
      response.json(Kysymys.format(blog))
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }

})

kysymysRouter.delete('/:id', async (request, response) => {
  try{
    console.log('request', request.params)
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id || !token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    await Kysymys.findByIdAndRemove(request.params.id)
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

module.exports = kysymysRouter
