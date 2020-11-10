const mongoose = require('mongoose')

const kysymysSchema = new mongoose.Schema({
  tunniste: {
    type: String,
    unique: true
  },
  kysymys: String,
  selitys: String,
  explain: String,
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
  green: Boolean,
  createdAt: Date,
  yle2019: String
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
    green: kysymys.green,
    createdAt: kysymys.createdAt,
    yle2019: kysymys.yle2019,
    explain: kysymys.explain
  }
}

const Kysymys = mongoose.model('Kysymys', kysymysSchema)


module.exports = Kysymys