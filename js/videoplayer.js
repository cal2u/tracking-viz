class RectGL {
  constructor (gl) {
    this.gl = gl
    this.programInfo = this.getProgramInfo()
    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)
    this.createBuffers()
    this.assignAttributes()
    gl.bindVertexArray(null)
  }

  draw (rects) {
    this.gl.useProgram(this.programInfo.program)
    // Use our VAO
    this.gl.bindVertexArray(this.vao)

    for (let rect of rects) {
      let x = -1 + (rect.x / 960 * 2)
      let y = +1 - (rect.y / 540 * 2)
      let w = (rect.w / 960 * 2)
      let h = (rect.h / 540 * 2)
      // Now create an array of positions for the rectangle
      const positions = [
        x, y, 0.0,
        x + w, y, 0.0,
        x + w, y - h, 0.0,
        x, y - h, 0.0
      ]
      // Send data to this.positionBuffer
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW)
      // The index data is already loaded
      {
        const vertexCount = 5
        const type = this.gl.UNSIGNED_SHORT
        const offset = 0
        this.gl.drawElements(this.gl.LINE_STRIP, vertexCount, type, offset)
      }
    }
    // unbind the vao
    this.gl.bindVertexArray(null)

    this.gl.useProgram(null)
  }

  createBuffers () {
    this.positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)

    this.indexBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    const indices = [
      0, 1, 2, 3, 0 // rectangle
    ]
    // Now send the element array to GL
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), this.gl.STATIC_DRAW)
  }

  assignAttributes () {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3
      const type = this.gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      this.gl.enableVertexAttribArray(
        this.programInfo.attribLocations.vertexPosition)
    }
  }

  getProgramInfo () {
    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main(void) {
        gl_Position = aVertexPosition;
      }
    `
    // Fragment shader program
    const fsSource = `
      void main(void) {
        gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);
      }
    `

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    this.shaderProgram = initShaderProgram(this.gl, vsSource, fsSource)

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aTextureCoord and also
    // look up uniform locations.
    return {
      program: this.shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
      }
    }
  }
}

class VideoGL {
  constructor (gl, programInfo) {
    this.gl = gl
    this.programInfo = this.getProgramInfo(gl)

    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)

    this.createBuffers(gl)
    this.assignAttributes(gl,
      this.programInfo.attribLocations.vertexPosition,
      this.programInfo.attribLocations.textureCoord)

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    // Unbind the buffers
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  getProgramInfo (gl) {
    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      varying highp vec2 vTextureCoord;
      void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `

    // Fragment shader program
    const fsSource = `
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    let shaderProgram = initShaderProgram(gl, vsSource, fsSource)

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aTextureCoord and also
    // look up uniform locations.
    return {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
      },
      uniformLocations: {
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
      }
    }
  }

  createBuffers (gl) {
    // Create a buffer for the videos's vertex positions.
    this.positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)

    // Now create an array of positions for the video
    const positions = [
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]
    // Send data to this.positionBuffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // Now set up the texture coordinates for the faces.
    this.textureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer)

    const textureCoordinates = [
      // coordinates for a square
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0
    ]
    // Send data for this.textureCoordBuffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
      gl.STATIC_DRAW)

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.
    this.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    const indices = [
      1, 2, 3, 1, 3, 0 // video surface
    ]

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW)
  }

  assignAttributes (gl, positionLocation, textureLocation) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3
      const type = gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
      gl.vertexAttribPointer(
        positionLocation,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(
        positionLocation)
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer)
      gl.vertexAttribPointer(
        textureLocation,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(
        textureLocation)
    }
  }

  drawFrame (texture, rects) {
    // Tell WebGL to use our program when drawing
    this.gl.useProgram(this.programInfo.program)

    // Use our VAO
    this.gl.bindVertexArray(this.vao)

    // Specify the texture to map onto the faces.
    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0)

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

    // Tell the shader we bound the texture to texture unit 0
    this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0)
    {
      const vertexCount = 6
      const type = this.gl.UNSIGNED_SHORT
      const offset = 0
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset)
    }

    this.gl.bindVertexArray(null)
    this.gl.useProgram(null)
  }
}

class FPSCounter {
  constructor (n) {
    this.n = n
    this.frameTimes = new Array(n)
    this.numTicks = 0
    this.on = 0
  }

  reset () {
    this.on = 0
    this.numTicks = 0
  }

  getFPS () {
    if (this.numTicks === 0) return 0

    let firstFrame = this.on
    let lastFrame = (this.on + this.n - 1) % this.n
    let numFrames = this.n

    if (this.numTicks < this.n) {
      firstFrame = 0
      numFrames = this.on
    }

    let timeDiff = this.frameTimes[lastFrame].getTime() - this.frameTimes[firstFrame].getTime()
    return Math.round(numFrames / timeDiff * 1000, 2)
  }

  tick () {
    this.frameTimes[this.on] = new Date()
    this.on = (this.on + 1) % this.n
    this.numTicks++
  }
}

class VideoPlayer {
  constructor (canvas, imageFolder, annotations, getFrameUpdateCallback) {
    let self = this

    this.annotations = annotations
    this.fpsCounter = new FPSCounter(5)
    this.canvas = canvas
    this.imageFolder = imageFolder
    this.currentFrame = {
      'image': null,
      'frameNum': 0
    }
    this.buffering = true
    this.paused = false

    this.canvas.onclick = () => {
      self.toggle()
    }

    this.loadFrames().then(frames => {
      self.frames = frames
      if (getFrameUpdateCallback) {
        this.frameUpdateCallback = getFrameUpdateCallback(self.frames)
      }
      self.setFrame(0)
      self.playVideo()
    })

    this.gl = canvas.getContext('webgl2')
    console.log(this.gl.getParameter(this.gl.VERSION))

    this.videoGL = new VideoGL(this.gl)
    this.rectGL = new RectGL(this.gl)
  }

  getFPS () {
    return this.fpsCounter.getFPS()
  }

  setFrame (frameNum) {
    let self = this
    this.seekFrame = frameNum

    let image = this.frames[frameNum]
    // If the image is ready, it becomes our current image right now
    if (image.complete) {
      this.buffering = false
      this.currentFrame = {
        'image': image,
        'frameNum': frameNum
      }
      return
    }

    // Otherwise, it will become our current image once it has loaded.
    // (Assuming that it isn't replaced before then)
    this.buffering = true
    image.onload = function () {
      checkUpdate(image, frameNum)
    }

    function checkUpdate (image, frameNum) {
      if (self.seekFrame === frameNum) {
        self.currentFrame = {
          'image': image,
          'frameNum': frameNum
        }
        self.buffering = false
      }
    }
  }

  drawFrame () {
    this.videoGL.drawFrame(loadTexture(this.gl, this.currentFrame.image))
    if (this.currentFrame.frameNum < this.annotations.length) {
      this.rectGL.draw(this.annotations[this.currentFrame.frameNum])
    }

    this.fpsCounter.tick()
    if (this.frameUpdateCallback) {
      this.frameUpdateCallback(this.currentFrame.frameNum, this.fpsCounter.getFPS())
    }
  }

  playVideo () {
    let self = this
    if (!self.buffering) {
      let frameNum = self.currentFrame.frameNum
      let newFrame = (frameNum + 1) % self.frames.length
      self.currentFrame.frameNum = newFrame
      self.setFrame(newFrame)
      self.drawFrame()
    }
    if (!self.paused) {
      window.requestAnimationFrame(() => {
        self.playVideo()
      })
    }
  }

  pauseVideo () {
    this.paused = true
    this.fpsCounter.reset()
  }

  toggle () {
    this.paused = !this.paused
    if (!this.paused) {
      this.playVideo()
    }
  }

  loadFrames () {
    console.log('loading frames')
    return loadFolder(this.imageFolder, file => {
      let filepath = path.resolve(this.imageFolder, file)
      let image = new Image()
      image.src = 'file://' + filepath
      return image
    }).then(results => {
      results.sort((a, b) => { return a.src.localeCompare(b.src) })
      return results
    })
  }
}
