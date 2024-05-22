import en from '/js/locales/en.js'

const LOCALE = 'en'

const map = {
  'en': en,
}

class Localize {
  constructor() {
    const locale = map[LOCALE]
    for( const key in locale ) {
      this[key] = locale[key]
    }
  }
}

const Locale = new Localize()

export default Locale
