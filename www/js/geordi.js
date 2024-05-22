import geordiart from '/js/art/geordi.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'
import { standardwalk, deepclone } from '/js/utils.js'

const geordi = {
  name: 'Geordi',
  npc: true,
  blockimmunity: true,

  width: 12,
  height: 33,
  position: {x: 153, y: 122, z: 122 + 33},

  art: geordiart,
  loaded: false,
  lastanimation: 'down',
  animation: null,
  moving: false,
  movingset: 'basic_walk',
  currentoverride: null,
  content: geordiart.animations.basic_walk.down[0],
  visible: true,

  animations: {
    basic_walk: {
      ...deepclone(standardwalk),
    },
    stuff: {
      tapbadge: {
        current: 0,
        width: 12,
      },
    },
  },
  stills: {},
}

export default geordi
