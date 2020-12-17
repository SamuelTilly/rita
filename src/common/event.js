function normalizeEventPosition (handler) {
  return function (evt) {
    const rect = evt.target.getBoundingClientRect()
    let clientX = evt.clientX
    let clientY = evt.clientY

    if (evt.changedTouches) {
      clientX = evt.changedTouches[evt.changedTouches.length - 1].clientX
      clientY = evt.changedTouches[evt.changedTouches.length - 1].clientY
    }

    handler({
      pos: {
        x: clientX - rect.left,
        y: clientY - rect.top
      },
      ...evt
    })
  }
}

export function addPressEvent (el, handler) {
  el.addEventListener('touchend', normalizeEventPosition(handler))
  el.addEventListener('mouseup', normalizeEventPosition(handler))
}
