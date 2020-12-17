import panzoom from 'panzoom'
import { getContrast50 } from './common/color'
import { getContext, getColorList, forEachPixel, getColorAtPos } from './common/canvas'
import { state } from './state'
import { observe } from 'dob'
import { addPressEvent } from './common/event'

observe(() => {
  drawSelectableColors(state)
})

function init () {
  const img = loadImage()
  const viewportContext = getContext('viewport')
  const resultContext = getContext('result')
  const drawAreaContext = getContext('drawArea')

  const panzoomInstance = panzoom(drawAreaContext.canvas, state.panzoom)

  img.onload = function () {
    viewportContext.canvas.width = img.width
    viewportContext.canvas.height = img.height
    viewportContext.drawImage(img, 0, 0)

    resultContext.canvas.width = img.width
    resultContext.canvas.height = img.height

    drawAreaContext.canvas.width = img.width * state.drawAreaScale
    drawAreaContext.canvas.height = img.height * state.drawAreaScale

    drawAreaContext.fillStyle = '#f9f9f9'
    drawAreaContext.fillRect(
      0,
      0,
      drawAreaContext.canvas.width,
      drawAreaContext.canvas.height
    )

    state.availableColors = getColorList(viewportContext, drawAreaContext, state.drawAreaScale)
    state.paintedColors = Object.assign({}, state.availableColors)
  }

  addPressEvent(drawAreaContext.canvas, evt => {
    const pos = normalizeEventPosition(evt.pos, panzoomInstance)
    const color = getColorAtPos(viewportContext, pos)

    if (evt.shiftKey) {
      forEachPixel(viewportContext, (x, y, c) =>
        c === color && attemptDraw({ x, y }, color, drawAreaContext, resultContext))
    } else {
      attemptDraw(
        pos,
        color,
        drawAreaContext,
        resultContext
      )
    }
  })
}

function loadImage () {
  const img = new Image()
  img.src = state.imageSrc
  img.crossOrigin = 'anonymous'
  img.onerror = function () {
    console.error('could not load image')
  }
  return img
}

function drawSelectableColors ({ availableColors, paintedColors, currentColor }) {
  const container = document.getElementById('colorselect')

  if (!container) {
    return null
  }

  container.innerHTML = ''

  Object.keys(availableColors).forEach((color, index) => {
    const usage = paintedColors[color] === availableColors[color]
      ? 0
      : ((availableColors[color] - paintedColors[color]) / availableColors[color]) * 100
    const colorEl = document.createElement('div')
    const colorPercentageEl = document.createElement('div')
    colorEl.style.background = color
    colorEl.style.color = getContrast50(color)
    colorEl.innerHTML = Math.floor(usage) === 100 ? '✅' : `${index + 1}`
    colorEl.dataset.painted = usage
    colorEl.title = `${Math.floor(usage)}% done`

    colorPercentageEl.style.height = `${100 - Math.floor(usage)}%`

    if (currentColor === color) {
      colorEl.className = 'selected'
    }

    addPressEvent(colorEl, () => {
      state.currentColor = color
    })

    if (index === 0 && !state.currentColor) {
      state.currentColor = color
    }

    colorEl.appendChild(colorPercentageEl)
    container.appendChild(colorEl)
  })
}

function normalizeEventPosition ({ x, y }, panzoomInstance) {
  const scale = panzoomInstance.getTransform().scale

  return {
    x: Math.ceil(x / scale / state.drawAreaScale) - 1,
    y: Math.ceil(y / scale / state.drawAreaScale) - 1
  }
}

function attemptDraw (
  { x, y },
  color,
  drawAreaContext,
  resultContext
) {
  const colorAtPos = getColorAtPos(drawAreaContext, {
    x: (x * state.drawAreaScale) + state.drawAreaScale / 2,
    y: (y * state.drawAreaScale) + state.drawAreaScale / 2
  })

  if (state.currentColor === color && colorAtPos !== color) {
    drawAreaContext.fillStyle = color
    drawAreaContext.fillRect(
      x * state.drawAreaScale,
      y * state.drawAreaScale,
      state.drawAreaScale,
      state.drawAreaScale
    )

    resultContext.fillStyle = color
    resultContext.fillRect(x, y, 1, 1)

    state.paintedColors[color] -= 1
  }
}

document.addEventListener('DOMContentLoaded', init)
