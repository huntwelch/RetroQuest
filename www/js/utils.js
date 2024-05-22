export const standardwalk = {
  left: {
    width: 15,
    current: 0,
    move: { x: -3 },
  },
  up: {
    width: 12,
    current: 0,
    move: { y: -2, z: -2 },
  },
  right: {
    width: 15,
    current: 0,
    move: { x: 3 },
  },
  down: {
    width: 12,
    current: 0,
    move: { y: 2, z: 2 },
  },
}

export const umbrellawalk = {
  left: {
    width: 29,
    current: 0,
    move: { x: -3 },
  },
  up: {
    width: 29,
    current: 0,
    move: { y: -2, z: -2 },
  },
  right: {
    width: 29,
    current: 0,
    move: { x: 3 },
  },
  down: {
    width: 29,
    current: 0,
    move: { y: 2, z: 2 },
  },
}

export const deepclone = (what) => {
  return JSON.parse(JSON.stringify(what))
}

// https://davidwalsh.name/javascript-deep-merge
const isMergeableObject = (val) => {
    var nonNullObject = val && typeof val === 'object'

    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}

const emptyTarget = (val) => {
    return Array.isArray(val) ? [] : {}
}

const cloneIfNecessary = (value, optionsArgument) => {
    var clone = optionsArgument && optionsArgument.clone === true
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

// The only arrays are art content,
// and don't actually want them merged,
// so this function is replaced.
const defaultArrayMerge = (target, source, optionsArgument) => {
    return source
}

const mergeObject = (target, source, optionsArgument) => {
    var destination = {}
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument)
        })
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument)
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument)
        }
    })
    return destination
}

export const deepmerge = (target, source, optionsArgument) => {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var arrayMerge = options.arrayMerge || defaultArrayMerge

    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

export const holoreturn = (character, location) => {
  const pos = character.position
  const returnpos = {
    'left': { direction: 'right', update: {x: pos.x + 5, y: pos.y } },
    'right': { direction: 'left', update: {x: pos.x - 5, y: pos.y } },
    'up': { direction: 'down', update: {y: pos.y + 5, x: pos.x } },
    'down': { direction: 'up', update: {y: pos.y - 5, x: pos.x } },
  }[character.animation] 
  
  return {
    position: returnpos,
    location: location,
  }
}
