import { rgbToHex } from './color'

export function getContext (el) {
  const canvas = document.getElementById(el)
  return canvas.getContext('2d')
}

export function forEachPixel (context, cb) {
  const result = []
  const { width, height } = context.canvas
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const color = getColorAtPos(context, { x, y })
      const unique = !result.includes(color)

      if (unique) {
        result.push(color)
      }

      cb(x, y, color, result.indexOf(color), unique)
    }
  }
}

export function getColorList (viewportContext, drawAreaContext, drawAreaScale) {
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
      result[color] = 1
    } else {
      result[color] += 1
    }
  })

  return result
}

export function getEventPosition (canvas, evt) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (evt.changedTouches ? evt.changedTouches[0].clientX : evt.clientX) - rect.left,
    y: (evt.changedTouches ? evt.changedTouches[0].clientY : evt.clientY) - rect.top
  }
}

export function getColorAtPos (context, { x, y }) {
  const [r, g, b] = context.getImageData(x, y, 1, 1).data
  return rgbToHex(r, g, b)
}
