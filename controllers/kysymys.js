const kysymysRouter = require('express').Router()
const Kysymys = require('../models/kysymys')
const Kategoria = require('../models/kategoria')
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

kysymysRouter.get('/:id', async (request, response) => {
  try{
    const kysymys = await Kysymys.findById(request.params.id)
    response.json(Kysymys.format(kysymys))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'kysymystä ei löydy' })
  }
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
    const savedKysymys = await kysymys.save()

    if(body.kategoriat){
      for (let i = 0; i < body.kategoriat.length; i += 1) {
        const kategoria = await Kategoria.findById(body.kategoriat[i])
        const id = savedKysymys._id
        kategoria.kysymykset = kategoria.kysymykset.concat(id)
        await kategoria.save()
      }
    }

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


kysymysRouter.put('/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const kysymys = request.body
    const edited = await Kysymys.findByIdAndUpdate(request.params.id, kysymys, { new: true })

    if(kysymys.kategoriat){
      for (let i = 0; i < kysymys.kategoriat.length; i += 1) {
        const kategoria = await Kategoria.findById(kysymys.kategoriat[i])
        const id = edited._id
        kategoria.kysymykset = kategoria.kysymykset.concat(id)
        await kategoria.save()
      }
    }

    response.json(edited).end()

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
    const kysymys = await Kysymys.findById(request.params.id)
    if(kysymys.kategoriat){
      for (let i = 0; i < kysymys.kategoriat.length; i += 1) {
        const kategoria = await Kategoria.findById(kysymys.kategoriat[i])
        const id = kysymys._id
        kategoria.kysymykset = kategoria.kysymykset.filter(x => x.toString() !== id.toString())
        await Kategoria.findByIdAndUpdate(kategoria.id, kategoria, { new: true })
      }
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
