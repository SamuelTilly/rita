import { observable } from 'dob'

export const state = observable({
  panzoom: {
    maxZoom: 1,
    minZoom: 0.1,
    initialZoom: 0.5,
    zoomDoubleClickSpeed: 1,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: true
  },
  drawAreaScale: 100,
  imageSrc: '/file50x50.gif',
  currentColor: undefined,
  availableColors: {},
  paintedColors: {}
})
