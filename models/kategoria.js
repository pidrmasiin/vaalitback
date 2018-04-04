const mongoose = require('mongoose')

const kategoriaSchema = new mongoose.Schema({
  nimi: String,
  kysymykset: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Kysymys' }],
  vastaukset: Array
})

kategoriaSchema.statics.format = (kategoria) => {
  return{
    id: kategoria._id,
    nimi: kategoria.nimi,
    kysymykset: kategoria.kysymykset,
    vastaukset: kategoria.vastaukset
  }
}

const Kategoria = mongoose.model('Kategoria', kategoriaSchema)


module.exports = Kategoria