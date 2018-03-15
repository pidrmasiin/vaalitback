if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let mongoUrl = process.env.MONGODB_URI
console.log('mongoUrl', mongoUrl)

module.exports = {
  mongoUrl,
  port
}