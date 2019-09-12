export default (debug = false, context) => {
    const _debug = debug // private data

    const log = (...what) => {
        if (_debug) {
            console.log(`${context.constructor.name}:`, ...what)
        }
    }
    const info = (...what) => {
        if (_debug) {
            console.info(`${context.constructor.name}:`, ...what)
        }
    }
    const warning = (...what) => {
        if (_debug) {
            console.warning(`${context.constructor.name}:`, ...what)
        }
    }
    const error = (...what) => {
        if (_debug) {
            console.error(`${context.constructor.name}:`, ...what)
        }
    }

    return { log, info, warning, error };
}
