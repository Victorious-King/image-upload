'use strict'

const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')  
const ProgressBar = require('progress')

async function downloadImage () {  
  const url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true'

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
    Path.resolve(__dirname, 'images', 'code.jpg')
  )

  data.on('data', (chunk) => progressBar.tick(chunk.length))
  data.pipe(writer)
}

downloadImage()  