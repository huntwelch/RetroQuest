import Command from '/js/command.js'
import State from '/js/statemanager.js'


class ControlBar {
  constructor() {
    this.assignclick('help', this.help)
  }

  assignclick(id, func) {
    document.getElementById(id).addEventListener("click", (event) => {
      func()
      document.body.focus()
      event.target.blur()
    }) 
  }

  help() {
    Command.text("Heya. This is all super beta right now.\
                  You probably shouldn't even be here. But \
                  if you're going to wander around and you \
                  didn't play quest games in the 80s, you \
                  need to know some stuff. Use the arrow \
                  keys to walk around. If you're on a phone \
                  you can kind of do a light drag in a direction.\
                  Mobile support in general is... not awesome. \
                  Moving in the same direction will make you stop. \
                  Just start typing to do things like 'look' or \
                  'look at church' or 'get pen' or 'knock'. \
                  Hitting any key will clear dialogue boxes \
                  like this one. Try not to die.")
  }
}

const Bar = new ControlBar()

export default Bar


