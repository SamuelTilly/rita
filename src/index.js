import panzoom from 'panzoom'

let currentColor
const drawAreaScale = 100
const imageSrc = '/file50x50.gif'

function getContext (el) {
  const canvas = document.getElementById(el)
  return canvas.getContext('2d')
}

function isTouchDevice () {
  if ('ontouchstart' in window || window.TouchEvent) { return true }

  if (window.DocumentTouch && document instanceof DocumentTouch) { return true }

  const prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-']
  const queries = prefixes.map(prefix => `(${prefix}touch-enabled)`)

  return window.matchMedia(queries.join(',')).matches
}

function addPressEvent (el, cb) {
  if (isTouchDevice()) {
    console.log('touch event')
    el.addEventListener('touchend', cb)
  } else {
    el.addEventListener('mouseup', cb)
  }
}

function init () {
  const img = loadImage()
  const viewportContext = getContext('viewport')
  const resultContext = getContext('result')
  const drawAreaContext = getContext('drawArea')

  const panzoomInstance = panzoom(drawAreaContext.canvas, {
    maxZoom: 1,
    minZoom: 0.1,
    initialZoom: 0.5,
    zoomDoubleClickSpeed: 1,
    bounds: true,
    boundsPadding: 0.1,
    smoothScroll: true
  })

  img.onload = function () {
    viewportContext.canvas.width = img.width
    viewportContext.canvas.height = img.height
    viewportContext.drawImage(img, 0, 0)

    resultContext.canvas.width = img.width
    resultContext.canvas.height = img.height

    drawAreaContext.canvas.width = img.width * drawAreaScale
    drawAreaContext.canvas.height = img.height * drawAreaScale

    drawAreaContext.fillStyle = '#f9f9f9'
    drawAreaContext.fillRect(
      0,
      0,
      drawAreaContext.canvas.width,
      drawAreaContext.canvas.height
    )

    const colorList = getColorList(viewportContext, drawAreaContext, img)

    drawSelectableColors(colorList)
  }

  function getEventPosition (canvas, evt) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (evt.changedTouches ? evt.changedTouches[0].clientX : evt.clientX) - rect.left,
      y: (evt.changedTouches ? evt.changedTouches[0].clientY : evt.clientY) - rect.top
    }
  }

  addPressEvent(drawAreaContext.canvas, evt => {
    attemptDraw(
      getEventPosition(drawAreaContext.canvas, evt),
      viewportContext,
      drawAreaContext,
      resultContext,
      img,
      panzoomInstance
    )
  })
}

function loadImage () {
  const img = new Image()
  img.src = imageSrc
  img.crossOrigin = 'anonymous'
  img.onerror = function () {
    console.error('could not load image')
  }
  return img
}

function drawSelectableColors (colorList) {
  const container = document.getElementById('colorselect')

  Object.keys(colorList).forEach((color, index) => {
    const colorEl = document.createElement('div')
    colorEl.style.background = color
    colorEl.style.color = getContrast50(color)
    colorEl.innerHTML = index + 1
    colorEl.dataset.available = colorList[color]

    function eventHandler () {
      currentColor = color

      for (let i = 0; i < container.children.length; i++) {
        container.children[i].className = ''
      }

      colorEl.className = 'selected'
    }

    addPressEvent(colorEl, eventHandler)

    if (index === 0) {
      eventHandler()
    }

    container.appendChild(colorEl)
  })
}

function componentToHex (c) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

function getContrast50 (hexcolor) {
  return parseInt(hexcolor.replace('#', ''), 16) > 0xffffff / 2
    ? 'black'
    : 'white'
}

function attemptDraw (
  pos,
  viewportContext,
  drawAreaContext,
  resultContext,
  img,
  panzoomInstance
) {
  const scale = panzoomInstance.getTransform().scale
  const x = Math.ceil(pos.x / scale / drawAreaScale) - 1
  const y = Math.ceil(pos.y / scale / drawAreaScale) - 1

  const [r, g, b] = viewportContext.getImageData(x, y, 1, 1).data

  const color = rgbToHex(r, g, b)

  if (currentColor === color) {
    drawAreaContext.fillStyle = color
    drawAreaContext.fillRect(
      x * drawAreaScale,
      y * drawAreaScale,
      drawAreaScale,
      drawAreaScale
    )

    resultContext.fillStyle = color
    resultContext.fillRect(x, y, 1, 1)
  }
}

function forEachPixel (viewportContext, cb) {
  const result = []
  const { width, height } = viewportContext.canvas
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const [r, g, b] = viewportContext.getImageData(x, y, 1, 1).data

      const color = rgbToHex(r, g, b)
      const unique = !result.includes(color)

      if (unique) {
        result.push(color)
      }

      cb(x, y, color, result.indexOf(color), unique)
    }
  }
}

function getColorList (viewportContext, drawAreaContext, img) {
  const result = {}

  forEachPixel(viewportContext, (x, y, color, colorIndex, unique) => {
    drawAreaContext.beginPath()
    drawAreaContext.rect(
      x * drawAreaScale,
      y * drawAreaScale,
      drawAreaScale,
      drawAreaScale
    )
    drawAreaContext.stroke()
    drawAreaContext.fillStyle = '#000'
    drawAreaContext.font = 0.3 * drawAreaScale + 'px Arial'
    drawAreaContext.textAlign = 'center'
    drawAreaContext.fillText(
      colorIndex + 1,
      x * drawAreaScale + drawAreaScale / 2,
      y * drawAreaScale + drawAreaScale / 2 + (0.3 * drawAreaScale) / 2
    )

    if (unique) {
      result[color] = 0
    } else {
      result[color] += 1
    }
  })

  return result
}

document.addEventListener('DOMContentLoaded', init)
