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

* `open`: Opens the pane to the specified side
```javascript
snapper.open('left');
// OR
snapper.open('right');
```
