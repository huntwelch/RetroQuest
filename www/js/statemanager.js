import state from '/js/state.js'
import items from '/js/items.js'
import scenes from '/js/scenes.js'
import stills from '/js/stills.js'
import Engine from '/js/engine.js'
import { deepclone, deepmerge, holoreturn } from '/js/utils.js'

class StateManager {
  constructor(state, scences, items) {
    this.state = state
    this.scenes = scenes
    this.items = items
  }

  get all() {
    return this.state
  }

  get character() {
    return this.state.characters[this.state.current_character]
  }

  set character(whom) {
    this.state.current_character = whom
  }

  updatecharobj(obj) {
    this.state.character = obj
  }

  get charpos() {
    return this.character.position
  }

  set charpos(update) {
    if( update.y && !update.z ) {
      update.z = update.y + this.character.height
    }
    this.character.position = {
      ...this.charpos,
      ...update,
    }
  }

  get blocked() {
    return !this.state.caninput
  }

  set blocked(bool) {
    this.state.caninput = !bool
  }

  get mobile() {
    return this.character.canmove
  }

  set mobile(bool) {
    this.character.canmove = bool
  }

  have(what) {
    return this.inventory.includes(what)
  }

  get inventory() {
    return this.state.characters[this.state.current_character].inventory
  }

  set inventory(items) {
    this.state.characters[this.state.current_character].inventory = items
  }

  set location(place) {
    this.state.current_location = place
  }

  get scene() {
    return this.state.locations[this.state.current_location].scene
  }

  set scene(scene) {
    this.state.locations[this.state.current_location].scene = scenes[scene]
  }

  get still() {
    return this.state.still
  }

  set still(what) {
    this.state.still = stills[what]
    this.state.paused = !!what
  }

  get actions() {
    let actions = {}
    for( let item of this.inventory ) {
      if( !items[item] ) continue
      actions = {
        ...actions,
        ...items[item].actions,
      }
    }

    actions = {
      ...actions,
      ...this.scene.character_actions,
    }

    for( let key in actions ) {
      let action = actions[key]
      if( typeof action === 'string' ) {
        actions[key] = actions[action]
      }
    }

    return actions
  }

  set charactermovingset(what) {
    const c = this.character
    const current = c.currentoverride !== null
      ? c.currentoverride
      : c.animations[c.movingset][c.lastanimation].current

    c.currentoverride = null

    c.content = c.art.animations[what][c.lastanimation][current]
    c.animations[what][c.lastanimation].current = current
    c.width = c.animations[what][c.lastanimation].width
    c.movingset = what
  }

  characterstill(what, whom=null) {
    whom = whom ? whom : this.character
    whom.content = whom.art.stills[what].content
    whom.width = whom.art.stills[what].width
  }

  characteranimation(category, animation, data=null, whom=null) {
    whom = whom ? whom : this.character

    whom.animations[category][animation] = {
      ...whom.animations[category][animation],
      ...data,
    }

    const animobj = whom.animations[category][animation]
    whom.moving = true
    whom.canmove = false
    whom.content = animobj.frames[0]
    whom.width = animobj.width
    whom.movingset = category
    whom.animation = animation
  }

  findlayer(name) {
    return this.scene.layers.filter((item) => item.name == name)[0]
  }

  layeralt(name, alt) {
    const layer = this.findlayer(name)
    layer.content = layer.alts[alt]
    Engine.loadstate()
  }

  layeradjust(name, adjustments) {
    const layer = this.findlayer(name)
    for( const adj in adjustments ) {
      layer[adj] = adjustments[adj]
    }
    Engine.loadstate()
  }

  get zones() {
    return this.scene.zones
  }

  zonefloor() {
    this.scene.zonestate = { ...this.scene.zonedefaults }
  }

  updatezone(key, value) {
    this.scene.zonestate[key] = value
  }

  loadcharacter(whom=null) {
    whom = whom ? whom : this.character
    for( let set in whom.animations ) {
      for( let animation in whom.animations[set] ) {
        whom.animations[set][animation].frames = whom.art.animations[set][animation]
      }
    }
    for( let still in whom.stills ) {
      whom.stills[still] = {
        ...whom.art.stills[still],
        ...whom.stills[still],
      }
    }
    return whom
  }

  layeranimation(layer, data) {
    this.scene.animations[layer] = {
      ...this.scene.animations[layer],
      current: 0,
      moving: true,
      ...data,
    }
    Engine.loadstate()
  }

  addscenetimer(time, func) {
    this.scene.timers[this.scene.time + time] = func
  }

  timeincrement(obj, variable) {
    const v = variable ? variable : 'time' 
    obj[v] = obj[v] ? obj[v] + 1 : 1
  }

  updatetimes() {
    this.state.time += 1
    this.timeincrement(this.scene)
    for( let zone of this.zones ) {
      if( zone.active ) {
        this.timeincrement(zone)
        this.timeincrement(zone, 'nowtime')
      } else {
        zone.nowtime = 0
      }
    }
    this.timeincrement(this.character)

    if( this.scene.time in this.scene.timers ) {
      this.scene.timers[this.scene.time]()
      delete this.scene.timers[this.scene.time]
    }
  }

  take(what) {
    if( !this.scene.items.includes(what) ) return false

    this.scene.items = this.scene.items.filter(item => item !== what)
    this.inventory.push(what)
    return true
  }

  leave(what) {
    if( !this.have(what) ) return false
    this.inventory = this.inventory.filter(item => item !== what)
    this.scene.items.push(what)
    return true
  }

  destroy(what) {
    this.inventory = this.inventory.filter(item => item !== what)
    this.scene.items = this.scene.items.filter(item => item !== what)
    return true
  }

  save() {
    const saved = deepclone(State.state)
    for( let place in saved.locations ) {
      const scene = saved.locations[place].scene
      delete scene.background
      delete scene.layers
      delete scene.zones
      delete scene.foot_blocked
      delete scene.character_actions
    }
    for( let person in saved.characters ) {
      const character = saved.characters[person]
      delete character.art
      delete character.animations
    }
    const savename = 'temptest' 
    localStorage.setItem(savename, JSON.stringify(saved))
  }

  load() {
    const savename = 'temptest' 
    const saved = JSON.parse(localStorage.getItem(savename))
    this.state = deepmerge(this.state, saved)
    Engine.loadstate()
  }

  contentframe(direction) {
    this.character.width = this.character.art.animations[this.character.movingset][direction][0][0]
    this.character.content = this.character.art.animations[this.character.movingset][direction][0]
  }

  get woodspath() {
    return this.state.woodspath || '' 
  }

  set woodspath(dir) {
    if( !dir ) { 
      this.state.woodspath = null
    }
    this.state.woodspath = `${this.state.woodspath || ''}${dir}`
  }

  enterholodeck() {
    this.state.holoexit = holoreturn(this.character, this.state.current_location)
    this.location = 'holodeck'  
    this.charpos = { x: 154, y: 150 }
    this.character.moving = false
    this.contentframe('up')
    Engine.lastMove = null
  }
}

const State = new StateManager(state, scenes, items)

export default State
