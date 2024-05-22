import holodeckart from '/js/art/holodeck.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'
import Engine from '/js/engine.js'
import geordi from '/js/geordi.js'

const Holodeck = {
  background: holodeckart.bg,
  items: [],
  foot_blocked: holodeckart.foot_block,
  layers: holodeckart.layers,
  zones: holodeckart.zones,

  state: {
    activated: false,
  },

  npcs: {
    geordi: geordi,
  },

  animations: {
    arch: {
      movingset: 'door',
      animation: 'opens',
      moving: false,
      width: 145,
      current: 0,
    },
  },

  zjust: {},

  timers: {},

  animationactions: {
    walk_geordi: () => {
      State.scene.animations.arch.moving = false
      if( State.scene.state.activated ) return false
      State.scene.state.activated = true
      State.layeralt('arch', 'open')
      Command.text("\"Computer, freeze program.\"")
      Engine.updatecontrol('down', State.scene.npcs.geordi)
      State.addscenetimer(10, () => {
        const geordi = State.scene.npcs.geordi
        geordi.moving = false
        geordi.animation = null
        State.characterstill('standing', geordi) 
        State.scene.animationactions.call_barclay()
      })
    }, 

    call_barclay: () => {
      const geordi = State.scene.npcs.geordi
      State.characteranimation('stuff', 'tapbadge', { endfunc: () => State.scene.animationactions.barclay_conversation() }, geordi)
    },
  
    barclay_conversation: () => {
      Command.text([
        "\"La Forge to Lieutenant Barclay.\"",
        "\"Barclay here, sir.\"",
        "\"How long have you been running the program in holodeck two?\"",
        "\"A few days, sir.\"",
        "\"Why?\"",
        "\"I was researching 21st century game theory and f-found an odd example of a recreation of late 20th century 'quest' games and I-I wanted to see how-\"",
        "\"I'm sure it's fascinating, Reg, but this holodeck is eating more than half our energy output. We can't even go to warp right now.\"",
        "\"Ah. Well. You see, commander-\"",
        "\"Wait a minute...\"",
        "\"Reg... is this program written in Javascript?\"",
        "\"Yes, sir.\"",
      ])
      State.addscenetimer(2, () => {
        State.characterstill('facepalm', State.scene.npcs.geordi)
        Command.text([
          "\"Reg...\"",
          "\"I don't think the programmer was very good, either, sir.\"",
        ])
      })
      State.addscenetimer(3, () => {
        State.characterstill('standing', State.scene.npcs.geordi)
        Command.text([
          "\"Okay Reg, just don't do it again. Wait until you're at a research station with the proper resources.\"",
          "\"Yes, sir. Sorry, sir.\"",
          "\"La Forge out.\"",
          "\"Computer, end program.\"",
        ])
      })    
      State.addscenetimer(4, () => {
        State.characteranimation('death', 'dissolved', {
          endfunc: () => {
            State.character.dead = true
            State.scene.animationactions.wrap_up()
          }
        })
      })
    },

    wrap_up: () => {
      Command.text("\"Goddammit.\"")
      State.scene.npcs.geordi.movingset = 'basic_walk'
      Engine.updatecontrol('up', State.scene.npcs.geordi)
      State.addscenetimer(3, () => {
        State.layeranimation('arch', {
          animation: 'closes',
        })
      })
      State.addscenetimer(10, () => {
        Command.text([
          "\"La Forge to captain.\"",
          "\"Go ahead.\"",
          "\"Permission to beam Lieutenant Barclay to the nearest moon.\"",
          "\"Granted.\"",
          "\"Thank you, sir.\"",
        ])
      })
      State.addscenetimer(15, () => {
        State.scene.npcs.geordi.moving = false
        State.layeralt('arch', 'closed')
        Command.text([
          "Well, that's a slap and a tickle.",
          "You managed to not only die, but to never have existed at all.",
          "You have to piss off God something fierce to get those terms.",
          "Also, Geordi's probably going to delete you.",
        ])
        State.state.caninput = true
      })
    },
  },

  zonestate: {},

  zonedefaults: {},

  zoneactions: {
    activate: () => {
      Engine.updatecontrol('up')
      State.character.canmove = false
      State.state.caninput = false
      State.layeranimation('arch', {
        animation: 'opens',
        endfunc: () => { State.scene.animationactions.walk_geordi() },
      }) 
    },
    exit_holodeck: () => {
      State.charpos = State.state.holoexit.position.update
      State.location = State.state.holoexit.location
      State.contentframe(State.state.holoexit.position.direction)
      State.character.lastanimation = null
      State.character.moving = false
      Engine.lastMove = null
    }
  },

  character_actions: {
    'LOOKAT': {
      'DOOR': "It appears to run on some kind of electricity.",
      'ARCH': "DOOR",
      'ROOM': "I mean, what are you looking for? Black room. Yellow grid.",
      'GRID': "Yellow. Seriously. Get out of here.",
    },
  },

  description: "You're in a strange room with a yellow grid. A metal doorway is in front of you. You get the strong impression you should not be here.",
}

export default Holodeck
