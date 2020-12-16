export function componentToHex (c) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

export function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function getContrast50 (hexcolor) {
  return parseInt(hexcolor.replace('#', ''), 16) > 0xffffff / 2
    ? 'black'
    : 'white'
}
