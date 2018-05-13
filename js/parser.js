/* globals fs */

fs.readFileAsync = require('util').promisify(fs.readFile)

function parseIOU (line) {
  let fields = line.split(',')

  return {
    frame: parseInt(fields[1]),
    id: parseInt(fields[0]),
    x: Number(fields[2]),
    y: Number(fields[3]),
    w: Number(fields[4]),
    h: Number(fields[5])
  }
}

function parseDPM (line) {
  let fields = line.split(',')

  return {
    frame: parseInt(fields[0]),
    id: parseInt(fields[1]),
    x: Number(fields[2]),
    y: Number(fields[3]),
    w: Number(fields[4]),
    h: Number(fields[5])
  }
}

function handleLine (parsedLine, frames, currentFrame) {
  let frameTracks = null
  if (parsedLine.frame <= currentFrame) {
    frameTracks = frames[parsedLine.frame - 1]
  } else if (isNaN(parsedLine.frame)) {
    // Asume the file ends on a newline
    return
  } else {
    while (currentFrame !== parsedLine.frame) {
      currentFrame++
      frames.push([])
    }
    frameTracks = frames[currentFrame - 1]
  }

  frameTracks.push(parsedLine)

  return currentFrame
}

function parseAnnotations (filepath, parser) {
  let currentFrame = 0
  let frames = []
  let text = fs.readFileSync(filepath, 'ascii')
  console.log('Loaded file')

  let lines = text.split('\n')
  console.log(lines.length)
  for (let i = 0; i < lines.length; i++) {
    let parsedLine = parser(lines[i])
    currentFrame = handleLine(parsedLine, frames, currentFrame)
  }
  return frames
}
