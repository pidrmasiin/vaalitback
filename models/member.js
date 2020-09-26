const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
    vaskiPersonId: {
        type: String,
        unique: true
      },
    firstName: String,
    lastName: String,
    party: String
}, { timestamps: true })

memberSchema.statics.format = (member) => {
  return{
    id: member._id,
    firstName: member.firstName,
    lastName: member.lastName,
    party: member.party,
    vaskiPersonId: member.vaskiPersonId
  }
}

const Member = mongoose.model('Member', memberSchema)


module.exports = Member