import State from './statemanager.js'
import Command from './command.js'

const items = {
  'CIGARETTE': {
    name: "Cigarette",
    invtext: "a cigarette",
    description: "One bent cigarette. If cigarettes had feelings, this one would be unhappy.",
    lit: false,
    actions: {},
  },

  'JOURNAL': {
    name: "Journal",
    invtext: "your journal",
    description: "Old and battered, this thing is probably your best friend. That's not poetic. It's just really, really sad.",
    actions: {
      'READ JOURNAL': () => {
        State.state.journalopen = true
        State.still = 'journal'
      },
      'OPEN JOURNAL': 'READ JOURNAL',
      'CLOSE JOURNAL': () => {
        if( !State.state.journalopen ) {
          return "It's not open."
        }
        if( !State.state.journalseen ) {
          State.state.journalseen = true
          Command.text("Well, that's terrifying. What kind of psycho are you?")
        }
        State.still = null
      },
      'STOP READING': 'CLOSE JOURNAL',
      'PUT JOURNAL DOWN': 'CLOSE JOURNAL',
    },
  },

  'RAINCOAT': {
    name: "Raincoat",
    invtext: "a raincoat",
    description: "It's a green raincoat.",
    actions: {
      'PUT ON COAT': () => {
        State.charactermovingset = 'raincoat' 
        State.character.raincoaton = true
      },
      'PUT ON RAINCOAT': 'PUT ON COAT',
      'PUT RAINCOAT ON': 'PUT ON COAT',
      'PUT COAT ON': 'PUT ON COAT',
      'WEAR COAT': 'PUT ON COAT',
      'WEAR RAINCOAT': 'PUT ON COAT',

      'PUT HOOD UP': () => {
        if (!State.character.raincoaton) {
          return "You're not wearing anything with a hood."
        }
        State.charactermovingset = 'raincoat_hood' 
        State.character.raincoathoodup = true
      },
      'PUT UP HOOD': 'PUT HOOD UP',
      'WEAR HOOD': 'PUT HOOD UP',

      'PUT HOOD DOWN': () => {
        if (!State.character.raincoaton) {
          return "You're not wearing anything with a hood."
        }
        if (!State.character.raincoathoodup) {
          return "You don't have a hood up."
        }
        State.charactermovingset = 'raincoat' 
        State.character.raincoathoodup = false
      },
      'PUT DOWN HOOD': 'PUT HOOD DOWN',

      'TAKE OFF COAT': () => {
        // Will be conditional in the future
        return "There's no point in taking off your coat right now."

        if (!State.character.raincoaton) {
          return "You're not wearing a coat."
        }
        State.charactermovingset = 'basic_walk' 
        State.character.raincoaton = false
        State.character.raincoathoodup = false
      },
      'TAKE OFF RAINCOAT': 'TAKE OFF COAT',
      'TAKE RAINCOAT OFF ': 'TAKE OFF COAT',
      'TAKE COAT OFF ': 'TAKE OFF COAT',
    },
  },

  'PEN': {
    name: "Pen",
    invtext: "a pen",
    description: "One bic pen. Blue, like your mood.",
    actions: {
      'STAB MY EYE': () => {
        State.characteranimation('death', 'pen')
      },
      'STAB SELF IN EYE': 'STAB MY EYE',
      'STAB SELF IN EYE WITH PEN': 'STAB MY EYE',
      'STAB SELF IN FACE': 'STAB MY EYE',
      'STAB MY FACE': 'STAB MY EYE',
      'STAB OWN EYE': 'STAB MY EYE',
      'STAB OWN FACE': 'STAB MY EYE',
      'STAB MY FACE WITH PEN': 'STAB MY EYE',
      'STAB OWN EYE WITH PEN': 'STAB MY EYE',
      'STAB OWN FACE WITH PEN': 'STAB MY EYE',
    },
  },

  'MATCHES': {
    name: "Matches",
    invtext: "matches",
    description: "A matchbook, about half full. Sorry; half empty.",
    actions: {},
  },

  'COFFEE POT': {
    name: "Coffee Pot",
    invtext: "a coffee pot",
    description: "It's a coffee pot.",
    actions: {},
  },

  'SANDWICH': {
    name: "Ham Sandwich",
    invtext: "a ham sandwich",
    description: "Ham, cheese, and a vague sensation of screaming panic on whole wheat.",
    actions: {
      'EAT SAMMICH': () => {
        State.character.atesandwich = true      
        State.destroy('SANDWICH')
        Command.text("Nom nom nom.")
        Command.text("Not bad at all. You feel fed.")
      },
      'EAT SANDWICH': 'EAT SAMMICH',
      'EAT HAM SANDWICH': 'EAT SAMMICH',
      'EAT HAM SAMMICH': 'EAT SAMMICH',
    },
  },
}

export default items
