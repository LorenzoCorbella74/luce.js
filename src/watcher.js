export default class Watcher {
  constructor (context, valueFn) {
    this.context = context
    this.getter = valueFn
  }

  // il value è il getter che fa partire la funzione passata con il contesto passato
  get value () {
    const context = this.context
    const value = this.getter.call(context)
    return value
  }
}
