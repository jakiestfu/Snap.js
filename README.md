# Snap.js
A Library for creating beautiful mobile shelfs in Javascript

<a href="http://www.screenr.com/embed/0EJ7" target="_blank">View Video Preview</a>

<a href="http://jakiestfu.github.io/Snap.js/" target="_blank">View Demos</a>

<a href="http://www.screenr.com/embed/0EJ7" target="_blank"><img src="http://i.imgur.com/t3mGcEx.gif"></a>

* [Features](#features)
* [Support](#support)
* [Installation](#installation)
* [Usage](#usage)
* [Settings &amp; Defaults](#settings-and-defaults)
* [Public Methods](#public-methods)
* [Gotchas](#gotchas)
* [FAQ's](#faq)
* [Compliments](#compliments)
* [Licensing](#licensing)
* [Extras](#extras)

## Features
* Library Independent
* High Customization
* Flick Support
* User Intent Detection
* Disable Hyperextension
* Event Hooks
* CSS3 Powered Animations with IE fallbacks
* Drag Support
* Drag Handle Support
* Programatic API
* "No-Drag" Elements
* Definable Easing Mode
* Enable/Disable Events
* Disabled Sides (left or right)
* Supports [Ratchet](http://maker.github.com/ratchet/) (with templates!)

## Support
* Firefox 10+
* Wide Webkit Support (including Android WebKit 2.3.X)
* IE 10
* IE 9 Supports Toggling, Dragging but no Transitions
* IE 7/8 Supports Toggling but no dragging or Transitions

## Installation

As standalone just include the file in a script tag:

```html
<script src="snap.js"></script>
```

As a <a href="http://component.io" target="_blank">web component</a> do:

```shell
$ component install jakiestfu/Snap.js
```

## Usage

```javascript
var snapper = new Snap({
  element: document.getElementById('content')
});
```

## Settings and Defaults
```javascript
settings = {
    element: null,
    dragger: null,
    disable: 'none',
    addBodyClasses: true,
    hyperextensible: true,
    resistance: 0.5,
    flickThreshold: 50,
    transitionSpeed: 0.3,
    easing: 'ease',
    maxPosition: 266,
    minPosition: -266,
    tapToClose: true,
    touchToDrag: true,
    slideIntent: 40,
    minDragDistance: 5
}
```

* `element`: The element which the user will be sliding side to side
* `dragger`: The element which the user will be using to slide the target element side to side
* `disable`: String, set to 'left' or 'right' to disable the respective side
* `addBodyClasses`: Add classes to the body to signify which side is being opened
* `hyperextensible`: If false, pane may not be slide past the minPosition and maxPosition
* `resistance`: The cooeficcient used to slow sliding when user has passed max or min threshold
* `flickThreshold`: Number of pixels the user needs to swiftly travel to activate a "flick" open
* `transitionSpeed`: The speed at which the pane slides open or closed
* `easing`: The CSS3 Easing method you want to use for transitions
* `maxPosition`: Maximum number of pixels the pane may be slid to the right
* `minPosition`: Maximum number of pixels the pane may be slid to the left
* `tapToClose`: If true, tapping an open pane will close it
* `touchToDrag`: If true, dragging the target `settings.element` will open/close the pane
* `minDragDistance`: The minimum amount of pixels the user needs to drag within the `slideIntent` degrees to move the pane 
* `slideIntent`: The number of degrees the user must initiate sliding in towards the left or right (see diagram below)

Notes on Slide Intent: The slide intent is an int between 0 and 90, and represents the degrees in the first quadrant of a circle that you would like to have mirrored on the X *and* Y axis. For example, if you have 40 set as your `slideIntent` value, the user would only be able to slide the pane by dragging in the blue area in the diagram below. Once intent has been defined, it will not change until the user releases.

<img src="http://i.imgur.com/uG2CNR8.png">


## Public Methods

### `open`: Opens the pane to the specified side

```javascript
snapper.open('left');
// OR
snapper.open('right');
```

### `close`: Closes the pane

```javascript
snapper.close();
```

### `expand`: Opens the pane entirely

```javascript
snapper.expand('left');
// OR
snapper.expand('right');
```

### `disable`: Disables sliding events

```javascript
snapper.disable();
```

### `enable`: Enables sliding events after disabling

```javascript
snapper.enable();
```

### `on`: Adds an event hook

```javascript
snapper.on('start', function(){
  // Do Something
});
```
The available methods to hook into are as follows:

* `start`: Fired when touching down on the draggable pane and it begins to move
* `drag`: Fired when the pane has been moved or slid
* `end`: Fired when the pane has been let go of
* `animating`: Fired when the pane is animating
* `animated`: Fired when the pane is finished it's animations
* `ignore`: Fired when trying to drag the pane but ended up dragging on an ignored element

### `off`: Removes an event hook

```javascript
snapper.off('drag');
```
The event names listed above apply for the `off` method.


### `settings`: Updates the settings for an already instantiated object
```javascript
snapper.settings({yourSettings});
```
Currently, `settings.element`, `settings.touchToDrag` cannot be updated. To update the element, instantiate a new object. To allow listening to a drag, use `snapper.enable()`

### `state`: Returns detailed information about the state of the pane

```javascript
var data = snapper.state();
```
The data returned from the `state` method will look like the following:

```javascript
{
    state: "closed", // State of the Pane
    info:{
        opening: "left", // Side which user intends to open
        towards: "right", // Direction user is dragging towards
        hyperExtending: false, // True if user is pulling past predefined bounds
        halfway: false, // True if pane is at least halfway open
        flick: false, // True if user has moved pane X amount of pixels in the open/close direction without changing directions
        translation:{
            absolute: 20, // Pixels pane has translated
            relative: 21, // Pixels pane has translated relative to starting translation
            sinceDirectionChange: 10, // Pixels pane has translated since the direction of the pane has changed
            percentage: 40.571649 // The percentage that the Pane is open. Good or animating other things
        }
    }
} 
```

## Gotchas

### Layout
The layout itself is what most people will have a hard time emulating, so the simplest approach I have found is as follows:

Two absolute elements, one to represent *all* the content, and another to represent *all* the drawers. The content has a higher z-index than the drawers. Within the drawers element, it's direct children should represent the containers for the drawers, these should be `fixed` or `absolute`. Assigning classes to your drawers to specify which side it is on is recommended. All absolutely positioned elements should have 0 for `top, left, right, bottom` properties, excluding your panes which will have `auto` set to their respective sides and a width assigned. The width of your drawers is usually the same number you want to use for `minPosition` and `maxPosition`

```html
div.drawers {position: absolute;}
    div.left-drawer  {position: absolute;}
        [content]
    div.right-drawer  {position: absolute;}
        [content]
div#content {position: absolute;}
    [top-bars]
    [content] {overflow: auto}
    [bottom-bars]
```

A sample layout is found in demo/apps/default.html.

### Independent Scrolling
Some CSS is required to get some smooth ass scrolling. Utilize the CSS below to apply this to any of your elements:
```css
.scrollable{
    overflow: auto;
    -webkit-transition-property: top, bottom;
    transition-property: top, bottom;
    -webkit-transition-duration: .2s, .2s;
    transition-duration: .2s, .2s;
    -webkit-transition-timing-function: linear, linear;
    transition-timing-function: linear, linear;
    -webkit-overflow-scrolling: touch;
}
```

### Z-Indeces and Display
Because of the nature of this code, drawers are just kind of stacked behind the content. To bring the proper drawer to the front, you can hook into Snaps.js' CSS classes:

With `addBodyClasses` set to `true` in your initialize options, one of the two classess will be added to the body tag: `.snapjs-left` or `.snapjs-right`, depending on which pane is being open, respectively. This being said, you can apply your CSS like the following to show the proper drawers:

```css
.snapjs-right .left-drawer,
.snapjs-left .right-drawer {
    display: none;
}
```

## FAQ

### - How do I make a toggle button?
Toggles have been a popular request, but rather than bog the library down with additional methods, you can utilize the powerful API of Snap.js to create your own toggle. Toggles can be done like the following:

```javascript
myToggleButton.addEventListener('click', function(){

    if( snapper.state().state=="left" ){
        snapper.close();
    } else {
        snapper.open('left');
    }

});
```

### - How do I disable Snap.js dragging for my touch slider?
Snap.js supports cascading cancellation of events via a data attribute `data-snap-ignore`. If you were to use a slider, your markup might look like the following:

```html
<div class="slider" data-snap-ignore="true">
    <ul>
        <li><img src="slide.jpg"></li>
        <li><img src="slide.jpg"></li>
        <li><img src="slide.jpg"></li>
        <li><img src="slide.jpg"></li>
        <li><img src="slide.jpg"></li>
    </ul>
</div>
```

All interactions on children elements of the element with the `data-snap-ignore` attribute will have their Snap.js events ignored.


### - I am using Push.js from Ratchet, I keep losing my events on my elements, how can I fix this?
Simple. As wack as Push.js is (yes, it is in desperate need of attention as of v1.0.0), we can still solve this problem with it's only callback, `'push'`.

```javascript
// The function that will initialize your Snap.js instance
var doSnap = function(){
    if(window.snapper){
         // Snap.js already exists, we just need to re-bind events
        window.snapper.enable();
    } else {
        // Initialize Snap.js
        window.snapper = new Snap({
            element: document.getElementById('content')
        });
    } 
};

window.addEventListener('push', doSnap);
doSnap();
```

### - Snap.js works on my Android device but i cannot scroll the content in my drawers, what gives?
Older Android devices (and iPhone as well) do not have native support for overflow scrolling. To solve this, you may use the wonderful library called [iScroll](https://github.com/cubiq/iscroll)

### - `transform: translate3d()` breaks my fixed child elements, how can I solve this?
[This is a problem with Chromium](https://code.google.com/p/chromium/issues/detail?id=20574) and should be fixed soon. I would advise not having your direct children element set to fixed, that may possibly solve your problem.

### - I am experiencing a weird flicker when the CSS transform is applied
To solve the flicker, apply the following CSS to the element in question
```css
#content{
    backface-visibility:hidden;
    -webkit-backface-visibility:hidden; /* Chrome and Safari */
    -moz-backface-visibility:hidden; /* Firefox */
    -ms-backface-visibility:hidden; /* Internet Explorer 10+ */
}
```

## Compliments

This code attempts to make your webapp's feel more "native". These other repos go well with it, too!

* [Snap.js](https://github.com/jakiestfu/Snap.js)
* [AppScroll.js](https://github.com/jakiestfu/AppScroll)
* [fastclick](https://github.com/ftlabs/fastclick)

## Licensing

MIT, dawg