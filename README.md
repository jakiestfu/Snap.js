Snap.js
=======

Emulates native side-menus in Javascript


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
    resistance: 0.5,
    flickThreshold: 50,
    transitionSpeed: 0.3,
    maxPosition: 266,
    minPosition: -266,
    tapToClose: true,
    slideIntent: 40
}
```

* **`element`**: The element which the user will be sliding side to side
* **`resistance`**: The cooeficcient used to slow sliding when user has passed max or min threshold
* **`flickThreshold`**: Number of pixels the user needs to swiftly travel to activate a "flick" open
* **`transitionSpeed`**: The speed at which the pane slides open or closed
* **`maxPosition`**: Maximum number of pixels the pane may be slid to the right
* **`minPosition`**: Maximum number of pixels the pane may be slid to the left
* **`tapToClose`**: If true, tapping an open pane will close it
* **`slideIntent`**: The number of degrees the user must initiate sliding in towards the left or right (see diagram below)

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

### `on`: Adds an event hook

```javascript
snapper.on('start', function(){
  // Do Something
});
```
The available methods to hook into are as follows:

* `start`: Fired when touching down on the draggable pane and it begins to move
* `drag`: Fired when the pane has been moved or slid
* `stop`: Fired when the pane has been let go od
* `animated`: Fired when the pane is finished it's animations
* `ignore`: Fired when trying to drag the pane but ended up dragging on an ignored element

### `off`: Removes an event hook

```javascript
snapper.off('drag');
```
The event names listed above apply for the `off` method.


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
      sinceDirectionChange: 10 // Pixels pane has translated since the direction of the pane has changed
    }
  }
} 
```

