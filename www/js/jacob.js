import jacobart from '/js/art/jacob.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'
import { standardwalk, umbrellawalk, deepclone } from '/js/utils.js'

const test_y = 130
const test_x = 100


const jacob = {
  name: 'Jacob',
  npc: false,
  blockimmunity: false,

  // TEST SET
  width: 15,
  canmove: true,
  content: jacobart.animations.basic_walk.left[0],
  position: {x: test_x, y: test_y, z: test_y + 33},

  // ACTUAL DEFAULT
  // width: 33,
  // canmove: false,
  // content: jacobart.stills.floored.content,
  // position: {x: 143, y: 116, z: 149},


  dead: false,
  coffeesdrunk: 0,
  holdingpot: false,
  raincoaton: false,
  raincoathoodup: false,
  pneumonia: false,
  atesandwich: false,
  peed: false,
  visible: true,

  inventory: ['CIGARETTE', 'PEN'],

  height: 33,
  art: jacobart,
  loaded: false,
  lastanimation: 'right',
  animation: null,
  moving: false,
  movingset: 'basic_walk',
  currentoverride: null,

  // TODO load animations and combine with mod data
  animations: {
    raincoat: {
      ...deepclone(standardwalk),
    },

    raincoat_hood: {
      ...deepclone(standardwalk),
    },

    basic_walk: {
      ...deepclone(standardwalk),
    },

    umbrella: {
      ...deepclone(umbrellawalk),
    },

    death: {
      head_desk: {
        current: 0,
        width: 33,
      },

      //NOTE: scene specific, but here because of multiple routes to it
      electrocuted: {
        current: 0,
        width: 33,
        endfunc: () => {
          State.character.dead = true
          Command.text("That's what you get for not taking care of your electronics. Not sure where that came from, but a little compressed air wouldn't hurt before... well, too late now.")
        }
      },

      // Can happen anywhere
      pen: {
        current: 0,
        width: 11,
        endfunc: () => {
          State.character.dead = true
          Command.text([
            "Interesting approach.",
            "What did you think would happen?",
            "You'd turn into PenEyeMan?",
            "That's not what happened.",
          ])
        },
      },
      dissolved: {
        current: 0,
        width: 12,
      },
      lightning: {
        current: 0,
        width: 12,
      },
    },
    computer: {
      plug_in: {
        current: 0,
        width: 33,
        endfunc: () => {
          State.layeralt('cord', 'plugged')
          State.layeradjust('cord', { position: {x: 38, y: 137, z: 148} })
          State.characteranimation('death', 'electrocuted') 
        },
      },
      plug_in_coat: {
        current: 0,
        width: 33,
        endfunc: () => {
          State.layeralt('cord', 'plugged')
          State.layeradjust('cord', { position: {x: 38, y: 137, z: 148} })
          State.characteranimation('death', 'electrocuted') 
        },
      },
    },
    stuff: {
      peeing: {
        current: 0,
        width: 10,
        endfunc: () => {
          State.scene.peed = true
          State.character.canmove = true
          State.charpos = { z: 153 }
          State.character.width = 12
          State.character.currentoverride = 0
          State.character.lastanimation = 'up'
          State.charactermovingset  = 'basic_walk' 
          Command.text('Ahhhhhhh.') 
        },
      },
    },
    coffee: {
      filling_pot: {
        current: 0,
        width: 12,
      },
      filling_maker: {
        current: 0,
        width: 17,
      },
      drinking_coffee: {
        current: 0,
        width: 13,
      },
    },
  },
  stills: {},
}

export default jacob
