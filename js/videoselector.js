class VideoSelector {
  constructor (selectElement, fileElement, videosFolder) {
    this.selectElement = selectElement
    this.fileElement = fileElement
    this.videosFolder = videosFolder

    let self = this

    this.fileElement.addEventListener('change', e => {
      self.videosFolder = self.fileElement.value
      self.showVideoSelections()
    }, false)

    if (this.videosFolder) {
      this.showVideoSelections()
    }
  }

  showVideoSelections () {
    let self = this
    this.selectElement.innerHTML = ''
    loadFolder(this.videosFolder).then(videos => {
      videos.forEach(video => {
        let option = document.createElement('option')
        option.text = video
        option.value = video
        self.selectElement.add(option)
      })
    })
  }
}
