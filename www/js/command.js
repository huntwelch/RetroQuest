import State from '/js/statemanager.js'
import items from '/js/items.js'
import Engine from '/js/engine.js'
import Konami from '/js/konami.js'
import Locale from '/js/locale.js'

class Commander {
  constructor() {
    this.command = ''
    this.cli = document.getElementById('command')
    this.textdisplay = null
    this.queue = []

    this.lookfail = Locale.lookfail
    this.generalfail = Locale.generalfail
    this.dead = Locale.dead
  }

  text(stack) {
    if( typeof stack === 'string' ) stack = [stack]
    for( const item of stack ) this._text(item)
  }

  // TODO remove use of keyCode; being deprecated
  key(e) {
    const kc = e.keyCode
    const inp = e.key

    const specialkeys = ['Enter', 'Escape', 'Backspace']
    if( Konami.active ) {
      specialkeys.push(Konami.key)
    }

    if( !/[a-zA-Z0-9-_ ]/.test(inp) 
     && specialkeys.indexOf(inp) < 0) {
      return
    }

    if( State.state.showtext ) {
      this.cleartext()
      return
    }

    if( State.blocked ) return

    // TODO this line could probably be cleaner
    if( kc == 32 || inp === Konami.key || (kc >= 48 && kc <= 90) || inp === '_' ) {
      this.commandinput(inp)
    }
    if( kc == 8 ) {
      this.backspace()
    }
    if( kc == 13 ) {
      this.execute()
    }
    if( kc == 27 ) {
      this.cancel()
    }
  }

  prompter() {
    const result = window.prompt()
    if( result ) {
      this.command = result.toUpperCase()
      this.execute()
    }
  }

  update() {
    this.cli.value = this.command.toLowerCase()
  }

  backspace() {
    this.command = this.command.slice(0, -1)
    this.update()
  }

  commandinput(inp) {
    this.cli.style.display = 'block'
    State.state.paused = true
    State.state.commanding = true
    this.command += inp.toLowerCase()
    this.update()
  }

  clearinput() {
    this.command = ''
    this.cli.style.display = 'none'
    this.update()
  }

  cancel() {
    this.clearinput()
    State.state.paused = false
    State.state.commanding = false
  }

  _text(what) {
    if( State.state.showtext ) {
      this.queue.push(what)
      return
    }

    if( !what ) return
    
    this.cleartext()

    this.textdisplay = document.createElement('div')
    this.textdisplay.id = 'text'
    this.textdisplay.innerHTML = what
    document.getElementById('textwrapper').appendChild(this.textdisplay)
    this.textdisplay.style.display = 'flex'
    State.state.paused = true
    State.state.showtext = true
  }

  cleartext() {
    if( !this.textdisplay ) return
    document.getElementById('textwrapper').removeChild(this.textdisplay)
    State.state.showtext = false
    this.textdisplay = null
    State.state.paused = false
    if( this.queue ) this._text(this.queue.shift())
  }

  // This is midly leveraged to handle
  // command translation
  synonym( word ) {
    if( Locale.INVENTORY.includes(word) ) {
      return 'INVENTORY'
    }
    if( Locale.TAKE.includes(word) ) {
      return 'TAKE'
    }
    if( Locale.LOOK.includes(word) ) {
      return 'LOOK'
    }
    if( Locale.SAVE.includes(word) ) {
      return 'SAVE'
    }
    if( Locale.LOAD.includes(word) ) {
      return 'LOAD'
    }
    return word
  }

  execute() {
    State.state.commanding = false

    if( !this.command.trim() ) {
      this.clearinput()
      State.state.paused = false
      return
    }

    const command = this.command.trim().toUpperCase().split(' ').filter((exists) => exists)

    if( Konami.active && command[0].indexOf(Konami.key) === 0 ) {
      State.state.paused = false
      this.clearinput()
      Konami.execute(command)
      return
    }
    const override = State.scene.overrideaction(command.join(' '))
    if( override && !State.character.dead) {
      this.clearinput()
      return this._text(override)
    }
    let first = this.synonym(command.shift())

    const base = 'cmd_' + first
    
    if( State.character.dead && base != 'cmd_LOAD') {
      const random = Math.floor(Math.random() * this.dead.length)
      this.clearinput()
      this._text(this.dead[random])
      return
    }

    const special = this.checkspecial(`${first} ${command.join(' ')}`.trim())

    if( !special && (base in this) ) {
      this[base](command)
    } else if( !special ) {
      this.fallback()
    }

    if( !State.state.showtext ) {
      State.state.paused = false
    }
    this.clearinput()
  }

  parsecommand(command) {
    switch( typeof command ) {
      case 'string':
        return this._text(command)
      case 'function':
        const result = command()
        Engine.loadstate()
        return this._text(result)
      default:
        throw 'No command'
    }
  }

  // TODO this override normal commands
  checkspecial(command) {
    //this.parsecommand(State.actions[command])
    try {
      this.parsecommand(State.actions[command])
      return true
    } catch(e) {
      console.log(e)
      return false
    }
  }

  checksubset(set, command) {
    if( typeof set[command] === 'string'
     && set[command] in set ) return set[set[command]]
    return set[command]
  }

  cmd_INVENTORY() {
    this._text(Locale.inventory(State.character.inventory, items))
  }

  cmd_LOOK(commands) {
    if( !commands.length || Locale.AROUND.includes(commands[0])) {
      const desc = State.scene.description
      const text = typeof desc == 'function' ? desc() : desc
      this._text(text)
      return
    }

    const category = 'LOOK' + commands.shift()
    const subject = commands.join(' ')

    if( Locale.LOOKAT.includes(category) && State.have(subject) ) {
      this.parsecommand(items[subject].description)
      return
    }

    try { 
      const command = this.checksubset(State.actions[category], subject)
      this.parsecommand(command)
    } catch(e) {
      this.fallback('LOOK')
    }
  }

  cmd_TAKE(commands) {
    const what = commands.join(' ')
    try {
      const command = this.checksubset(State.actions['TAKE'], what)
      this.parsecommand(command)
    } catch(e) {
      this.fallback('TAKE')
    }
  }

  cmd_SAVE(commands) {
    State.save()
    State.state.paused = false
    State.state.commanding = false
  }

  cmd_LOAD(commands) {
    State.load()
    State.state.paused = false
    State.state.commanding = false
  }

  fallback(type) {
    let responses = this.generalfail 
    switch(type) {
      case 'LOOK':
        responses = this.lookfail
        break
    }
    const random = Math.floor(Math.random() * responses.length)
    this._text(responses[random])
  }
}

const Command = new Commander()

export default Command
