import Watcher from './watcher'
import router from './router'
import http from './http'
import logger from './logger'
import eventBus from './eventsBus'

// external dependancies
import set from 'lodash.set'
import get from 'lodash.get'
import { render } from 'lit-html'
import onChange from 'on-change'

export default class Luce {
  constructor (main, options = {}) {
    this.VERSION = '0.2.2'
    this.tempEvents = {}
    this.events = {}
    this.componentsRegistry = {}
    this.istances = []
    this.plugged = []
    this.main = main
    this.middlewares = []
    this.plug('router', router(this, main))
    this.plug('http', http)
    this.plug('log', logger(options.debug))
    this.plug('event', eventBus())
  }

  init (root, componentName) {
    if (this.middlewares.length > 0) {
      this.runMiddlewares(0)
    }
    if (this.router.isActive()) {
      this.router.start()
    } else if (root && componentName) {
      this.rootRender(root, componentName)
    } else {
      throw new Error('Specificare un elemento root ed un componente da renderizzare in esso')
    }
  }

  // middleware like express.js
  use (fn) {
    this.middlewares.push(fn)
    return this
  }

  runMiddlewares (index) {
    const l = this.middlewares.length
    if (index < l) {
      this.middlewares[index].apply(this, [this, () => this.runMiddlewares(index + 1)])
    }
  }

  // to extend the prototype of lucejs to be used in components
  plug (name, fn) {
    this[name] = fn
    this.plugged.push(name)
  }

  injectObjects (istance) {
    const allPluggables = {}
    this.plugged.forEach(name => {
      allPluggables[`$${name}`] = this[name]
    })
    allPluggables.$ele = istance.element
    return allPluggables
  }

  addComponent (key, factoryFn) {
    this.componentsRegistry[key] = factoryFn
    return this
  }

  propagateChange (a, path) {
    const sonSInstance = this.istances.filter(e => e.parentId === a.id)
    sonSInstance.forEach(sonIstance => {
      if (path && get(sonIstance.model, path)) {
        // this.$log.log('Match between the data sent from parent and the props of the childs')
        if (sonIstance.onPropsChange && typeof sonIstance.onPropsChange === 'function') {
          // passing the model and a reference to events
          const x = Object.assign(sonIstance.model, sonIstance.events, this.injectObjects(sonIstance))
          sonIstance.onPropsChange.call(x)
        }
      }
      this.propagateChange(sonIstance, path)
    })
  }

  proxyMe (source, a) {
    const $e = this
    a.model = onChange(source, function (path, value, previousValue) {
      // this.$log.log('Model:', this);
      // this.$log.log(`path: ${path}`);
      // if(value && previousValue){
      //     this.$log.log(`new: ${JSON.stringify(value)} - old: ${JSON.stringify(previousValue)}`);
      // }
      const instance = $e.istances.find(e => e.id === a.id)
      if (instance) {
        render($e.compiledTemplate(instance), instance.element) // only for the relevant component
        // check if there are new child components...
        $e.checkComponentThree(instance.element, instance)
        // updating sons only if props change
        $e.propagateChange(a, path)
        // update events
        $e.mapEvents(instance.element, instance)
      }
    })
  }

  isInDadAndChild (obj, arr) {
    if (obj === null || arr === undefined) return
    for (let a = 0; a < arr.length; a++) {
      const key = arr[a]
      if (key in obj) {
        return true
      }
    }
    return false
  }

  createOrGetCachedIstance (key, id, element, props, parent) {
    if (!id) {
      const randomId = Math.floor(Math.random() * 1000000)
      const a = this.componentsRegistry[key](`${key}:${randomId}`)
      a.parentId = parent.id
      a.element = element
      a.model = {}
      const match = this.isInDadAndChild(props, a.props)
      // merging the data of the component with the data received from parent component
      a.data = props && a.props && match ? Object.assign(a.data, props) : a.data

      this.proxyMe(a.data, a) // a.model is listening for changes

      if (a.computed) this.initComputed(a.model, a.computed) // computed property
      this.istances.push(a) // saving the istance
      // running the init of the component
      if (a.onInit && typeof a.onInit === 'function') {
        // passing the model and a reference to events and router
        const scope = Object.assign(a.model, a.events, this.injectObjects(a))
        a.onInit.call(scope)
      }
      return a
    } else {
      // returning the cached components
      return this.istances.find(e => e.id === element.children[0].id)
    }
  }

