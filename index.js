'use strict'

const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')  
const ProgressBar = require('progress')

const wrongURLs = []

async function downloadImage (dir, url) {  

    console.log('Connecting …')
    const { data, headers } = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
    const totalLength = headers['content-length']
  
    console.log('Starting download')
    const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(totalLength)
      })
  
    const writer = Fs.createWriteStream(
      Path.resolve(__dirname, dir, url.split('/').pop())
    )
  
    data.on('data', (chunk) => progressBar.tick(chunk.length))
    data.pipe(writer)
    
}

async function getImageUrls () {
  const url = 'http://localhost:9090'

  const res = await Axios.get(`${url}/collections?is_popular=true`)
  res.data.data.results.map(d => {
    if (!Fs.existsSync(`images/${d.contract_id}`)){
      Fs.mkdirSync(`images/${d.contract_id}` );
    }
  })

  return res.data.data.results
}

async function main() {

  const res = await getImageUrls()
  const contract_id = 'cartel.neartopia.near'

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  // for(let i = 0; i < res.length; i++) { 
  // }
  const tokens = await Axios.get(`http://localhost:9090/tokens?nft_contract_id=${contract_id}&__limit=10000`)
  const token = tokens.data.data.results
  for(let j = 0; j < token.length; j++) {
    try {
      await delay(3000)
      await downloadImage(`images/${contract_id}`, token[j].media_url)
    } catch (error) {
      wrongURLs.push(token[j].media_url)   
      console.error(`error:${error}`, token[j].media_url)     
    }
   }
  

  const file = Fs.createWriteStream('array.txt');
  file.on('error', function(err) { /* error handling */ });
  wrongURLs.forEach(function(v) { file.write(v + '\n'); });
  file.end();
}

async function readUrlsFromFile() {
  const contract_id = 'cartel.neartopia.near'
  const temp = []
  const text = Fs.readFileSync("array.txt").toString('utf-8');
  const textByLine = text.split("\n")

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  for(let i = 0; i < textByLine.length; i++) {
    try {
      await delay(3000)
      await downloadImage(`images/${contract_id}`, textByLine[i])
    } catch (error) {
      temp.push(textByLine[i])   
      console.error(`error:${error}`, textByLine[i])     
    }
  }

  const file = Fs.createWriteStream('array.txt');
  file.on('error', function(err) { /* error handling */ });
  temp.forEach(function(v) { file.write(v + '\n'); });
  file.end();

}

readUrlsFromFile()
// main()
