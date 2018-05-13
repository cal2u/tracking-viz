const path = require('path')
const fs = require('fs')

/* global fs, path */
function loadFolder (folder, mapFunction, filterFunction) {
  return new Promise(function (resolve, reject) {
    // Check how many files/directories are in the folder
    console.log('Reading from: ' + folder)
    fs.readdir(folder, (err, files) => {
      if (err) reject(err)
      let toCheck = files.length
      let results = []
      // Add each regular file to the results list
      files.forEach(file => {
        let filepath = path.resolve(folder, file)
        fs.stat(filepath, function (err, stats) {
          if (err) {
            toCheck--
            reject(err)
          }
          if (!filterFunction || filterFunction(stats)) {
            results.push(mapFunction ? mapFunction(file) : file)
          }
          toCheck--
          // If all folder entries have been checked, return the results
          if (toCheck === 0) {
            resolve(results)
          }
        })
      })
    })
  })
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram (gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    window.alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader (gl, type, source) {
  const shader = gl.createShader(type)

  // Send the source to the shader object

  gl.shaderSource(shader, source)

  // Compile the shader program

  gl.compileShader(shader)

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    window.alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture (gl, image) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0
  const internalFormat = gl.RGBA
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    srcFormat, srcType, image)

  // WebGL1 has different requirements for power of 2 images
  // vs non power of 2 images so check if the image is a
  // power of 2 in both dimensions.
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // Yes, it's a power of 2. Generate mips.
    gl.generateMipmap(gl.TEXTURE_2D)
  } else {
    // No, it's not a power of 2. Turn of mips and set
    // wrapping to clamp to edge
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  }

  return texture
}

function isPowerOf2 (value) {
  return (value & (value - 1)) === 0
}
