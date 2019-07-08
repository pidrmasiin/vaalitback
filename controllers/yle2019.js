const yle2019Router = require('express').Router()
const Yle2019 = require('../models/yle2019')

yle2019Router.get('/', async (request, response) => {
  if (request.headers.authorization != process.env.YLE_SECRET) {
    return response.status(401).json({ error: 'Ask data from Yle' })
  }
  const yle = await Yle2019.find({})
  response.json(yle.map(Yle2019.format))
})

yle2019Router.post('/', async (request, response) => {
  const body = request.body

  try{
    const yle = new Yle2019(body)
    await yle.save()
    response.json(Yle2019.format(yle))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = yle2019Router