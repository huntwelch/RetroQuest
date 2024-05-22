import secondroomart from '/js/art/secondroom.js'
import State from '/js/statemanager.js'
import Command from '/js/command.js'


const SecondRoom = {
  background: secondroomart.bg,
  items: ['COFFEE POT', 'SANDWICH'],
  foot_blocked: secondroomart.foot_block,
  layers: secondroomart.layers,
  zones: secondroomart.zones,
  
  state: {
    fridgeopen: false,
    holdingpot: false,
    fillingpot: false,
    waterinpot: false,
    coffeeinpot: false,
    waterinmaker: false,
    brewing: false,
    brewed: false,
    potinmaker: true,
    coffeedrunk: false,
  },

  animations: {
    faucet: {
      movingset: 'normal',
      animation: 'on',
      moving: false,
      width: 8,
      current: 0,
    },
    coffeemaker: {
      movingset: 'normal',
      animation: 'brewing',
      moving: false,
      width: 15,
      current: 0,
      endfunc: () => { State.scene.animationactions.coffee_brewed() },
    },
  },

  zjust: {
    coffeemaker: 190,
    'ITEM_COFFEE POT': 191,
    faucet: 190,
  },

  animationactions: {
    coffee_brewed: () => {
      State.scene.animations.coffeemaker.moving = false
      State.scene.state.brewing = false
      State.scene.state.brewed = true
      State.scene.state.waterinmaker = false
      State.layeralt('coffeemaker', 'full')
    },
  },

  zonestate: {
    nearsink: false,
    nearmaker: false,
    nearfridge: false,
  },

  zonedefaults: {
    nearsink: false,
    nearmaker: false,
    nearfridge: false,
  },

  zoneactions: {
    to_bedroom: () => {
      State.location = 'jacob_bedroom'  
      State.charpos = { x: 236 }
    },
    to_bathroom: () => {
      State.location = 'jacob_bathroom'
      State.charpos = { x: 121, y: 75 }
    },
    to_hallway: () => {
      State.location = 'jacob_hallway'
      State.charpos = { y: 70 }
    },
    near_sink: () => {
      State.updatezone('nearsink', true)
    },
    near_maker: () => {
      State.updatezone('nearmaker', true)
    },
    near_fridge: () => {
      State.updatezone('nearfridge', true)
    },
  },

  character_actions: {
    'LOOKAT': {
      'BOTTLES': "You don't even have a trashcan, much less recycling. No, your bottles live on the floor until someone kicks them and the shards are shoved under the refrigerator.",
      'BOTTLE': 'BOTTLES',
      'FRIDGE': "It's a refrigerator. Open at your own risk.",
      'REFRIGERATOR': 'FRIDGE',
      'COUNTER': "Mostly exists to support a coffee maker.",
      'COFFEE MAKER': () => {
        if( State.scene.state.coffeedrunk ) {
          return "The coffee maker has done its job and mercifully drained the last life out of the old and savaged grounds. Ready to drink."
        } else if( State.scene.state.brewed ) {
          return "The coffee maker has a fresh pot of what is likely coffee in it." 
        } else if( State.scene.state.brewing ) {
          return "The coffee maker is brewing."
        } else if( State.scene.state.waterinmaker ) {
          return "The coffee maker has fresh water in it, and is ready to brew a terrible cup of coffee."
        } else {
          return "Makes coffee. Whodathunk? There's no water in it, and you don't have any fresh coffee, but the grounds already in there have only been used twice and can't be THAT moldy."
        }
      },
      'COFFEE POT': () => `It's
        a${(State.scene.state.waterinpot || State.scene.state.coffeeinpot || State.scene.state.brewing) ? '' : 'n empty'}
        coffee pot${State.scene.state.waterinpot ? ' full of water' : ''}${State.scene.state.coffeeinpot ? ' full of coffee' : ''}${State.scene.state.brewing ? ' filling with coffee' : ''}.`,
      'COFFEEPOT': 'COFFEE POT',
      'SINK': "Remarkably clean, since all it does is fill the coffee maker.",
      'TABLE': "Cheap. Fragile. Sticky.",
    },

    'TAKE': {
      'COFFEE POT': () => {
        if( State.character.coffeesdrunk == 1) {
          return "You already drank your coffee."
        }
        if( !State.scene.zonestate.nearmaker ) {
          return "You're not close enough." 
        }
        if( State.scene.state.waterinmaker ) {
          return "No, no, no. You've already done that bit. The pot is where it needs to be."
        }
        if( State.scene.state.brewed ) {
          return "Just drink it."  
        }
        const takepot = State.take('COFFEE POT')
        if( takepot ) {
          State.scene.state.potinmaker = false
        }
        return takepot
          ? "Got it."
          : "You're already holding it."
      },
      'COFFEEPOT': 'COFFEE POT',
      'POT': 'COFFEE POT',
      'CARAFE': 'COFFEE POT',

      'SAMMICH': () => {
        if( !State.scene.state.fridgeopen ) {
          return "You don't see a sandwich." 
        }
        if( State.take('SANDWICH') ) {
          State.still = 'fridge_empty'
          return "Sandwich acquired."
        }
        return "No sandwich to take."
      },
      'SANDWICH': 'SAMMICH',
      'HAM SANDWICH': 'SAMMICH',
      'HAM SAMMICH': 'SAMMICH',
    },

    'FILL POT': () => {
      if( State.character.coffeesdrunk === 1 ) {
        return "You've taken all you can from this coffee maker."
      }
      if( State.scene.state.brewed ) {
        return "It's already full of coffee."
      }
      if( State.scene.state.waterinpot) {
        return "It's already full."
      }
      if( !State.have('COFFEE POT') ) {
        return "You don't have a pot to fill."
      }
      if( !State.scene.zonestate.nearsink ) {
        return "You're not close enough to the sink."          
      }
      if( !State.scene.animations.faucet.moving ) {
        return "Should probably turn the water on first."
      }

      State.charpos = { x: 253, y: 120, z: 200 }
      State.characteranimation(
        'coffee',
        'filling_pot',
        {
          endfunc: () => {
            State.scene.state.waterinpot = true
            State.character.canmove = true
            State.charpos = { z: 153 }
            State.character.currentoverride = 0
            State.character.lastanimation = 'down'
            State.charactermovingset = 'basic_walk' 
          },
        },
      )
      State.scene.state.fillingpot = true
      State.scene.state.waterinpot = true
    },
    'FILL COFFEE POT': 'FILL POT',
    'FILL COFFEEPOT': 'FILL POT',

    'FILL MAKER': () => {
      if( State.character.coffeesdrunk === 1 ) {
        return "You've had your coffee. Go see the world."
      }
      if( State.scene.state.brewed ) {
        return "You're not getting any more coffee out of this thing today."
      }
      if( State.scene.state.waterinmaker ) {
        return "It's already full."
      }
      if( !State.scene.zonestate.nearmaker ) {
        return "You're not close enough." 
      }
      if( !State.scene.state.waterinpot ) {
        return "You have nothing to fill it with."
      }
      State.charpos = { x: 163, y: 120, z: 153 }
      State.characteranimation(
        'coffee',
        'filling_maker',
        {
          endfunc: () => {
            State.scene.state.waterinmaker = true
            State.character.canmove = true
            State.charpos = { z: 153 }
            State.character.width = 12
            State.character.currentoverride = 0
            State.character.lastanimation = 'down'
            State.charactermovingset  = 'basic_walk' 
            State.leave('COFFEE POT')  
          },
        },
      )
      State.scene.state.fillingpot = true
      State.scene.state.waterinpot = false
    }, 
    'FILL COFFEE MAKER':'FILL MAKER',
    'PUT WATER IN COFFEE MAKER':'FILL MAKER',
    'PUT WATER IN MAKER':'FILL MAKER',
    'POUR WATER IN COFFEE MAKER':'FILL MAKER',
    'POUR WATER IN MAKER':'FILL MAKER',
    'POUR WATER INTO COFFEE MAKER':'FILL MAKER',
    'POUR WATER INTO MAKER':'FILL MAKER',

    'BREW': () => {
      if( State.character.coffeesdrunk === 1 ) {
        return "You've had your coffee. Go see the world."
      }
      if( State.scene.state.brewed ) {
        return "Already brewed."
      }
      if( !State.scene.zonestate.nearmaker ) {
        return "You're not close enough." 
      }
      if( !State.scene.state.waterinmaker ) {
        return "There's no water in the coffee maker."
      }
      State.destroy('COFFEE POT')
      State.scene.animations.coffeemaker.moving = true
    },
    'MAKE COFFEE': 'BREW',
    'BREW COFFEE': 'BREW',
    'TURN ON MAKER': 'BREW',
    'TURN ON COFFEE MAKER': 'BREW',
    'START COFFEE MAKER': 'BREW',

    'DRINK': () => {
      if( State.character.coffeesdrunk === 1 ) {
        return "You already drank your coffee."
      }
       if( !State.scene.state.brewed ) {
        return "Drink what? I don't see any coffee here."
      }
      
      State.layeralt('coffeemaker', 'empty')
      State.characteranimation(
        'coffee',
        'drinking_coffee',
        {
          endfunc: () => {
            State.character.width = 12
            State.character.currentoverride = 0
            State.character.lastanimation = 'down'
            State.charactermovingset  = 'basic_walk' 
            State.character.canmove = true
            Command.text('Mmmmm. Gross.')
            State.layeralt('coffeemaker', 'done')
          },
        },
      )
      State.character.coffeesdrunk = 1
    },
    'DRINK COFFEE': 'DRINK',
    'DRINK POT': 'DRINK',
    'DRINK CARAFE': 'DRINK',

    'TURN FAUCET ON': () => {
      State.scene.animations.faucet.moving = true
    },
    'TURN ON FAUCET': 'TURN FAUCET ON',
    'TURN ON WATER': 'TURN FAUCET ON',
    'TURN WATER ON': 'TURN FAUCET ON',
    'TURN FAUCET OFF': () => {
      State.scene.animations.faucet.moving = false
    },
    'TURN OFF FAUCET': 'TURN FAUCET OFF',
    'TURN OFF WATER': 'TURN FAUCET OFF',
    'TURN WATER OFF': 'TURN FAUCET OFF',

    'OPEN FRIDGE': () => {
      if( !State.scene.zonestate.nearfridge ) {
        return "But it's so far awaaaaay."
      }
      if( State.scene.items.includes('SANDWICH') ) {
        State.still = 'fridge_sammich'
      } else {
        State.still = 'fridge_empty'
      }
      State.scene.state.fridgeopen = true
      State.addscenetimer(
        3, 
        () => {
          if( State.scene.items.includes('SANDWICH') ) {
            Command.text("The hermetic seal on the refrigerator seems to have protected the inside from the accelerated decay in the rest of the apartment. Even the sandwich looks okay.")
          } else {
            Command.text("An empty, stunningly clean refrigerator.")
          }
        }
      )
    },
    'OPEN REFRIGERATOR': 'OPEN FRIDGE',
    'LOOK IN FRIDGE': 'OPEN FRIDGE',
    'LOOK IN REFRIGERATOR': 'OPEN FRIDGE',

    'CLOSE FRIDGE': () => {
      if( !State.scene.state.fridgeopen ) {
        return "It's not open."
      }
      State.scene.state.fridgeopen = false
      State.still = null
    },
    'CLOSE REFRIGERATOR': 'CLOSE FRIDGE',
  },

  auto_actions: {
  
  },

  description: "Your kitchen. Things not in your kitchen: fresh food, utensils, dishes. Things in your kitchen: empty beer bottles, coffee maker, fridge, maybe a mug somewhere, dust, roaches.",
}

export default SecondRoom
