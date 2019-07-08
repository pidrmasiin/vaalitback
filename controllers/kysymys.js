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
  const kysymykset = await Kysymys
    .find({})
    .populate('kategoriat', { nimi: 1 } )
  response.json(kysymykset.map(Kysymys.format))
})

kysymysRouter.get('/:id', async (request, response) => {
  try{
    const kysymys = await Kysymys
      .findById(request.params.id)
      .populate('kategoriat', { nimi: 1 } )
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
    body.createdAt = Date.now()

    const kysymys = new Kysymys(body)
    
    if(body.kategoriat){
      for (let i = 0; i < body.kategoriat.length; i += 1) {
        const kategoria = await Kategoria.findById(body.kategoriat[i])
        const id = kysymys._id
        kategoria.kysymykset = kategoria.kysymykset.concat(id)
        await kategoria.save()
      }
    }
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


kysymysRouter.put('/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const kysymys = request.body
    const old = await Kysymys.findById(kysymys.id)
    var oldcat = old.kategoriat
    // console.log('oldcat', oldcat)
    // console.log('kysymys', kysymys.kategoriat)
    if (kysymys.kategoriat && kysymys.kategoriat.length === 0){
      for (let i = 0; i < oldcat.length; i += 1) {
        // console.log('nolla')
        const kategoria = await Kategoria.findById(oldcat[i])
        if(kategoria.kysymykset.length > 0){
          var ind = kategoria.kysymykset.indexOf(kysymys.id)
          if (ind !== -1) kategoria.kysymykset.splice(ind, 1)
        }
        await kategoria.save()
      }
    } else if(kysymys.kategoriat){
      // console.log('lisäys')
      for (let i = 0; i < kysymys.kategoriat.length; i += 1) {
        const kategoria = await Kategoria.findById(kysymys.kategoriat[i])
        const id = request.params.id
        const exist = kategoria.kysymykset.find(x => x == kysymys.id)
        if(!exist){
          // console.log('kategorioiden lisäys')
          kategoria.kysymykset = kategoria.kysymykset.concat(id)
          await kategoria.save()
        }
        // console.log('oldcat ennen poistoa', oldcat)
        if(oldcat){
          // console.log('vanhan arrayn muokkaus')
          for (let s = 0; s < oldcat.length; s += 1) {
            const find = oldcat.find(x => x == kysymys.kategoriat[i])
            if(find){
              // console.log('poisto arraysta')
              var index = oldcat.indexOf(find)
              if (index !== -1) oldcat.splice(index, 1)
            }
          }
        }
      }
      if(oldcat){
        // console.log('tietokannasta poisto')
        for (let i = 0; i < oldcat.length; i += 1) {
          const kategoria = await Kategoria.findById(oldcat[i])
          // console.log('kategoria', kategoria)
          if (kategoria) {
            var inx = kategoria.kysymykset.indexOf(kysymys.id)
            if (inx !== -1) kategoria.kysymykset.splice(inx, 1)
            await kategoria.save()
          }
        }
      }
    }
    // console.log('oldcat', oldcat)
    const edite = await Kysymys.findByIdAndUpdate(request.params.id, kysymys, { new: true })
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
