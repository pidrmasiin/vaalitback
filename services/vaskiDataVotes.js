const axios = require('axios');
var parser = require('fast-xml-parser');
const util = require('util')
const VaskiUpload = require('../models/vaskiUpload')
const Member = require('../models/member')

const getNewVoting = async function () {
    try {
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
        vaski = newVaski
        vaskiVoteId = parseInt(vaskiVoteId) + 1
        voteType = vaski.data.rowData[0][12].split(" ").join("").toLowerCase()
      } else {
        break;
      }
      console.log('T*M*', vaski.data)
    }

    await VaskiUpload.findByIdAndUpdate(vaskiUploadId, {
      "lastVaskiId": vaskiVoteId
    })
  
    const kysymys = vaski.data['rowData'][0][21]
    const url = "https://www.eduskunta.fi/FI/vaski" + vaski.data['rowData'][0][32]

    console.log('ksymys', kysymys);
    console.log('url', url);
    

    const votes = await getVotes(vaskiVoteId)
    
    const partyVotes = await getPartiesVotes(vaskiVoteId)
        
  } catch(exception){
    console.log('VaskiData ' + exception.message);
  }
}

const getVotes = async function (voteId) {
  const firstVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=0&columnName=AanestysId&columnValue=${voteId}`)
  const secondVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=1&columnName=AanestysId&columnValue=${voteId}`)

  let votes =  firstVotes.data['rowData'].concat(secondVotes.data['rowData'])
  let votesOut = votes.map(vote => {
    const member = getMember(vote)

    const out =  {
      member: member,
      kanta: translateOpinion(vote[6].trim()),
      nimi: vote[3] + vote[2] + "/" + translateParties(vote[5].trim())
    }

    return out
  })

  return votesOut
}

const getMember = async function (vote) {
  let member = await Member.findOne({'vaskiPersonId': vote[4].toString()})
  if (!member) {
    member = {
      'firstName': vote[2].trim(),
      'lastName': vote[3].trim(),
      'party': translateParties(vote[5].trim()),
      'vaskiPersonId': vote[4]
    }
    try{
      member = new Member(member)
      member = await member.save()
    } catch (exception) {
      console.log(exception)
    }
  }
  return member
}

getPartiesVotes = async (voteId) => {
  const partiesVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysJakauma/rows?perPage=10&page=0&columnName=AanestysId&columnValue=${voteId}`)
  let out = partiesVotes.data['rowData'].map(data => {
    let puolue = {
      jaa: Number(data[3]),
      ei: Number(data[4]),
      tyhjia: Number(data[5]),
    }
    puolue.kanta = Object.keys(puolue).reduce((a, b) => (puolue[a] > puolue[b] ? a : b)).trim()
    puolue.poissa = Number(data[6])
    puolue.nimi = translateGroups(data[2].trim())
    puolue.yhteensa = Number(data[7])
    return puolue
  })
  return out
}

translateOpinion = (op) => {
  switch (op) {
    case 'Frånvarande':
      return 'poissa';
    case 'Ja':
      return 'jaa';
    case 'Nej':
      return 'ei'
    case 'Blanka':
      return 'tyhja'
    default:
      return op;
  }
}


translateParties = (party) => {
  switch (party) {
    case 'vänst':
      return 'vas';
    case 'saml':
      return 'kok';
    case 'saf':
      return 'ps'
    case 'gröna':
      return 'vihr'
    case 'cent':
      return 'kesk'
    case 'sv':
      return 'r'
    default:
      return party;
  }
}

translateGroups = (party) => {
  switch (party) {
    case 'Liike Nyt-rörelsens riksdagsgrupp':
      return 'Liike Nyt -eduskuntaryhmä"';
    case 'Kristdemokratiska riksdagsgruppen':
      return "Kristillisdemokraattinen eduskuntaryhmä";
    case 'Svenska riksdagsgruppen':
      return 'Ruotsalainen eduskuntaryhmä'
    case 'Vänsterförbundets riksdagsgrupp':
      return 'Vasemmistoliiton eduskuntaryhmä'
    case 'Centerns riksdagsgrupp':
      return 'Keskustan eduskuntaryhmä'
    case 'Gröna riksdagsgruppen':
      return 'Vihreä eduskuntaryhmä"'
    case 'Samlingspartiets riksdagsgrupp':
      return "Kansallisen kokoomuksen eduskuntaryhmä";
    case 'Sannfinländarnas riksdagsgrupp':
      return "Perussuomalaisten eduskuntaryhmä"
    case 'Socialdemokratiska riksdagsgruppen':
      return "Sosialidemokraattinen eduskuntaryhmä"
    default:
      return party;
  }
}

module.exports = {
    getNewVoting
  }