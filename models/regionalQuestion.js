const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const regionalQuestionSchema = new mongoose.Schema({
  question: String,
  explain: String,
  url: String,
  parties: Object,
  yes: Object,
  no: Object,
  empty: Object,
  out: Object,
  jaaLiberal: Boolean,
  jaaLeftist: Boolean,
  jaaGreen: Boolean,
  disabled: Boolean,
  city: String
}, { timestamps: true })

regionalQuestionSchema.plugin(uniqueValidator);

regionalQuestionSchema.statics.format = (regionalQuestion) => {
  return{
    id: regionalQuestion._id,
    question: regionalQuestion.question,
    explain: regionalQuestion.explain,
    url: regionalQuestion.url,
    parties: regionalQuestion.parties,
    yes: regionalQuestion.yes,
    no: regionalQuestion.no,
    empty: regionalQuestion.empty,
    out: regionalQuestion.out,
    jaaLiberal: regionalQuestion.jaaLiberal,
    jaaLeftist: regionalQuestion.jaaLeftist,
    jaaGreen: regionalQuestion.green,
    disabled: regionalQuestion.disabled,
    city: regionalQuestion.city,
    createdAt: regionalQuestion.createdAt
  }
}

const RegionalQuestion = mongoose.model('RegionalQuestion', regionalQuestionSchema)


module.exports = RegionalQuestion