export default (debug = false) => {
  const _debug = debug // private data

  const log = (...what) => {
    if (_debug) {
      console.log('Luce: ', ...what)
    }
  }
  const info = (...what) => {
    if (_debug) {
      console.info('Luce: ', ...what)
    }
  }
  const warning = (...what) => {
    if (_debug) {
      console.warning('Luce: ', ...what)
    }
  }
  const error = (...what) => {
    if (_debug) {
      console.error('Luce: ', ...what)
    }
  }

  return { log, info, warning, error }
}
