const mongoose = require('mongoose')

const kysymysSchema = new mongoose.Schema({
  kysymys: String,
  selitys: String,
  url: String,
  puolueet: Array,
  edustajat: Array,
  vuosi: String
})

kysymysSchema.statics.format = (kysymys) => {
  return{
    id: kysymys._id,
    kysymys: kysymys.kysymys,
    selitys: kysymys.selitys,
    url: kysymys.url,
    puolueet: kysymys.puolueet,
    edustajat: kysymys.edustajat,
    vuosi: kysymys.vuosi
  }
}

const Kysymys = mongoose.model('Kysymys', kysymysSchema)


module.exports = Kysymys