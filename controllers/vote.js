const voteRouter = require('express').Router()
const Vote = require('../models/vote')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

voteRouter.get('/', async (request, response) => {
  const votes = await Vote.find({})
  response.json(votes.map(Vote.format))
})

voteRouter.get('/:id', async (request, response) => {
  try{
    const vote = await Vote
      .findById(request.params.id)
    response.json(Vote.format(vote))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'Cant find vote' })
  }
})

voteRouter.post('/', async (request, response) => {
    const body = request.body

    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const vote = new Vote(body)
      await vote.save()
      response.json(Vote.format(vote))
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  voteRouter.put('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const vote = request.body
      const edite = await Vote.findByIdAndUpdate(request.params.id, vote, { new: true })
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

  voteRouter.delete('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!decodedToken.id || !token) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
  
      await Vote.findByIdAndRemove(request.params.id)
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

module.exports = voteRouter
  