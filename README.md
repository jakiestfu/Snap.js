Snap.js
=======

Emulates native side-menus in Javascript


## Usage

```javascript
var snapper = new Snap({
  element: document.getElementById('content')
});
```

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

