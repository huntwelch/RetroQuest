class SoundController {
  sounds = [
    'thunder',
    'glassbreak',
  ]

  constructor() {
    // Preloads sounds and creates a function
    // by name for activtation
    for(const value of this.sounds) {
      this.attach(value) 
    }
  }

  attach(what) {
    const audio = new Audio('/sfx/' + what + '.mp3') 
    this[what] = ((audio) => () => { audio.play() })(audio) 
  }

  load(sounds) {
    for(const value of sounds) {
      this.attach(value) 
    }
  }
}


const Sound = new SoundController()

export default Sound
