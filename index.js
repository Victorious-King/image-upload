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

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  res.map(async d => {
    await delay(1000)
    await d['tokens'].map(async t => {
      await delay(1000)
      try {
        await downloadImage(`images/${d.contract_id}`, t.media_url)
      } catch (error) {
        console.error(error)
        wrongURLs.push(t.media_url)        
      }
    })
  })

  var file = Fs.createWriteStream('array.txt');
  file.on('error', function(err) { /* error handling */ });
  wrongURLs.forEach(function(v) { file.write(v.join(', ') + '\n'); });
  file.end();
}

main()
