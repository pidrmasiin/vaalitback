const axios = require('axios');
var parser = require('fast-xml-parser');
const util = require('util')
const VaskiUpload = require('../models/vaskiUpload')
const Member = require('../models/member')

const getNewVoting = async function () {
    try {
      console.log('haloo');
      
      const vaskiUploadId = '5f3834d3354d1a567d62dba9'
      const vaskiUpload = await VaskiUpload
        .findById(vaskiUploadId)
    let startValue = parseInt(vaskiUpload.lastVaskiId)
    let vaski;
    
    // console.log(util.inspect(vaski.data.rowData, {showHidden: false, depth: null}))

    console.log(vaski)

    let voteType;

    let vaskiVoteId = startValue
    while (voteType != 'hyväksyminen/hylkääminen') {
      const newVaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestys/rows?perPage=10&page=0&columnName=AanestysId&columnValue=${vaskiVoteId + 1}`)
      console.log(newVaski.data.rowData);
      
      if (newVaski.data.rowData.length) {
        console.log('haloo');
        
        vaski = newVaski
        vaskiVoteId = parseInt(vaskiVoteId) + 1
        voteType = vaski.data.rowData[0][12].split(" ").join("").toLowerCase()
      } else {
        break;
      }
      console.log(vaski.data)
    }

    await VaskiUpload.findByIdAndUpdate(vaskiUploadId, {
      "lastVaskiId": vaskiVoteId
    })
  
    console.log('done', vaskiVoteId);

    const votes = getVotes(vaskiVoteId)




        
  } catch(exception){
    console.log('VaskiData ' + exception.message);
  }
}

const getVotes = async function (voteId) {
  const firstVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=0&columnName=AanestysId&columnValue=${voteId}`)
  const secondVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=1&columnName=AanestysId&columnValue=${voteId}`)

  const votes =  firstVotes.data['rowData'].concat(secondVotes.data['rowData'])
  console.log('votes', Array.isArray(votes));
  votes.forEach(vote => saveMemberVotes(vote))
}

const saveMemberVotes = async function (vote) {
  console.log('vote', vote[4]);

  let member = await Member.findOne({'vaskiPersonId': vote[4].toString()})

  if (member) {
    console.log('present');
    
  } else {
    member = {
      'firstName': vote[2],
      'lastName': vote[3],
      'party': vote[5].trim(),
      'vaskiPersonId': vote[4]
    }
    try{
      member = new Member(member)
      member = await member.save()
    }catch (exception) {
      console.log(exception)
    }
  }
}

module.exports = {
    getNewVoting
  }