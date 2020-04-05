var schedule = require('node-schedule');
const Twit = require('twit');

 
var twitterBot = schedule.scheduleJob('42 * * * *', function(){
    const T = new Twit({
      consumer_key: process.env.APPLICATION_CONSUMER_KEY_HERE,
      consumer_secret: process.env.APPLICATION_CONSUMER_SECRET_HERE,
      access_token: process.env.ACCESS_TOKEN_HERE,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET_HERE
    });
    
    // start stream and track tweets
    const stream = T.stream('statuses/filter', {track: '#JavaScript'});

    // event handler
    stream.on('tweet', tweet => {
      T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
        console.log(data)
      })
    });
});

module.exports = {
    twitterBot
  }