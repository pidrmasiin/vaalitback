const mongoose = require('mongoose')

const yle2019Schema = new mongoose.Schema({
  members: Array,
  parties: Object,
  headers: Array
})

yle2019Schema.statics.format = (yle) => {
  return{
    id: yle._id,
    members: yle.members,
    parties: yle.parties,
    headers: yle.headers
  }
}

const Yle2019 = mongoose.model('Yle2019', yle2019Schema)


module.exports = Yle2019