import State from '/js/statemanager.js'
import Command from '/js/command.js'
import FirstRoom from '/js/scenes/FirstRoom.js'
import SecondRoom from '/js/scenes/SecondRoom.js'
import Holodeck from '/js/scenes/Holodeck.js'

const defaults = {
  zones: [],
  time: 0,
  animations: {},
  zjust: {},
  timers: {},
  tickers: {},
  state: {},
  zonedefaults: {},
  zoneactions: {},
  animationactions: {},
  overrideaction: () => {},
  character_actions: {},
  auto_actions: {},
  description: "",
  blackout: false,
  npcs: {},
}

const scenes = {
  first_room: {
    ...defaults,
    ...FirstRoom,
  },

  second_room: {
    ...defaults,
    ...SecondRoom,
  },
  holodeck: {
    ...defaults,
    ...Holodeck,
  },
}

export default scenes
