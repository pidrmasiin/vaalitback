const regionalQuestionRouter = require('express').Router()
const RegionalQuestion = require('../models/regionalQuestion')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  console.log(request.get('authorization'));
  
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

regionalQuestionRouter.get('/', async (request, response) => {
  const questions = await RegionalQuestion
    .find({ "disabled": { "$ne": true } })
  response.json(questions.map(RegionalQuestion.format))
})

regionalQuestionRouter.get('/all_requlars', async (request, response) => {
  const questions = await RegionalQuestion
    .find({})
  response.json(questions.map(RegionalQuestion.format))
})

regionalQuestionRouter.get('/:id', async (request, response) => {
  try{
    const question = await RegionalQuestion
      .findById(request.params.id)
    response.json(RegionalQuestion.format(question))
  }catch (exception) {
    console.log(exception)
    response.status(400).json({ error: 'kysymystä ei löydy' })
  }
})

regionalQuestionRouter.post('/', async (request, response) => {
  const body = request.body
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const question = new RegionalQuestion(body)
    await question.save()
    response.json(RegionalQuestion.format(question))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})


regionalQuestionRouter.put('/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const question = request.body

    const edite = await RegionalQuestion.findByIdAndUpdate(request.params.id, question, { new: true })
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

regionalQuestionRouter.get('/activate/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    console.log(token);
    
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    console.log(request.params.id );

    
    const blog = await RegionalQuestion.findOneAndUpdate({_id: request.params.id }, {disabled: false},  {
      new: true
    });
    console.log(blog);
    
    if (blog) {
      response.json(RegionalQuestion.format(blog))
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }

})

regionalQuestionRouter.delete('/:id', async (request, response) => {
  try{
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id || !token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    await RegionalQuestion.findByIdAndRemove(request.params.id)
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

module.exports = regionalQuestionRouter
