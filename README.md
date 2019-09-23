# Luce.js

![](https://img.shields.io/badge/type-JS_Library-brightgreen.svg "Project type")
![](https://img.shields.io/github/repo-size/LorenzoCorbella74/luce.js "Repository size")
![](https://img.shields.io/github/package-json/v/LorenzoCorbella74/luce.js)


Yet another Front end framework with all the main features of the "famous" frameworks, developed only to prove myself that "we can do it". To have better performance than the solutions adopting Virtual DOM I have used the Templating & Rendering engine of [lit-html](https://github.com/polymer/lit-html) while for reacting to data changes the library [on-change](https://github.com/sindresorhus/on-change) has been used.

## Demo
Check the [sample app](https://github.com/LorenzoCorbella74/sample-app-for-luce.js) running an updated version of the framework.

## Documentation
Check the [wiki](./doc/index.md)

## Features
- [x] Components, nested components and multiple istances of the same component
- [x] Components API similar to [Vue.js](https://vuejs.org) with the reactive data model proxied from the ```data``` property and ```Computed properties```
- [x] Component hooks: onInit, onPropsChange, onDestroy
- [x] Two way data binding and data reactivity on primitives, objects and arrays 
- [x] Wrapper of the [fetch API](https://github.com/github/fetch) for HTTP requests
- [x] Client side routing system based on [History API](https://developer.mozilla.org/en-US/docs/Web/API/History), routes with parameters, 
- [x] Filters in template as pure functions
- [x] Props from parent components to child components
- [x] Automatic management of events on the single component instance
- [x] Debug mode (no logging if debug:false...) 
- [x] Event bus: ```.emit()```, ```.on()``` to subscribe and ```.off()``` to unsubscribe to custom events
- [x] Run function during bootstrap to load configurations, service inizialisations etc 

### Todo
- [ ] forms
- [ ] queue for multiple data changes triggering only one rerendering of the specific component
- [ ] Global Error handler and error messages 

## Bugs
- data reactivity on objects shared among different components

## Built With

HTML5, CSS, Javascript, [lit-html](https://github.com/polymer/lit-html), [on-change](https://github.com/sindresorhus/on-change)

## Versioning

Versione 0.2.3

## License

This project is licensed under the MIT License.






