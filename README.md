# rita

Simple app for zen-like-coloring of a hidden image

## TODO

* Ignore pixels with alpha below 255

### Colorselector should display if any given color is done

* Checkbox on colorselect box
* Progressbar?

### Storage

* IndexedDB https://github.com/jakearchibald/idb
  * https://caniuse.com/indexeddb

### Upload image and use canvas to pixelate and simplify colors?

* Scale down image to 50x50
* Get list of colors https://stackoverflow.com/questions/13242660/list-unique-colors-in-an-html-canvas
* Sort list of colors
* Split list of colors by how many we want and create a color pallet.
* Apply color pallet to image https://stackoverflow.com/questions/16087529/limit-canvas-colors-to-a-specific-array
* Save image information on client using IndexedDB

### Setup a build job

* Use parcel, parallel or similar builder
* Setup github actions for automatic builds
* Add testing
* Add linting and coverage report
