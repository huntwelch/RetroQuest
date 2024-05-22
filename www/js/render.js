import State from '/js/statemanager.js'
import settings from '/js/settings.js'

class Renderer {
  constructor(settings) {
    this.pixelSize = 6
    this.sceneWidth = 320
    this.lastrender = null
    this.layerset = []
    this.canvas = document.getElementById(settings.canvasId)
    this.ctx = this.canvas.getContext('2d')
    this.settings = settings
    this.resize()
    this.frame()
  }

  frame() {
    window.requestAnimationFrame(this.draw.bind(this))
  }

  set layers(layers) {
    this.layerset = layers
    this.frame()
  }

  setscale() {
    return 3
  }

  resize() {
    const pixelRatio = this.setscale()
    
    const width = Math.round(this.settings.width * this.pixelSize / pixelRatio)
    const height = Math.round(this.settings.height * this.pixelSize / pixelRatio)

    this.canvas.width = width * pixelRatio
    this.canvas.height = height * pixelRatio
  }

  drawPixel(cx, cy, rgb) {
    this.ctx.fillStyle = `rgb(${rgb})`
    this.ctx.fillRect(cx, cy, this.pixelSize, this.pixelSize)
  }
  
  compose(below, above) {
    const _below = [ ...below ]
    let x = 0
    let y = above.position.y
    let pos = 0

    const conts = this.decompress([ ...above.content ])

    for( let pixel of conts ) {
      pos = above.position.x + y*this.settings.width + x
      x = ++x % above.width
      y += !x
      if( !pixel ) continue
      _below[pos] = pixel 
    }
    return _below
  }

  decompress(compressed) {
    let decompressed = []
    for( let index in compressed ) {
      if( typeof compressed[index] == 'number' ) continue
      const spec = compressed[index].split('-')
      if( spec.length == 1 ) {
        decompressed.push(spec[0])
        continue
      }
      Array.prototype.push.apply(decompressed, new Array(Number(spec[1])).fill(spec[0])) 
    }
    return decompressed
  }

  draw() {
    let display = this.decompress([ ...State.scene.background ])
    if( State.scene.blackout ) {
      display.fill('0,0,0')
    } else if( State.still ) {
      display = this.decompress([ ...State.still ])
    } else {
      for( let layer of this.layerset ) {
        const layerparse = layer.name.split('_')
        if( layerparse[0] == 'ITEM' && !State.scene.items.includes(layerparse[1]) ) continue
        display = this.compose(display, layer)
      }
    }
    for(
      let i=0, x=0, y=0;
      i < display.length;
      i++, x = ++x % this.settings.width, y += !x
    ) {
        const _pixel = display[i]
        if( this.lastrender && _pixel == this.lastrender[i] ) continue
        this.drawPixel(x*this.pixelSize, y*this.pixelSize, _pixel)
    }
    this.lastrender = display
  }
}

const Render = new Renderer(settings)

export default Render
