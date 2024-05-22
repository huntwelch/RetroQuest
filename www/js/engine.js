import Render from '/js/render.js'
import Command from '/js/command.js'
import State from '/js/statemanager.js'
import Bar from '/js/controlbar.js'


class GameEngine {
  constructor() {
    this.layers = []
    this.ticker = 100
    this.lastMove = null
    this.changeQueue = []
    this.active = []
    this.modifiers = [17,18,91,93]

    State.loadcharacter()

    this.loadstate()
    this.applyall()
    this.setcontrols()
    this.animate()
  }

  loadstate() {
    const scene = State.scene
    this.layers = scene.layers.map((item) => {
      if (item.name in scene.zjust) {
        item.position.z = scene.zjust[item.name]
      }
      return item
    })
  }

  sortlayers() {
    const layers = this.layers.slice(0)

    if( State.character.visible ) {
      layers.push(State.character)
    }

    for( let npc in State.scene.npcs ) {
      npc = State.scene.npcs[npc]
      npc = State.loadcharacter(npc)
      layers.push(npc)
    }

    const zsort = (a, b) => {
      return a.position.z < b.position.z ? -1 : 1
    }

    layers.sort(zsort)
    return layers
  }

  applyall() {
    Render.layers = this.sortlayers()
  }

  applychanges() {
    if( !this.changeQueue.length ) return
    while( this.changeQueue.length ) {
      this.changeQueue.shift()()
    }
    this.loadstate()
  }

  animate() {
    const that = this

    setTimeout(() => { that.animate() }, this.ticker)

    if( State.state.paused ) return;

    State.updatetimes()
    this.applychanges()

    const animated = []
    for( let layer of this.layers ) {
      const application = State.scene.animations[layer.name]
      const patch = application ? that.applyanimation({ ...application, ...layer}) : layer
      animated.push(patch)
    }
    this.layers = animated
    for( let npc in State.scene.npcs ) {
      npc = State.scene.npcs[npc]
      npc = this.applyanimation(npc)
    }
    State.updatecharobj(this.applyanimation(State.character))
    this.tickers()
    this.applyall()
  }

  tickers() {
    for( const tickfunc in State.scene.tickers ) {
      this.changeQueue.push(State.scene.tickers[tickfunc])
    }
  }

  getanimation(what) {
    return what.animations[what.movingset][what.animation]
  }

  applyanimation(what) {
    if( what.random && !what.moving ) {
      what.moving = Math.floor(Math.random() * Math.floor(what.random)) == 1
    }

    if( !what.moving || !what.animation ) return what
      
    if( what == State.character ) {
      State.character.lastanimation = what.animation
    }
    const animation = this.getanimation(what)

    animation.current = 'current' in animation
      ? animation.current
      : what.current

    animation.width = 'width' in animation
      ? animation.width
      : what.width

    animation.current += 1
    if( animation.current > animation.frames.length-1 ) {
      animation.current = 0
    }
    if( typeof animation.frames[animation.current] == 'string' ) {
      switch(animation.frames[animation.current]) {
        case 'STOP':
          // Mildy hacky; only works on layer anims
          State.scene.animations[what.name].moving = false
          return { ...what, moving: false }
        case 'FUNC':
          // TODO normalize
          what.animation = null
          what.moving = false
          this.changeQueue.push(animation.endfunc || what.endfunc)
          return what
        case 'LOOP':
          animation.current = 0
      }
    }
    const fc = [ ...animation.frames[animation.current] ]
    if( typeof fc[0] == 'number' ) {
      animation.width = fc.shift()
    }
    what.content = fc
    if( animation.move ) {
      what = this.move(what, animation.move)
    }
    what.width = animation.width
    return what
  }

  applystill(what, still) {
    const _still = what.stills[still]
    what.content = _still.content
    what.width = _still.width
    what.moving = false
    what.animation = null
    this.move(what, _still.move)
    return what
  }

  getfeet(what, dest) {
    const width = what.width
    const height = what.height || what.content.length / width
    const footx = dest.x
    const footy = dest.y + height

    const feet = []
    for( let iter=0; iter<width; iter++ ) {
      feet.push([ footx + iter, footy])
    }
    return feet
  }

  impass(what, dest) {

    if( what.blockimmunity ) return false

    const foot_blocked = State.scene.foot_blocked
    const animation = this.getanimation(what)

    const width = what.width;
    const height = what.content.length / width;

    // Boundary
    if( dest.x < 0 || dest.y < 0 || 
        (dest.x + width) > Render.settings.width ||
        (dest.y + height) > Render.settings.height ) {
      return true
    }

    const feet = this.getfeet(what, dest);
    const overlap = feet.filter((n) => foot_blocked.indexOf(String(n)) !== -1)

    return !!overlap.length
  }

  zone(what) {
    const zones = State.zones;
    const feet = this.getfeet(what, what.position);

    let overlap;

    State.zonefloor()
    for( let zone of zones ) {
      overlap = feet.filter(function(n) {
        return zone.content.indexOf(String(n)) !== -1
      });
      if( overlap.length ) {
        this.changeQueue.push(State.scene.zoneactions[zone.name])
        zone.active = true
      }
    }
  }

  move(what, update) {                    
    const base = { ...what.position }

    // Dev tracking
    //if( what.moving && what == State.character ) {
    //  console.log(what.position)
    //}

    for( var k in update ) {
      base[k] = base[k] + update[k]
    }
    
    if( this.impass(what, base) ) {
      what.moving = false;
      what.animation = null;
      return what;
    }

    what.position = base
    this.zone(what)

    return what
  }

  updatecontrol(move, whom=null) {
    const c = whom ? whom : State.character
    move = move == this.lastMove ? null : move
    this.lastMove = move
    c.animation = move
    c.moving = !!move
    return false
  }

  setcontrols() {
    const that = this
    window.addEventListener("keydown", (event) => {
      if( that.modifiers.includes(event.keyCode)) {
        that.active.push(event.keyCode) 
      }
      if( that.active.length ) return
      let move = null
      switch(event.keyCode) {
        case 37:
          move = 'left'
          break
        case 38:
          move = 'up'
          break
        case 39:
          move = 'right'
          break
        case 40:
          move = 'down'
          break
        default:
          Command.key(event)
      }
      if( !State.character.canmove ) return
      if( move ) {
        that.updatecontrol(move)
      }
    })


    window.addEventListener("keyup", (event) => {
      if( that.modifiers.includes(event.keyCode) ) {
        that.active = that.active.filter((v) => v != event.keyCode)
      }
    })

    const mc = new Hammer(document.getElementById('gameCanvas'))
    
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL })
    mc.on("panleft panright panup pandown tap doubletap press", (event) => {
      let move = null
      switch(event.type) {
        case 'panleft':
          move = 'left'
          break
        case 'panup':
          move = 'up'
          break
        case 'panright':
          move = 'right'
          break
        case 'pandown':
          move = 'down'
          break
        case 'press':
        case 'doubletap':
          Command.prompter()
          break
        case 'tap':
          Command.key({ keyCode: 27 })
      }
      if( !State.character.canmove ) return
      if( move ) {
        that.updatecontrol(move)
      }
    })
  }
}

const Engine = new GameEngine()

export default Engine
