# Table of contents
- [Bootstrap](#bootstrap)  
- [Components](#components)  
- [Router](#router)  
- [Http](#http)  



## Bootstrap

Just import the framework and create an istance,  register the components, optionally set the roouter and the middlewares, and init the framework:
```javascript


import Luce from 'lucejs':

window.onload = function () {

    const root = document.getElementById('output');  // root of the app
    const app = new Luce(root, {debug:true});        // (optional) pass a configuration object

    // (optional) run middlewares to set plugin, global services etc
    app.use((luce,next)=>{
        const config = {
            URL: 'localhost:3000',
            language:'en'
            availableLanguages:['en','ita']
            ...
        };
        luce.plug('config', config); // .plug() injects a $<name> obj in each component (in this case $config)
        next();     // advance to the next middleware
    })
    use((luce,next)=>{
        // do something...
    });

    // (required) registering components 
    app.addComponent('dad-component', dadCtrl)
       .addComponent('child-component', childCtrl)
       .addComponent('about-component', aboutCtrl);
        
    // (required) if ROUTER is not used a root and the name of the component to be rendered must be provided
    app.init(root, 'dad-component');
}
```

## Components

Each component has in one single ```.js```file the function responsible for the compilation of the template and the object representing the component, containing the component name, model data, functions associated with events, computed properties and component hooks. For didactic purpose I haven't used the events of [lit-html](https://github.com/polymer/lit-html))so  events have been automatically added and removed according to the life cycle of the component and its presence in the current route. Events are registered with the attribute  ```data-event="<event type>:<action name>"```. It's higly recommeded to use in the root of the component  a class```class=${uppercase(this.name)}``` to distinguish the style of the component in a .sass distinct file,  while it's mandatory to have an id```id="${this.id}"``` which is injected during the creation of the different istances and then used by the engine to manage the cached istances.

To have nested components just place in the component template a div with the attribute ```data-component="<name of the component>"```. Porperties passed from a parent to child components are defined by the attribute ```data-props="<property x name>:<property x name>..."```. Luce.js injects, inside each component, ```$ele``` for accessing the HTML root of the component, ```$log``` for logging (according to the debug flag passed during the bootstrap phase) and ```$event``` for emit, subscribe (```.on()```) and unsubscribe (```.off()```)to custom events. For filter functions inside the template just use ```pure functions```.

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
        onInit(){
            this.$event.on('from-child', (payload)=>{
                this.$log.log(payload);
            });
         },
        onPropsChange(){ },
        onDestroy(){ 
             this.$event.off('from-child', (payload)=>{
                this.$log.log(payload);
            });
        }
    }
};
```

## Router
To use the provided router during the bootstrap of the app just map the URLs with the associated component to be displayed, set the 'fallback' component and start listening for URL changes:
```javascript
window.onload = function () {

    const root = document.getElementById('root');  // root of the app

    const app = new Luce(root, { debug: true });   // passing the root and a config obj

    // registering components
    app.addComponent('dad-component', dadCtrl)
        .addComponent('child-component', childCtrl)
        .addComponent('shared-component', sharedCtrl)
        .addComponent('about-component', aboutCtrl)
        .addComponent('not-found-component', notFoundCtrl)

    // rendering the root with FE ROUTER
    app.router
        // page fade animation 
        .beforeChange((luce) => luce.main.classList.add('fade'))
        .afterChange( (luce) => luce.main.classList.remove('fade'))
        // mapping path
        .addRoute('/', 'dad-component')
        .addRoute('/about', 'about-component')
        .addRoute('/about/:id/:counter', 'about-component')
        .ifNotFound('not-found-component')
    
    // start the app (if router is set .init() does not need arguments)
    app.init()
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

## Http
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