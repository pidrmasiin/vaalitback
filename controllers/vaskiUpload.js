const vaskiUploadRouter = require('express').Router()
const VaskiUpload = require('../models/vaskiUpload')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

vaskiUploadRouter.get('/', async (request, response) => {
  const vaskiUploads = await VaskiUpload.find({})
  response.json(vaskiUploads.map(VaskiUpload.format))
})

vaskiUploadRouter.get('/:id', async (request, response) => {
  try{
    const vaskiUpload = await VaskiUpload
      .findById(request.params.id)
    response.json(VaskiUpload.format(vaskiUpload))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'Cant find vaskiUpload' })
  }
})

vaskiUploadRouter.post('/', async (request, response) => {
    const body = request.body

    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const vaskiUpload = new VaskiUpload(body)
      await vaskiUpload.save()
      response.json(VaskiUpload.format(vaskiUpload))
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  vaskiUploadRouter.put('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const vaskiUpload = request.body
      const edite = await VaskiUpload.findByIdAndUpdate(request.params.id, vaskiUpload, { new: true })
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

  vaskiUploadRouter.delete('/:id', async (request, response) => {
    try{
      const token = getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!decodedToken.id || !token) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
  
      await VaskiUpload.findByIdAndRemove(request.params.id)
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

module.exports = vaskiUploadRouter
  