  initComputed (scope, computed) {
    scope._computedWatchers = Object.create(null)
    for (const key in computed) {
      const valueFn = computed[key]
      // si passa lo scope e la funzione che deve esser fatta girare
      scope._computedWatchers[key] = new Watcher(scope, valueFn)
      if (!(key in scope)) {
        const props = {
          configurable: true,
          enumerable: true,
          set () { },
          get () {
            const watcher = scope._computedWatchers && scope._computedWatchers[key]
            if (watcher) return watcher.value
          }
        }
        Object.defineProperty(scope, key, props)
      }
    }
  }

  checkComponentThree (root, componentInstance) {
    const child = root.querySelectorAll('[data-component]')
    const props = root.querySelectorAll('[data-props]')
    child.forEach(element => {
      if (element.dataset.component) {
        const propsToBePassed = {}
        if (props.length > 0) {
          props.forEach(element => {
            const models = element.dataset.props.split(':')
            models.forEach(key => {
              propsToBePassed[key] = componentInstance.model[key] ? componentInstance.model[key] : {}
            })
          })
        }
        // if there is the id returns the previously created istance
        const id = element.children && element.children.length ? element.children[0].id : null
        const sonInstance = this.createOrGetCachedIstance(element.dataset.component, id, element, propsToBePassed, componentInstance)
        render(this.compiledTemplate(sonInstance), element)
        // TODO: only when changed
        if (sonInstance.onPropsChange && typeof sonInstance.onPropsChange === 'function') {
          // passing the model and a reference to events
          const scope = Object.assign(sonInstance.model, sonInstance.events, this.injectObjects(sonInstance))
          sonInstance.onPropsChange.call(scope)
        }
        // events are registered only the first time...
        // events management is done when data change !!
        if (!id) {
          this.mapEvents(element, sonInstance)
        }
        this.checkComponentThree(element, sonInstance)
      } else {
        throw new Error('Componente non presente')
      }
    })
  }

  compiledTemplate (component) {
    return component.template.call(Object.assign({ name: component.name, id: component.id, ...component.model }))
  }

  rootRender (root, key, urlParams) {
    this.router.params = urlParams ? Object.assign({}, urlParams) : {}
    const componentInstance = this.createOrGetCachedIstance(key, null, root, null, root)
    render(this.compiledTemplate(componentInstance), root)
    // Root's events
    this.mapEvents(root, componentInstance)
    // Check component three
    this.checkComponentThree(root, componentInstance)
    // this.$log.log('Components istances: ', this.istances);
  }

  getTree (node, component) {
    const r = { tag: node.nodeName, element: node, component: component }
    for (let i = 0; i < node.attributes.length; i++) {
      const a = node.attributes[i]
      r[a.nodeName] = a.nodeValue
    }
    if ('data-component' in r) {
      const child = node.firstElementChild
      if (child) {
        r.component = child.id
      }
    }
    if (node.childElementCount) {
      r.children = []
      for (let i = 0; i < node.children.length; i++) {
        const a = node.children[i]
        r.children.push(this.getTree(a, r.component))
      }
    }
    if ('data-event' in r) {
      this.tempEvents[component] = this.tempEvents[component] || []
      const str = r['data-event'].split(':')
      const name = /^.*?(?=\()/g.exec(str[1])
      const params = /\(([^)]+)\)/g.exec(str[1])
      r.type = str[0]
      r.action = name ? name[0] : str[1]
      r.params = params ? params[1].split(',') : null
      this.tempEvents[component].push(r)
    }
    return r
  }

