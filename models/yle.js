const mongoose = require('mongoose')

const yleSchema = new mongoose.Schema({
  edustajat: Array,
  puolueet: Object,
  kysymykset: Array
})

yleSchema.statics.format = (yle) => {
  return{
    id: yle._id,
    edustajat: yle.edustajat,
    puolueet: yle.puolueet,
    kysymykset: yle.kysymykset
  }
}

const Yle = mongoose.model('Yle', yleSchema)


module.exports = Yle