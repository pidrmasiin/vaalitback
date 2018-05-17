const kategoriaRouter = require('express').Router()
const Kategoria = require('../models/kategoria')
const Kysymys = require('../models/kysymys')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

kategoriaRouter.get('/', async (request, response) => {
  const kysymykset = await Kategoria.find({})
  response.json(kysymykset.map(Kategoria.format))
})

kategoriaRouter.post('/', async (request, response) => {
  const body = request.body

  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const kategoria = new Kategoria(body)
    await kategoria.save()
    response.json(Kategoria.format(kategoria))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

kategoriaRouter.get('/:id', async (request, response) => {

  try{
    const kategoria = await Kategoria.findById(request.params.id)
    if (kategoria) {
      response.json(Kategoria.format(kategoria))
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }

})

kategoriaRouter.delete('/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id || !token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const kategoria = await Kategoria.findById(request.params.id)
    if(kategoria.kysymykset){
      for (let i = 0; i < kategoria.kysymykset.length; i += 1) {
        const kysymys = await Kysymys.findById(kategoria.kysymykset[i])
        const id = request.params.id
        kysymys.kategoriat = kysymys.kategoriat.filter(x => x.toString() !== id.toString())
        await Kysymys.findByIdAndUpdate(kysymys.id, kysymys, { new: true })
      }
    }
    await Kategoria.findByIdAndRemove(request.params.id)
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



module.exports = kategoriaRouter