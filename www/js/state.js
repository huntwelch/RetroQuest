import scenes from '/js/scenes.js'
import jacob from '/js/jacob.js'

const state = {
  current_character: 'jacob',

  // ACTUAL
  current_location: 'jacob_bedroom',

  // TEST
  current_location: 'railroad_street',

  time: 0,
  still: null,
  showtext: false,
  caninput: true,

  journalopen: false,
  journalseen: false,

  characters: {
    jacob: jacob,
  },
  locations: {
    jacob_bedroom: {
      scene: scenes.jacob_awakes,
    },
    jacob_kitchen: {
      scene: scenes.morning_kitchen,
    },
    jacob_bathroom: {
      scene: scenes.jacob_bathroom,
    },
    jacob_hallway: {
      scene: scenes.jacob_hallway,
    },
    jacob_building: {
      scene: scenes.jacob_building,
    },
    mountain_road: {
      scene: scenes.mountain_road,
    },
    holodeck: {
      scene: scenes.holodeck,
    },
    restaurant_street: {
      scene: scenes.restaurant_street,
    },
    crossroad: {
      scene: scenes.crossroad,
    },
    park: {
      scene: scenes.park,
    },
    corner: {
      scene: scenes.corner,
    },
    cumbys: {
      scene: scenes.cumbys,
    },
    church_bank: {
      scene: scenes.church_bank,
    },
    main_street: {
      scene: scenes.main_street,
    },
    deli: {
      scene: scenes.deli,
    },
    infinite_road: {
      scene: scenes.infinite_road,
    },
    railroad_street: {
      scene: scenes.railroad_street,
    },
    bridge_street: {
      scene: scenes.bridge_street,
    },
    shens_place: {
      scene: scenes.shens_place,
    },
    shen_stairs: {
      scene: scenes.shen_stairs,
    },
    shen_hall: {
      scene: scenes.shen_hall,
    },
    shen_bathroom: {
      scene: scenes.shen_bathroom,
    },
    shen_kitchen: {
      scene: scenes.shen_kitchen,
    },
    shen_livingroom: {
      scene: scenes.shen_livingroom,
    },
    sushi_bar: {
      scene: scenes.sushi_bar,
    },
    tracks_north: {
      scene: scenes.tracks_north,
    },
    tracks_middle: {
      scene: scenes.tracks_middle,
    },
    tracks_south: {
      scene: scenes.tracks_south,
    },
    gazebo: {
      scene: scenes.gazebo,
    },
    backlot: {
      scene: scenes.backlot,
    },
    cordiallys: {
      scene: scenes.cordiallys,
    },
    antique_shop: {
      scene: scenes.antique_shop,
    },
    woods: {
      scene: scenes.woods,
    },
  },

  holoexit: null,
}

export default state
