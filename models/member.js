const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const memberSchema = new mongoose.Schema({
    vaskiPersonId: {
        type: String,
        unique: true
      },
    firstName: String,
    lastName: String,
    party: String
}, { timestamps: true })

memberSchema.plugin(uniqueValidator);

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