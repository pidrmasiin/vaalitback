
const mongoose = require('mongoose')

const vaskiUploadSchema = new mongoose.Schema({
  searchedData: String,
  lastVaskiId: String,
}, { timestamps: true })

vaskiUploadSchema.statics.format = (vaskiUpload) => {
  return {
    id: vaskiUpload.id,
    searchedData: vaskiUpload.searchedData,
    lastVaskiId: vaskiUpload.lastVaskiId,
    createdAt: vaskiUpload.createdAt
  }
}

const vaskiUpload = mongoose.model('VaskiUpload', vaskiUploadSchema)


module.exports = vaskiUpload