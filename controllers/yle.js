const yleRouter = require('express').Router()
const Yle = require('../models/yle')

yleRouter.get('/', async (request, response) => {
  const yle = await Yle.find({})
  response.json(yle.map(Yle.format))
})

// yleRouter.post('/', async (request, response) => {
//   const body = request.body

//   try{
//     const yle = new Yle(body)
//     await yle.save()
//     response.json(Yle.format(yle))
//   } catch (exception) {
//     console.log(exception)
//     response.status(500).json({ error: 'something went wrong...' })
//   }
// })

module.exports = yleRouter
