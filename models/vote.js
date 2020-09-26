const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema({
    kysymys: { type: mongoose.Schema.Types.ObjectId, ref: 'Kysymys' },
    vaskiVoteId: {
        type: String,
        unique: true
    },
    opinion: String,
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }
}, { timestamps: true })

voteSchema.statics.format = (vote) => {
  return{
    id: vote._id,
    nimi: vote.vaskiVoteId,
    kysymykset: vote.opinion,
    vastaukset: vote.member
  }
}

const Vote = mongoose.model('Vote', voteSchema)


module.exports = Vote