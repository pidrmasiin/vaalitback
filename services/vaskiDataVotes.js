const axios = require('axios');
var parser = require('fast-xml-parser');
const util = require('util')
const VaskiUpload = require('../models/vaskiUpload')
const Member = require('../models/member')
const Kysymys = require('../models/kysymys')


const getNewVoting = async function () {
    try {
      // Dev
    // const vaskiUploadId = '5f37b8d5dab2f622c1ce4b44'
    const vaskiUploadId = '600723be24cf6333749f7530'
      const vaskiUpload = await VaskiUpload
        .findById(vaskiUploadId)
    let startValue = parseInt(vaskiUpload.lastVaskiId)
    let vaski;
    
    // console.log(util.inspect(vaski.data.rowData, {showHidden: false, depth: null}))

    // console.log(vaski)

    let voteType;
    let language;
      
    let vaskiVoteId = startValue
    
    while (voteType != 'hyväksyminen/hylkääminen' && language != '1') {
      const newVaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestys/rows?perPage=10&page=0&columnName=AanestysId&columnValue=${vaskiVoteId + 1}`)
      console.log(newVaski);
      
      if (newVaski.data.rowData.length) {
        vaski = newVaski
        vaskiVoteId = parseInt(vaskiVoteId) + 1
        voteType = vaski.data.rowData[0][12].split(" ").join("").toLowerCase()
        language = vaski.data.rowData[0][1]
      } else {
        break;
      }
    }
  
    const kysymys = vaski.data['rowData'][0][21]
    const selite = vaski.data['rowData'][0][15]
    const url = "https://www.eduskunta.fi/FI/vaski" + vaski.data['rowData'][0][32]
    const tunniste = vaski.data['rowData'][0][31]
    const vuosi = vaski.data['rowData'][0][2]

    console.log(vaski.data['rowData'][0]);
    
    const votes = await getVotes(vaskiVoteId)
    
    const partyVotes = await getPartiesVotes(vaskiVoteId)
    
    if (partyVotes.length == 0){
      return
    }
    

    const kysymys_model = {
      tunniste: tunniste,
      kysymys: kysymys,
      selitys: selite,
      url: url,
      puolueet: partyVotes,
      edustajat: votes,
      vuosi: vuosi,
      createdAt: Date.now(),
      disabled: true
    }

    let new_kysymys = new Kysymys(kysymys_model)
    new_kysymys = await new_kysymys.save()


    await VaskiUpload.findByIdAndUpdate(vaskiUploadId, {
      "lastVaskiId": vaskiVoteId
    })
    
    console.log('succes', new_kysymys);
    
        
  } catch(exception){
    console.log('VaskiData ' + exception.message);
  }
}

const getVotes = async function (voteId) {
  const firstVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=0&columnName=AanestysId&columnValue=${voteId}`)
  const secondVotes = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/SaliDBAanestysEdustaja/rows?perPage=100&page=1&columnName=AanestysId&columnValue=${voteId}`)

  let votes =  firstVotes.data['rowData'].concat(secondVotes.data['rowData'])
  let votesOut = votes.map(vote => {
    const out =  {
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
  const parties = [
    "Sosialidemokraattinen eduskuntaryhmä",
    "Perussuomalaisten eduskuntaryhmä",
    "Kansallisen kokoomuksen eduskuntaryhmä",
    'Vihreä eduskuntaryhmä',
    'Keskustan eduskuntaryhmä',
    'Vasemmistoliiton eduskuntaryhmä',
    'Ruotsalainen eduskuntaryhmä',
    "Kristillisdemokraattinen eduskuntaryhmä",
    'Liike Nyt -eduskuntaryhmä'
  ]
  const result = out.filter(party => parties.includes(party.nimi))
  return result
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
      return 'Liike Nyt -eduskuntaryhmä';
    case 'Kristdemokratiska riksdagsgruppen':
      return "Kristillisdemokraattinen eduskuntaryhmä";
    case 'Svenska riksdagsgruppen':
      return 'Ruotsalainen eduskuntaryhmä'
    case 'Vänsterförbundets riksdagsgrupp':
      return 'Vasemmistoliiton eduskuntaryhmä'
    case 'Centerns riksdagsgrupp':
      return 'Keskustan eduskuntaryhmä'
    case 'Gröna riksdagsgruppen':
      return 'Vihreä eduskuntaryhmä'
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