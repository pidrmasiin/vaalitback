const mongoose = require('mongoose')

const speakSchema = new mongoose.Schema({
  data: Array,
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Kysymys' },
  explainQuestion: String,
  details: String,
  url: String,
  html: String,
  createdAt: Date,
}, { timestamps: true })

speakSchema.statics.format = (speak) => {
  return{
    id: speak._id,
    question: speak.question,
    explainQuestion: speak.explainQuestion,
    details: speak.details,
    data: speak.data,
    url: speak.url,
    html: speak.html,
    createdAt: speak.createdAt
  }
}

const Speak = mongoose.model('Speak', speakSchema)


module.exports = Speak