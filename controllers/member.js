const memberRouter = require('express').Router()
const Member = require('../models/member')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

memberRouter.get('/', async (request, response) => {
  const members = await Member.find({})
  response.json(members.map(Member.format))
})

memberRouter.get('/:id', async (request, response) => {
  try{
    const member = await Member
      .findById(request.params.id)
    response.json(Member.format(member))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'Cant find member' })
  }
})

memberRouter.post('/', async (request, response) => {
    const body = request.body

    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const member = new Member(body)
      await member.save()
      response.json(Member.format(member))
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  memberRouter.put('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const member = request.body
      const edite = await Member.findByIdAndUpdate(request.params.id, member, { new: true })
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

  memberRouter.delete('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!decodedToken.id || !token) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
  
      await Member.findByIdAndRemove(request.params.id)
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

module.exports = memberRouter
  