  notAlreadyPresent (id, item) {
    const result = this.events[id].findIndex(e => e.element === item.element && e.type === item.type && e.action === item.action)
    return result === -1
  }

  containsObject (id, item) {
    const result = this.tempEvents[id].findIndex(e => e.element === item.element && e.type === item.type && e.action === item.action)
    return result !== -1
  }

  checkEventList (componentInstance) {
    // this.$log.log(this.events[componentInstance.id], this.tempEvents[componentInstance.id]);
    const index = []
    for (let x = 0; x < this.events[componentInstance.id].length; x++) {
      const elem = this.events[componentInstance.id][x]
      if (this.containsObject(componentInstance.id, elem)) {
        continue
      } else {
        index.push(x)
      }
    }
    if (this.events[componentInstance.id].length > this.tempEvents[componentInstance.id].length && index.length > 0) {
      index.forEach(i => {
        this.removeListners(this.events[componentInstance.id][i], componentInstance)
        this.events[componentInstance.id].splice(i, 1)
      })
    }
  }

  checkComponentList () {
    for (let a = 0; a < this.istances.length; a++) {
      const instance = this.istances[a]
      if (document.getElementById(instance.id)) {
        // this.$log.log(`Component ${instance.id } is in page.`);
      } else {
        if (instance.onDestroy && typeof instance.onDestroy === 'function') {
          // passing the model and a reference to events and router
          const scope = Object.assign(instance.model, instance.events, this.injectObjects(instance))
          instance.onDestroy.call(scope)
        }
        this.$log.log(`Component ${instance.id} removed.`)
        this.istances.splice(a, 1)
      }
    }
  }

  mapEvents (root, componentInstance) {
    this.tempEvents = {}
    this.events[componentInstance.id] = this.events[componentInstance.id] || []
    this.tempEvents[componentInstance.id] = this.tempEvents[componentInstance.id] || []
    // 1) Events handlers for USER EVENTS via component methods
    // only events of the component but NOT the ones inside data-components
    /* const three = */ this.getTree(root, componentInstance.id)
    // this.$log.log('DOM Three :', three)
    // this.$log.log('Three :', this.tempEvents);
    const that = this
    this.tempEvents[componentInstance.id].forEach((event, i) => {
      if (that.notAlreadyPresent(componentInstance.id, event)) {
        that.events[componentInstance.id].push(event)
        that.addListners(event, componentInstance)
      } else {
        // this.$log.log('Already present: ', event);
      }
    })
    this.checkEventList(componentInstance)
    this.checkComponentList()
    // 2) handlers for user INPUTS (DATA BINDING) -> TODO: remove listners
    const twoWays = root.querySelectorAll('[data-model]') // solo sul componente
    twoWays.forEach((element, i) => {
      if (element.type === 'text' || element.type === 'textarea') {
        const propToBind = element.getAttribute('data-model')
        element.onkeydown = function () {
          set(componentInstance.model, propToBind, element.value)
        }
      }
    })
    // this.$log.log('Events: ', this.events);
  }

  addListners (htmlElement, componentInstance) {
    htmlElement.element.addEventListener(htmlElement.type, this.handleEvent(componentInstance, htmlElement, this))
  }

  removeListners (htmlElement, componentInstance) {
    htmlElement.element.removeEventListener(htmlElement.type, this.handleEvent(componentInstance, htmlElement, this))
  }

  handleEvent (componentInstance, htmlElement, $e) {
    return function (e) {
      // passing the model and a reference to events, router and the html element itself
      const scope = Object.assign(componentInstance.model, componentInstance.events, $e.injectObjects(componentInstance))
      const params = htmlElement.params ? [e, ...htmlElement.params] : [e]
      componentInstance.events[htmlElement.action].apply(scope, params)
      // $e.$log.log(`listners for ${htmlElement.type} event, triggering action: ${htmlElement.action}`);
    }
  }

  removeAllListnersInPage () {
    this.istances.forEach(istance => {
      this.events[istance.id].forEach(event => {
        this.removeListners(event, istance)
      })
    })
  }
}
