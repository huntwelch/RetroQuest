import firstroomart from '/js/art/firstroom.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'
import Engine from '/js/engine.js'

import Render from '/js/render.js'

const FirstRoom = {
  background: firstroomart.bg,
  items: ['JOURNAL', 'PEN', 'MATCHES'],
  foot_blocked: firstroomart.foot_block,
  layers: firstroomart.layers,
  zones: firstroomart.zones,
  time: 0,

  description: "It's your bedroom. Well, your girlfriend's, according to the lease. Sorry, ex-girlfriend's. The floor is gross, probably from the many times you've thrown up on it. There's a phone by the bookshelf, and dusty computer in the corner.",

  animations: {
    star: {
      movingset: 'lyingdown',
      animation: 'tailflick',
      moving: false,
      width: 15,
      current: 0,
      random: 50,
    }, 
  },

  zjust: {
    bed: 10,
    curtains: 9,
    vomit: 1,
  },

  timers: {
    4: () => {
      Command.text("You regain consciousness in a small puddle of vomit. Nothing strikes you as unusual.")
    }, 
  },

  state: {
    smoked: false,
    sawmatches: false,
    putout: false,
    slept: false,
    sleeping: false,
    standing: false,
    burneddown: false,
    computerplugged: false,
    computeron: false,
    nearbed: true,
    deskopen: false,
    onphone: false,
  },

  zonestate: {
    nearbed: true,
  },

  zonedefaults: {
    nearbed: true,
    nearcomputer: false,
    nearcat: false,
    neardesk: false,
    nearphone: false,
  },

  zoneactions: {
    to_kitchen: () => {
      State.location = 'jacob_kitchen'
      State.charpos = { x: 76 }
    },

    near_bed: () => {
      State.updatezone('nearbed', true)
    },
    near_desk: () => {
      State.updatezone('neardesk', true)
    },
    near_phone: () => {
      State.updatezone('nearphone', true)
    },
    near_computer: () => {
      State.updatezone('nearcomputer', true)
    },
    near_cat: () => {
      State.updatezone('nearcat', true)
    },
  },

  animationactions: {},

  overrideaction: (command) => {

    if( command == 'WAKE UP') {
       return State.scene.state.sleeping == true 
         ? "Okay, you can technically do that while sleeping, but generally not on command."
         : "You're already awake."
    }

    if( State.scene.state.sleeping ) return "You can't do that while you're sleeping"

    return false
  },

  character_actions: {
    'LOOKAT': {
      'CAT': "Morning Star lies on the bed. Judging the state of the room. Judging you.",
      'PHONE': "One of the last landline phones sits on the floor, plugged into the world's very last answering machine.",
      'COMPUTER': "Built by Charles Babbage, you're not sure this computer could do anything useful in the modern world, even if you had the motivation. It's unplugged anyway.",
      'POSTER': "Nothing like an Edvard Munch poster to set you apart from every other college dropout.",
      'ANSWERING MACHINE': "It is not blinking. Probably for the best.",
      'BED': "The bed is unkempt, but remarkably clean. You hardly ever make it that far across the room anyway.",
      'WINDOW': "The windows are shuttered. Mercifully, if your hangover's opinion counts for anything.",
      'VOMIT': "Green. Odd. You don't recall the last time you ate anything green.",
      'PUKE': 'VOMIT',
      'BOOKS': "You don't read much anymore. Best not to dwell on it.",
      'BOOKSHELF': 'BOOKS',
      'DESK': () => {
        if( !State.scene.state.deskopen ) {
          return "It's a desk. It has a drawer. It's cleanliness reflects your spartan philosophy. Or the fact you have nothing to do."
        } else {
          const draweritems = []
          if( State.scene.items.includes('JOURNAL') ) {
            draweritems.push('a journal') 
          }
          if( State.scene.items.includes('PEN') ) {
            draweritems.push('a pen') 
          }
          if( draweritems.length ) {
            const displayitems = draweritems.join(' and ')
            return `It's a desk. You see ${displayitems} in its drawer.`
          } else {
            return "It's an empty desk."
          }
        }
      },
      'DRAWER': 'DESK',
    },

    'LOOKUNDER': {
      'BED': () => {
        if( !State.scene.zonestate.nearbed ) {
          return "You're not close enough."
        }
        if( State.scene.items.includes('MATCHES') ) {
          State.scene.state.sawmatches = true
          return "A small civilization of dust bunnies has made its home under the bed. You can see a book of matches near the foot."
        } else {
          return "A small civilization of dust bunnies has made its home under the bed."
        }
      },
    },

    'TAKE': {
      'MATCHES': () => {
        if( !State.scene.state.sawmatches ) {
          return "What matches?"
        }
        if( !State.scene.zonestate.nearbed ) {
          return "You can't reach them."
        }
        return State.take('MATCHES')
          ? "Got em."
          : "You already have matches."
      },
      'JOURNAL': () => {
        if( State.have('JOURNAL') ) {
          return "You already have your creepy little journal."
        }
        if( !State.scene.state.deskopen ) {
          return "You don't see a journal."
        }
        if( !State.scene.zonestate.neardesk ) {
          return "You're not close enough."
        }
        State.take('JOURNAL')
        return "You take your journal. Don't get caught with it."
      },
      'PEN': () => {
        if( State.have('PEN') ) {
          return "You already have a pen."
        }
        if( !State.scene.state.deskopen ) {
          return "You don't see a pen."
        }
        if( !State.scene.zonestate.neardesk ) {
          return "You're not close enough."
        }
        State.take('PEN')
        return "One pen acquired, ready to stick in Jon Stewart's eye."
      },
      'BOOK': () => {
        return "Why? So you can better yourself? We're way past the point where rereading Notes from Underground is going to help anything. Well, we're always past that point, but you get it."
      }
    },
    
    'SLEEP': () => {
      if( State.scene.state.slept ) {
        return "I think you've slept long enough."
      }
      if( State.scene.state.smoked && !State.scene.state.putout ) {
        State.scene.blackout = true
        State.addscenetimer(30, () => {
          State.scene.blackout = false
          State.character.dead = true
          State.characterstill('skeleton')
          State.scene = 'burned_bedroom'
          Engine.loadstate()
          Engine.applyall()
          Command.text("Oops! Probably should have put out that cigarette. Your charred bones will provide brief entertainment to some local dogs, and few will mourn your unsurprising tumble off the mortal coil.")
        })
        State.scene.state.sleeping = true
        return "Zzzzzzzz"
      }
      if( State.scene.state.smoked ) {
        State.scene.blackout = true
        State.scene.state.sleeping = true
        State.addscenetimer(30, () => {
          State.scene.blackout = false
          State.scene.state.sleeping = false
          State.scene.state.slept = true
          Command.text("You awake very slightly more rested.")
        })
        State.scene.state.sleeping = true
        return "Zzzzzzzz"
      } else {
        return "You would try to sleep, but a crippling nicotine addiction needs tending to, which is probably why you woke up in the first place."
      }
    },

    'SMOKE': () => {
      if( !State.have('CIGARETTE') ) {
        return "You don't have anything to smoke"
      } else if( !State.have('MATCHES') ) {
        return "You stick the cigarette in your mouth and take a few drags. It's unsatisifying because you have nothing to light it with."
      } else {
        State.scene.state.smoked = true
        State.destroy('CIGARETTE')
        return "Mmm sweet sweet nicotine."
      }
    },
    'SMOKE CIGARETTE': 'SMOKE',
    'LIGHT CIGARETTE': 'SMOKE',
    'LIGHT MATCH': () => {
      return "No, use the match to light something else."
    },

    'LIGHT CIGARETTE WITH MATCH': 'SMOKE',
    'USE MATCH TO LIGHT CIGARETTE': 'SMOKE',

    'PUT OUT CIGARETTE': () => {
      if( !State.scene.state.smoked ) {
        return "You haven't smoked it yet."
      } else if( State.scene.state.putout ) {
        return "You already did that."
      } else {
        State.scene.state.putout = true
        return "You squelch the cigarette in a handy pile of moist puke."
      }
    },

    'OPEN DESK': () => {
      if( !State.scene.zonestate.neardesk ) {
        return "You're not close enough."
      }
      if( State.scene.state.deskopen ) {
        return "It's already open."
      }
      State.layeralt('desk', 'open')
      State.scene.state.deskopen = true
    },
    'OPEN DRAWER': 'OPEN DESK',

    'CLOSE DESK': () => {
      if( !State.scene.zonestate.neardesk ) {
        return "You're not close enough."
      }
      if( !State.scene.state.deskopen ) {
        return "It's already closed."
      }
      State.layeralt('desk', 'shut')
      State.scene.state.deskopen = false
    },
    'CLOSE DRAWER': 'CLOSE DESK',
    'SHUT DRAWER': 'CLOSE DESK',
    'SHUT DESK': 'CLOSE DESK',

    'STAND': () => {
      if ( State.character.canmove ) {
        return "You are already standing."
      }
      if( State.scene.state.slept ) {
        const anim = State.character.animations[State.character.movingset].right
        State.character.content = anim.frames[0]
        State.character.width = anim.width
        State.character.canmove = true
        return "Congrats! You've made it to your feet. Now you're just hungry, tired, and you need to pee."
      } else {
        State.characteranimation(
          'death',
          'head_desk',
          {
            endfunc: () => {
              State.character.dead = true
              Command.text("Little unsteady on your feet there. Probably should have slept in a bit longer. But lesson learned! You died slightly wiser than you when you woke up. Still dead though.")
            }
          }
        )
      }
      State.charpos = { y: 90, x: 164 }
    },
    'STAND UP': 'STAND',
    'GET UP': 'STAND',

    'PLUG IN COMPUTER': () => {
      if( !State.scene.zonestate.nearcomputer ) {
        return "You're not close enough."
      }
      State.layeralt('cord', 'plugging')
      State.charpos = { y: 116, x: 37 }
      State.characteranimation(
        'computer',
        State.character.raincoaton ? 'plug_in_coat' : 'plug_in',
      )
    },
    'ASK CAT WHERE MATCHES ARE': () => {
      return '"Meowrrunderthebedmeow"'
    },
    'ASK CAT WHERE LIGHTER IS': 'ASK CAT WHERE MATCHES ARE',
    'PET CAT': () => {
      if( !State.scene.zonestate.nearcat ) {
        return "You're not close enough."
      }
      return '"Purrrrrr"'
    },
    'MEOW': () => {
      return "Morning Star stares at you in silence. You suspect you've said something offensive." 
    },
    'PICK UP PHONE': () => {
      if( !State.scene.zonestate.nearphone ) {
        return "You're not close enough."
      }
      State.scene.state.onphone = true
      State.character.canmove = false
      const phonestill = State.character.raincoaton ? 'phone_coat' : 'phone'
      State.characterstill(phonestill)
      State.charpos = { y: 121, x: 214 }
      State.layeralt('phone', 'in_use')
      State.addscenetimer(
        10, 
        () => Command.text("You've had many conversations with this dial tone. You know each other's darkest secrets. There's nothing left to say.")
      )
    },
    'HANG UP': () => {
      if( !State.scene.state.onphone ) {
        return "You're not on the phone."
      }
      State.scene.state.onphone = false
      State.charactermovingset = State.character.raincoaton ? 'raincoat' : 'basic_walk'
      State.character.canmove = true
      State.layeralt('phone', 'in_cradle')
      State.charpos = { y: 113, x: 214 }
    },
    'PUT DOWN PHONE': 'HANG UP',
    'PUT PHONE DOWN': 'HANG UP',
    'GET OFF PHONE': 'HANG UP',

    'CLEAN UP PUKE': () => {
      return "Hahaha no."
    },
  },

  auto_actions: {},
}

export default FirstRoom
