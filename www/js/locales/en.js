const en = {

  INVENTORY: ['INVENTORY', 'INV'],
  TAKE: ['TAKE'], // 'GET' causes issue with very first command in game
  LOOK: ['LOOK', 'EXAMINE'],
  SAVE: ['SAVE'],
  LOAD: ['LOAD'],
  AROUND: ['AROUND'],

  // Translation here will be odd
  // since LOOK will always be a
  // LOOK string while the conjoined
  // AT needs to be translated. I
  // don't know what to do about
  // german.
  LOOKAT: ['LOOKAT'],

  lookfail: [
    "I don't see that here.",
  ],

  generalfail: [
    "No can do.", 
    "Sorry, what?",
    "I would TOTALLY do that if I knew what you were talking about.",
    "Yeah, yeah... yeah, sorry you can't do that here.",
    "INCORRECT.",
    "Don't know how to do that.", 
    "Noooop.",
    "Absolutely not.",
    "Huh?",
    "I don't understand.",
    "Come again?",
  ],

  dead: [
    "You're dead. Not much more to do but rot.",
    "Dead. Passed on. No more. Expired and gone to meet your maker. Stiff. Bereft of life. Rests in peace.",
    "Shhhh. Dead people can't talk.",
    "Chatty for a ghost, aren't ya?",
    "There's a problem with your suit. There's a dead guy in it.",
    "Game over, man, game over!",
  ],

  inventory: (inventory, items) => {
    const start = 'You have'
    const display = []
    for( const item of inventory ) {
      display.push(items[item].invtext)
    }

    switch( display.length ) {
      case 0:
        return `${start} nothing.`
      case 1:
        return `${start} ${display[0]}.`
      case 2:
        return `${start} ${display[0]} and ${display[1]}.`
      default:
        const end = `, and ${display.pop()}`
        return `${start} ${display.join(', ')}${end}.`
    }
  },


}

export default en

