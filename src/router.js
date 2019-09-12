const ROUTE_PARAMETER_REGEXP = /:(\w+)/g
const URL_FRAGMENT_REGEXP = '([^\\/]+)'
const TICKTIME = 200
const NAV_A_SELECTOR = '[data-navigation]'

const extractUrlParams = (route, pathname) => {
  if (route.params.length === 0) {
    return {}
  }

  const params = {}

  const matches = pathname.match(route.testRegExp)

  matches.shift()

  matches.forEach((paramValue, index) => {
    const paramName = route.params[index]
    params[paramName] = paramValue
  })

  return params
}

export default (engine, mainTag) => {
  const routes = []
  const notFound = () => { }
  let lastPathname

  const router = {}

  const checkRoutes = () => {
    const { pathname } = window.location
    if (lastPathname === pathname) {
      return
    }

    lastPathname = pathname

    const currentRoute = routes.find(route => {
      return route.testRegExp.test(pathname)
    })

    if (!currentRoute) {
      notFound()
      return
    }

    const urlParams = extractUrlParams(currentRoute, pathname)

    // removing events, then istances, then tempEvents...
    router.beforeChange(engine)();
    engine.removeAllListnersInPage() // removes all events
    engine.istances = []
    engine.tempEvents = {}
    engine.rootRender(mainTag, currentRoute.componentName, urlParams)
    router.afterChange(engine)();
  }

  router.beforeChange = function (engine) {
    return function (callback) {
      callback(engine)
      return router
    }
  }
  router.afterChange = (engine) => (callback) => {
    callback(engine)
    return router
  }

  router.addRoute = (path, componentName) => {
    const params = []

    const parsedPath = path
      .replace(ROUTE_PARAMETER_REGEXP, (match, paramName) => {
        params.push(paramName)
        return URL_FRAGMENT_REGEXP
      }).replace(/\//g, '\\/')

    routes.push({
      testRegExp: new RegExp(`^${parsedPath}$`),
      componentName,
      params
    })

    return router
  }

  router.ifNotFound = componentName => {
    engine.istances = []
    engine.events = {}
    engine.rootRender(mainTag, componentName, null)
    return router
  }

  router.navigate = path => {
    window.history.pushState(null, null, path)
  }

  router.start = () => {
    checkRoutes()
    window.setInterval(checkRoutes, TICKTIME)

    document
      .body
      .addEventListener('click', e => {
        const { target } = e
        if (target.matches(NAV_A_SELECTOR)) {
          e.preventDefault()
          router.navigate(target.href)
        }
      })

    return router
  }

  return router
}
