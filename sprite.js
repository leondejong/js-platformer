// Formatted by StandardJS

function randomString (length = 12) {
  return length < 9
    ? Math.random()
        .toString(36)
        .substr(2, length)
    : randomString(8) + randomString(length - 8)
}

function base () {
  return {
    identifier: randomString(8),
    element: '#canvas',
    source: 'sprite.png',
    position: { x: 0, y: 0 },
    dimension: { x: 0, y: 0 },
    shift: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    frames: 32,
    frame: 0,
    rows: 4,
    columns: 8,
    row: 0,
    column: 0,
    first: 0,
    last: 0,
    rotation: 0,
    run: false,
    center: false,
    reverse: false
  }
}

async function load (source, width, height) {
  return new Promise(resolve => {
    const image = new Image(width, height)
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.src = source
  })
}

async function configure (options = {}) {
  const sprite = { ...base(), ...options }
  return await setup(sprite)
}

async function setup (sprite) {
  const s = { ...sprite }
  s.canvas = document.querySelector(s.element)
  s.context = s.canvas.getContext('2d')
  s.context.imageSmoothingEnabled = false
  s.last = s.last === 0 ? s.frames : s.last
  s.first = s.first === 0 ? 1 : s.first
  s.frame = s.reverse ? s.last : s.first
  s.image = await load(s.source)
  return refresh(s)
}

function refresh (sprite) {
  const s = { ...sprite }
  s.row = Math.floor((s.frame - 1) / s.columns)
  s.column = Math.floor(s.frame - 1 - s.row * s.columns)
  s.shift.x = s.column * s.dimension.x
  s.shift.y = s.row * s.dimension.y
  return s
}

function next (sprite) {
  let s = { ...sprite }
  if (++s.frame > s.last) s.frame = s.first
  return refresh(s)
}

function previous (sprite) {
  let s = { ...sprite }
  if (--s.frame < s.first) s.frame = s.last
  return refresh(s)
}

function subsequent (sprite) {
  if (!sprite.run) return sprite
  if (sprite.reverse) return previous(sprite)
  return next(sprite)
}

function range (sprite, first, last) {
  const s = { ...sprite }
  if (first === s.first && last === s.last) return s
  s.first = first
  s.frame = first
  s.last = last || first
  return refresh(s)
}

function transform (sprite) {
  const x = sprite.position.x
  const y = sprite.position.y
  const w = sprite.dimension.x
  const h = sprite.dimension.y
  const ox = sprite.offset.x
  const oy = sprite.offset.y
  const sx = sprite.scale.x
  const sy = sprite.scale.y
  const sr = sprite.rotation
  const sc = sprite.center
  const tx = x + w / 2
  const ty = y + h / 2
  const cx = ((-1 / sx + 1) * w) / 2
  const cy = ((-1 / sy + 1) * h) / 2
  sprite.context.translate(tx + ox * sx, ty + oy * sy)
  sprite.context.scale(sx, sy)
  if (!sc) sprite.context.translate(cx, cy)
  sprite.context.rotate(sr)
  sprite.context.translate(-tx, -ty)
  return sprite
}

function display (sprite) {
  sprite.context.save()
  transform(sprite)
  draw(sprite)
  sprite.context.restore()
  // sprite.context.setTransform(1, 0, 0, 1, 0, 0)
  return sprite
}

function draw (sprite) {
  sprite.context.drawImage(
    sprite.image,
    sprite.shift.x,
    sprite.shift.y,
    sprite.dimension.x,
    sprite.dimension.y,
    sprite.position.x,
    sprite.position.y,
    sprite.dimension.x,
    sprite.dimension.y
  )
  return sprite
}
