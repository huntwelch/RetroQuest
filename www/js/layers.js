var walkRate = 3; // This is RENDERED PIXEL RATE, not real pixels

var character = {
  name: 'roger', 

  control: true,
  position: {x: 0, y: 0, z: 33}, // should calc z?
  width: 15,
  content: roger_basic_walk.right[0],
  animations: {
    left: {
      frames: roger_basic_walk.left,
      width: 15,
      current: 0,
      move: { x: -walkRate },
    },
    up: {
      frames: roger_basic_walk.up,
      width: 12,
      current: 0,
      move: { y: -walkRate, z: -walkRate },
    },
    right: {
      frames: roger_basic_walk.right,
      width: 15,
      current: 0,
      move: { x: walkRate },
    },
    down: {
      frames: roger_basic_walk.down,
      width: 12,
      current: 0,
      move: { y: walkRate, z: walkRate },
    },
  },
  animation: null,
  speed: 100, // timeOut for animation change
  moving: false,
};

var layers = [
  {
    name: 'foreground',
    content: foreground_map,
    position: { x: 0, y: 0, z: Infinity },
    width: 320,
  },
  {
    name: 'pillar',
    content: pillar_map,
    position: { x: 0, y: 0, z: 147 },
    width: 320,
  },
];
