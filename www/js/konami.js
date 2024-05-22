import State from '/js/statemanager.js'
import items from '/js/items.js'
import Engine from '/js/engine.js'

class KonamiCommander{
  constructor() {
    this.key = '>'
    this.active = true
  }

  execute(args) {
    const func = args.shift().slice(1)
    this[func](args)
  }

  HELP() {
    console.log(`
Commands

help\t\t\tshow this output
scenes\t\t\tlist scenes 
state\t\t\tshow current state in statemanager
travel <scene>\tput game in <scene>
pos <x> <y>\t\tset charpos to x y values

`)
  }

  STATE() {
    let statetext = ''
    for (const [key, value] of Object.entries(State.state)) {
      statetext = `${statetext}\n\t${key}: ${value}`
    }
    console.log(`
State

{${statetext}
}
`)
  }

  SCENES() {
    const scenes = Object.keys(State.scenes).sort()
    let scenetext = ''
    for( const scene of scenes) {
      scenetext = `${scenetext}\n${scene}`
    }
    console.log(`
Scenes
${scenetext}

`)
  }

  TRAVEL(where) {
    where = where[0].toLowerCase()
    if( !State.scenes[where] ) {
      console.log('No such place')
      return
    } 
    State.location = where

    // Need to kick the engine to rerender
    // the layers. This is largely obscured
    // in the other action execution patterns
    // so making a note of it here.
    Engine.loadstate()
  }

  POS(coords) {
    State.charpos = { x: Number(coords[0]), y: Number(coords[1]) }
  }
}

const Konami = new KonamiCommander()

export default Konami
