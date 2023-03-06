var schedule = require('node-schedule');
const Twit = require('twit');
const vaskiData = require('./vaskiData')
const vaskiDataVotes = require('../services/vaskiDataVotes')
 
var twitterBot = schedule.scheduleJob('10 4 1,5,10,15,20,25,28 * * *', function(){
    const twitSecrets = {
        consumer_key: process.env.APPLICATION_CONSUMER_KEY_HERE,
        consumer_secret: process.env.APPLICATION_CONSUMER_SECRET_HERE,
        access_token: process.env.ACCESS_TOKEN_HERE,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET_HERE
    }

    const T = new Twit(twitSecrets);

    tweetGeneralSpeaks(T)
});

// schedule.scheduleJob('10 4,12,16 * * *', function(){
//     const makelaSecrets = {
//         consumer_key: process.env.MAKELA_CONSUMER_KEY_HERE,
//         consumer_secret: process.env.MAKELA_CONSUMER_SECRET_HERE,
//         access_token: process.env.MAKELA_TOKEN_HERE,
//         access_token_secret: process.env.MAKELA_TOKEN_SECRET_HERE
//     }
          
//     const makela = new Twit(makelaSecrets);

//     tweetMakelaSpeaks(makela)
// });

schedule.scheduleJob('49 * * * *', function(){
    vaskiDataVotes.getNewVoting()
});


function tweetGeneralSpeaks(T) {
    T.get('account/verify_credentials', {
        include_entities: false,
        skip_status: true,
        include_email: false
    }, onAuthenticated)
    
    function onAuthenticated(err){
        if (err) {
            console.log(err)
            console.log(err.twitterReply.errors)
        } else {
            sendTweet()
        }
    }
    
    async function sendTweet(){
        const speak = await vaskiData.getSpeaks()
        const tweet = speak.puhe
        if (tweet.length < 10) {
            return;
        }
        let tweetRes;
        if(tweet.length < 281) {
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 280) })
        } else {
            const restTweets = tweet.slice(260).match(/.{1,260}/g)
            console.log('rest.tww', restTweets);
            
            let tweetCount = restTweets.length
            let index = 0
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 260) + ' 1/' + (tweetCount + 1) })
            while (index < tweetCount) {
                index++;
                tweetRes = await T.post('statuses/update', { 
                    status: `${restTweets[index - 1]} ${index + 1}/${tweetCount + 1} @${tweetRes.data.user.screen_name}`,
                    in_reply_to_status_id: tweetRes.data.id_str.toString()
                })
            }
        }

        const speakerRes = await T.post('statuses/update', { 
            status: `${speak.puhuja} @${tweetRes.data.user.screen_name}`,
            in_reply_to_status_id: tweetRes.data.id_str.toString()
        })
        T.post('statuses/update', { 
            status: `${speak.aihe} @${speakerRes.data.user.screen_name}`,
            in_reply_to_status_id: speakerRes.data.id_str.toString()
        })
        
    }
}

function tweetMakelaSpeaks(T) {
    T.get('account/verify_credentials', {
        include_entities: false,
        skip_status: true,
        include_email: false
    }, onAuthenticated)
    
    function onAuthenticated(err){
        if (err) {
            console.log(err)
            console.log(err.twitterReply.errors)
        } else {
            sendTweet()
        }
    }
    
    async function sendTweet(){
        const speak = await vaskiData.getMemberSpeaks('janimäkelä')
        const tweet = speak.puhe
        if (tweet.length < 10) {
            return;
        }
        let tweetRes;
        if(tweet.length < 281) {
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 280) })
        } else {
            const restTweets = tweet.slice(260).match(/.{1,260}/g)
            console.log('rest.tww', restTweets);
            
            let tweetCount = restTweets.length
            let index = 0
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 260) + ' 1/' + (tweetCount + 1) })
            while (index < tweetCount) {
                index++;
                tweetRes = await T.post('statuses/update', { 
                    status: `${restTweets[index - 1]} ${index + 1}/${tweetCount + 1} @${tweetRes.data.user.screen_name}`,
                    in_reply_to_status_id: tweetRes.data.id_str.toString()
                })
            }
        }

        const speakerRes = await T.post('statuses/update', { 
            status: `${speak.puhuja} @${tweetRes.data.user.screen_name}`,
            in_reply_to_status_id: tweetRes.data.id_str.toString()
        })
        T.post('statuses/update', { 
            status: `${speak.aihe} @${speakerRes.data.user.screen_name}`,
            in_reply_to_status_id: speakerRes.data.id_str.toString()
        })
        
    }
}

module.exports = {
    twitterBot
  }