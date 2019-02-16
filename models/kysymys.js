const mongoose = require('mongoose')

const kysymysSchema = new mongoose.Schema({
  tunniste: String,
  kysymys: String,
  selitys: String,
  url: String,
  puolueet: Array,
  edustajat: Array,
  vuosi: String,
  vastaus: String,
  kysymyksenAsettelu: Boolean,
  hot: Boolean,
  kategoriat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Kategoria' }],
  jaaLiberal: Boolean,
  jaaLeftist: Boolean,
  green: Boolean
})

kysymysSchema.statics.format = (kysymys) => {
  return{
    id: kysymys._id,
    tunniste: kysymys.tunniste,
    kysymys: kysymys.kysymys,
    selitys: kysymys.selitys,
    url: kysymys.url,
    puolueet: kysymys.puolueet,
    edustajat: kysymys.edustajat,
    vuosi: kysymys.vuosi,
    vastaus: kysymys.vastaus,
    kategoriat: kysymys.kategoriat,
    hot: kysymys.hot,
    kysymyksenAsettelu: kysymys.kysymyksenAsettelu,
    jaaLiberal: kysymys.jaaLiberal,
    jaaLeftist: kysymys.jaaLeftist,
    green: kysymys.green
  }
}

const Kysymys = mongoose.model('Kysymys', kysymysSchema)


module.exports = Kysymys