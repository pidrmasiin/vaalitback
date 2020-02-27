const mongoose = require('mongoose')

const speakSchema = new mongoose.Schema({
  speak: String,
  party: String,
  shout: Boolean,
  speaker: String,
  time: String,
  question: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Kysymys' }]
}, { timestamps: true })

speakSchema.statics.format = (speak) => {
  return{
    id: speak._id,
    party: speak.party,
    shout: speak.shout,
    question: speak.question,
    time: speak.time,
    speaker: speak.speaker,
    speak: speak.speak
  }
}

const Speak = mongoose.model('Speak', speakSchema)


module.exports = Speak