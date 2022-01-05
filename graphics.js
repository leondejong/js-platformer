// Formatted by StandardJS

const rectangle = 'rectangle'
const graphic = 'graphic'

const backgroundColorBottom = 'rgba(223, 239, 255, 1)'
const backgroundColorTop = 'rgba(127, 159, 255, 1)'
const backgroundColor = 'rgba(223, 239, 247, 1)'
const contentColor = 'rgba(0, 47, 63, 1)'
const playerColor = 'rgba(255, 63, 0, 1)'
const textColor = 'rgba(0, 47, 63, 1)'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

const width = canvas.width
const height = canvas.height

const scale = 1

async function getTile () {
  return await configure({
    element: '#canvas',
    source: './tiles.png',
    position: { x: 0, y: 0 },
    dimension: { x: 18, y: 18 },
    frames: 180,
    rows: 9,
    columns: 20,
    first: 1,
    last: 1
  })
}

async function getCharacter () {
  return await configure({
    element: '#canvas',
    source: './character.png',
    position: { x: 325, y: 16 },
    dimension: { x: 24, y: 32 },
    offset: { x: -4, y: 0 },
    scale: { x: scale, y: scale },
    frames: 32,
    rows: 4,
    columns: 8,
    first: 1,
    last: 1,
    run: true
  })
}

function getRectangle (x, y, width, height, color = contentColor) {
  return {
    color,
    type: rectangle,
    position: { x, y },
    dimension: { x: width, y: height }
  }
}

function getGraphic (nx, ny, nw, nh, sprite, tile, solid = true) {
  const width = sprite.dimension.x * sprite.scale.x
  const height = sprite.dimension.y * sprite.scale.y
  const rectangle = getRectangle(
    width * nx,
    height * ny,
    width * nw,
    height * nh
  )
  return {
    ...range(sprite, tile),
    type: graphic,
    rectangle: solid ? rectangle : false,
    data: { nx, ny, nw, nh, tile, width, height }
  }
}

function getScene (sprite) {
  return {
    gravity: 30,
    friction: 0.025,
    airResistance: 0.05,
    width: canvas.width,
    height: canvas.height,
    data: getLevel(sprite)
  }
}

function getPlayer () {
  return {
    type: rectangle,
    color: playerColor,
    position: { x: 325, y: 16 },
    dimension: { x: 16 * scale, y: 32 * scale },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    previous: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    impulse: { x: 32, y: 0, jump: 14 },
    up: 69, // e
    left: 83, // s
    down: 68, // d
    right: 70, // f
    resistance: 0,
    friction: 0.025,
    density: 0.25,
    mass: 64
  }
}

function drawBackground () {
  const gradient = context.createLinearGradient(0, height, 0, 0)
  gradient.addColorStop(0, backgroundColorBottom)
  gradient.addColorStop(1, backgroundColorTop)
  context.fillStyle = gradient || backgroundColor
  context.fillRect(0, 0, width, height)
}

function drawRectangle (rectangle) {
  context.fillStyle = rectangle.color || contentColor
  context.fillRect(
    rectangle.position.x,
    rectangle.position.y,
    rectangle.dimension.x,
    rectangle.dimension.y
  )
}

function drawGraphic (graphic) {
  const { nx, ny, nw, nh, width, height, tile } = graphic.data
  for (let x = 0; x < nw; x++) {
    for (let y = 0; y < nh; y++) {
      display({
        ...range(graphic, tile),
        position: {
          x: (nx + x) * width,
          y: (ny + y) * height
        }
      })
    }
  }
}

function getDiagonalSection (nx, ny, sprite, length = 8, tile = 48) {
  return Array(length)
    .fill()
    .map((_, position) =>
      getGraphic(position + nx, position + ny, 1, 1, sprite, tile)
    )
}

function getHorizontalSection (nx, ny, sprite, length = 4, tiles) {
  const { single, first, middle, last } = tiles || {
    single: 48,
    first: 49,
    middle: 50,
    last: 51
  }
  if (length < 1) {
    return []
  }
  if (length === 1) {
    return [getGraphic(nx, ny, 1, 1, sprite, single)]
  }
  if (length === 2) {
    return [
      getGraphic(nx, ny, 1, 1, sprite, first),
      getGraphic(nx + 1, ny, 1, 1, sprite, last)
    ]
  }
  return [
    getGraphic(nx, ny, 1, 1, sprite, first),
    getGraphic(nx + 1, ny, length - 1, 1, sprite, middle),
    getGraphic(nx + length - 1, ny, 1, 1, sprite, last)
  ]
}

function getVerticalSection (nx, ny, sprite, length = 4, tiles) {
  const graphic = { ...sprite, rotation: Math.PI / 2 }
  const { single, first, middle, last } = tiles || {
    single: 48,
    first: 49,
    middle: 50,
    last: 51
  }
  if (length < 1) {
    return []
  }
  if (length === 1) {
    return [getGraphic(nx, ny, 1, 1, graphic, single)]
  }
  if (length === 2) {
    return [
      getGraphic(nx, ny, 1, 1, graphic, first),
      getGraphic(nx, ny + 1, 1, 1, graphic, last)
    ]
  }
  return [
    getGraphic(nx, ny, 1, 1, graphic, first),
    getGraphic(nx, ny + 1, 1, length - 1, graphic, middle),
    getGraphic(nx, ny + length - 1, 1, 1, graphic, last)
  ]
}
