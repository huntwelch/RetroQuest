import from '/js/art/.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'
import Engine from '/js/engine.js'

const = {
  background: .bg,
  items: [],
  foot_blocked: .foot_block,
  layers: .layers,
  zones: .zones,

  state: {
  },

  npcs: {
  },

  animations: {
  },

  zjust: {
  },

  timers: {},

  animationactions: {
  },

  zonestate: {},

  zonedefaults: {},

  zoneactions: {
    to_: () => {
      State.location = ''
      State.charpos = { x: , y: }
      Engine.updatecontrol('up')
    },
  },

  description: "",

  character_actions: {
    'LOOKAT': {

    },
  },

}

export default 
