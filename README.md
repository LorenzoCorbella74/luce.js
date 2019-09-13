# Luce.js

Yet another Front end framework with all the main features of the "famous" frameworks, developed only to prove myself that "we can do it". To have better performance than the solutions adopting Virtual DOM I have used the Templating & Rendering engine of [lit-html](https://github.com/polymer/lit-html) while for reacting to data changes the library [on-change](https://github.com/sindresorhus/on-change) has been used.

## FEATURES
- [x] Components, nested components and multiple istances of the same component
- [x] Components API similar to [Vue.js](https://vuejs.org) with the reactive data model proxied from the```data```property and```Computed properties```
- [x] Component hooks: onInit, onPropsChange, onDestroy
- [x] Two way data binding and data reactivity on primitives, objects and arrays 
- [x] Wrapper of the [fetch API](https://github.com/github/fetch) for HTTP requests
- [x] Client side routing system based on [History API](https://developer.mozilla.org/en-US/docs/Web/API/History), routes with parameters, 
- [x] Filters in template as pure function
- [x] Props from a parent component to child components
- [x] Automatic management of events on the single component instance
- [x] Debug mode (no logging if debug:false...) 

### TODO
- [ ] Event bus: shared state management
- [ ] queue for multiple data changes triggering only one rerendering of the specific component
- [ ] Global Error handler and error messages 

## BUGS
- data reactivity on objects shared among different components

# Documentation

## Demo
Check the [sample app](https://github.com/LorenzoCorbella74/sample-app-for-luce.js) running an updated version of the framework.

## Bootstrap

Just import the framework and register the component:
```javascript


import Luce from 'lucejs':

window.onload = function () {

    const mainTag = document.getElementById('output');  // root of the app

    const app = new Luce(mainTag, {debug:true});        // pass a configuration object

    // registering components
    app.addComponent('dad-component', dadCtrl)
       .addComponent('child-component', childCtrl)
       .addComponent('about-component', aboutCtrl)
        
        // rendering the root (no ROUTER)
       .rootRender(mainTag, 'dad-component');
}
```

## Components

Each component has in one single ```.js```file the function responsible for the compilation of the template and the object representing the component, containing the component name, model data, functions associated with events, computed properties and component hooks. For didactic purpose I haven't used the events of [lit-html](https://github.com/polymer/lit-html))so  events have been automatically added and removed according to the life cycle of the component and its presence in the current route. Events are registered with the attribute  ```data-event="<event type>:<action name>"```. It's higly recommeded to use in the root of the component  a class```class=${uppercase(this.name)}``` to distinguish the style of the component in a .sass distinct file,  while it's mandatory to have an id```id="${this.id}"``` which is injected during the creation of the different istances and then used by the engine to manage the cached istances.

To have nested components just place in the component template a div with the attribute ```data-component="<name of the component>"```. Porperties passed from a parent to child components are defined by the attribute ```data-props="<property x name>:<property x name>..."```. Luce.js injects ```$ele``` for accessing the HTML root of the component inside each component and ```$log``` for logging accordin to the debug flag passed during the bootstrap phase. For filter functions inside the template just use ```pure functions```.

```javascript

function template () {
    return html`<div class=${this.name} id="${this.id}">
                <h3>Dad component</h3>  
                <p>Counter: ${this.counter}</p>
                <button data-event="click:add"> + </button>
                <button data-event="click:remove"> - </button>
                <p>Computed properties and filter: ${uppercase(this.interpolated)}</p>
                <hr> 
                <div data-component="child-component" data-props="form:name"></div>
            </div>`;
}

import {html} from 'lit-html';

// FILTER
import uppercase from './../filters/uppercase';

export function dadCtrl (id) {
    return {
        id: id,
        name: 'dad-component',
        template: template,
        data: {
            counter: 0
        },
        computed:{
            interpolated (params) {
                return `Clicked ${this.counter} times`;
            }
        },
        events: {
            add: function (e) {
                this.counter++;
            },
            remove: function (e) {
                this.counter--;
            }
        }
        onInit(){ },
        onPropsChange(){ },
        onDestroy(){ }
    }
};
```

## Router
To use the provided router during the bootstrap of the app just map the URLs with the associated component to be displayed, set the 'fallback' component and start listening for URL changes:
```javascript
window.onload = function () {

    const root = document.getElementById('output');  // the root of the app

    const app = new Luce(root, {debug:true});        // pass the root and a configuration obj

    // registering components
    app.addComponent('dad-component', dadCtrl)
        .addComponent('child-component', childCtrl)
        .addComponent('shared-component', sharedCtrl)
        .addComponent('about-component', aboutCtrl)
        .addComponent('not-found-component', notFoundCtrl);

    // rendering the root with FE ROUTER
    app.router
        .addRoute('/', 'dad-component')
        .addRoute('/about', 'about-component')
        .addRoute('/about/:id/:counter', 'about-component')
        .ifNotFound('not-found-component')
        .start()
        .beforeChange(($e)=> $e.main.classList.add('fade'))
        .afterChange(($e)=> $e.main.classList.remove('fade'))

}
```

To use links for routing inside the template just use the attribute ```data-navigation``` as follows:
```html
 <nav>
    <a data-navigation href="/about"> About </a>
    <a data-navigation href="/about/:${this.id}/${this.counter}"> About "with params"</a>
</nav>
```

In order to access the router navigation methods and read the URl params Luce.js injects inside each component the ```$router```object:
```javascript
export function aboutCtrl (id) {
    return {
        id: id,
        name: "about-component",
        template: templateFactory,
        data: {

        },
        events: {
            gotoHome () {
                this.$router.navigate('/');
            }
        },
        onInit () {
            console.log('Route params', this.$router.params);
        }
    }
}
```

## HTTP
Luce.js injects inside each component the ```$http```object for HTTP ```.get```, ```.post```, ```.put```, ```.patch```, ```.delete``` requests:

```javascript
async getRandom () {
                try {
                    this.loading = true;
                    let toAvoidCors = 'https://cors-anywhere.herokuapp.com';
                    let response = await this.$http.get(toAvoidCors + '/https://swapi.co/api/people');
                    this.items = response.results;
                    this.loading = false;
                } catch (error) {
                    console.log('Error: ', error);
                    this.loading = false;
                }
            }
```

## Built With

HTML5, CSS, Javascript, [lit-html](https://github.com/polymer/lit-html), 

## Versioning

Versione 0.1.9

## License

This project is licensed under the MIT License.






