const axios = require('axios');
var parser = require('fast-xml-parser');
const util = require('util')



const getSpeaks = async function () {
    try {
    let startValue = 143631
    let vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)
    
        //  console.log(util.inspect(data, {showHidden: false, depth: null}))

    let i = vaski.data.rowCount
    while (i > 99) {
        startValue = startValue + 30
        vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)
        i = vaski.data.rowCount
    }
    
    let rowId = vaski.data.rowData.length
    let puheenvuorot;
    let data;
    while (rowId > 0) {
        data = parser.parse(vaski.data.rowData[rowId - 1][1]);
        try {
            puheenvuorot = data["ns11:Siirto"]['SiirtoAsiakirja']['RakenneAsiakirja']["ptk:PoytakirjaAsiakohta"]["vsk:Asiakohta"]["vsk:KeskusteluToimenpide"]["vsk:PuheenvuoroToimenpide"]
            break;
        } catch {
        }
        rowId--;
        if(rowId == 1) {
            startValue = startValue - 100
            vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)
            rowId = vaski.data.rowData.length
        }
    }


    const aihe = data["ns11:Siirto"]['SiirtoAsiakirja']['RakenneAsiakirja']["ptk:PoytakirjaAsiakohta"]["vsk:Asiakohta"]['vsk:KohtaNimeke']['met1:NimekeTeksti']
    let random = puheenvuorot[Math.floor(Math.random() * puheenvuorot.length)];

    if (!random) {
        random = puheenvuorot[Math.floor(Math.random() * puheenvuorot.length)];
    }

    let puhe = random['vsk:PuheenvuoroOsa']['vsk:KohtaSisalto']["sis:KappaleKooste"][Math.floor(Math.random() * puheenvuorot.length)]
    
    if(!puhe) {
        puhe = random['vsk:PuheenvuoroOsa']['vsk:KohtaSisalto']["sis:KappaleKooste"][Math.floor(Math.random() * puheenvuorot.length)]
    }
    
    
    const puhuja = Object.values(random["met:Toimija"]["org:Henkilo"]).join(' ')

    const speak = {
        aihe: aihe,
        puhe: puhe,
        puhuja: puhuja
    }

    console.log('speak', speak);
    return speak
  } catch(exception){
    console.log('VaskiData ' + exception.message);
  }
}

module.exports = {
    getSpeaks
  }