export default () => {
  const listeners = new Map()

  const on = (e, f) => {
    listeners.has(e) || listeners.set(e, []) // se non c'è si crea un array (di funzioni)
    listeners.get(e).push(f)
  }

  const off = (e, f) => {
    const ls = listeners.get(e)
    if (ls && ls.length) {
      ls.forEach((l, i) => {
        if (l === f) {
          ls.splice(i, 1)
        }
      })
    }
    ls.length ? listeners.set(e, ls) : listeners.delete(e)
  }

  const emit = (e, ...a) => {
    const ls = listeners.get(e)
    if (ls && ls.length) {
      ls.forEach(l => l(...a))
    }
  }

  return { on, off, emit }
}
