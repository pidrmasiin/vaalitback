const kysymysRouter = require('express').Router()
const Kysymys = require('../models/kysymys')

kysymysRouter.get('/', async (request, response) => {
  const kysymykset = await Kysymys.find({})
  response.json(kysymykset.map(Kysymys.format))
})

kysymysRouter.post('/', async (request, response) => {
  const body = request.body

  try{
    const kysymys = new Kysymys(body)
    await kysymys.save()
    response.json(Kysymys.format(kysymys))
  } catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'something went wrong...' })
  }
})

module.exports = kysymysRouter
