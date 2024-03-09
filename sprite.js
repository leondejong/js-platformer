// Static and animated sprite logic

// Generate random string
function randomString(length = 12) {
  return length < 9
    ? Math.random().toString(36).substr(2, length)
    : randomString(8) + randomString(length - 8);
}

// Create default sprite object
function base() {
  return {
    identifier: randomString(8),
    element: "#canvas",
    source: "sprite.png",
    x: 0,
    y: 0,
    width: 0,
    heigth: 0,
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
    reverse: false,
  };
}

// Load image from source
async function load(source, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image(width, height);
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = source;
  });
}

// Update sprite based on current frame
function refresh(sprite) {
  const s = { ...sprite };
  s.row = Math.floor((s.frame - 1) / s.columns);
  s.column = Math.floor(s.frame - 1 - s.row * s.columns);
  s.shift.x = s.column * s.width;
  s.shift.y = s.row * s.height;
  return s;
}

// Update sprite based on current configuration
async function setup(sprite) {
  const s = { ...sprite };
  s.canvas = document.querySelector(s.element);
  s.context = s.canvas.getContext("2d");
  s.context.imageSmoothingEnabled = false;
  s.last = s.last === 0 ? s.frames : s.last;
  s.first = s.first === 0 ? 1 : s.first;
  s.frame = s.reverse ? s.last : s.first;
  s.image = await load(s.source);
  return refresh(s);
}

// Configure sprite from options object
async function configure(options = {}) {
  const sprite = { ...base(), ...options };
  return await setup(sprite);
}

// Navigate to next frame of sprite
function next(sprite) {
  let s = { ...sprite };
  if (++s.frame > s.last) s.frame = s.first;
  return refresh(s);
}

// Navigate to previous frame of sprite
function previous(sprite) {
  let s = { ...sprite };
  if (--s.frame < s.first) s.frame = s.last;
  return refresh(s);
}

// Navigate to consecutive frame of sprite based on direction (forward, backward)
function subsequent(sprite) {
  if (!sprite.run) return sprite;
  if (sprite.reverse) return previous(sprite);
  return next(sprite);
}

// Update range of consecutive frames of sprite (start, end)
function range(sprite, first, last) {
  const s = { ...sprite };
  if (first === s.first && last === s.last) return s;
  s.first = first;
  s.frame = first;
  s.last = last || first;
  return refresh(s);
}

// Transform sprite image (translate, scale, rotate)
function transform(sprite) {
  const x = sprite.x;
  const y = sprite.y;
  const w = sprite.width;
  const h = sprite.height;
  const ox = sprite.offset.x;
  const oy = sprite.offset.y;
  const sx = sprite.scale.x;
  const sy = sprite.scale.y;
  const sr = sprite.rotation;
  const sc = sprite.center;
  const tx = x + w / 2;
  const ty = y + h / 2;
  const cx = ((-1 / sx + 1) * w) / 2;
  const cy = ((-1 / sy + 1) * h) / 2;
  sprite.context.translate(tx + ox * sx, ty + oy * sy);
  sprite.context.scale(sx, sy);
  if (!sc) sprite.context.translate(cx, cy);
  sprite.context.rotate(sr);
  sprite.context.translate(-tx, -ty);
  return sprite;
}

// Draw sprite image on canvas
function draw(sprite) {
  sprite.context.drawImage(
    sprite.image,
    sprite.shift.x,
    sprite.shift.y,
    sprite.width,
    sprite.height,
    sprite.x,
    sprite.y,
    sprite.width,
    sprite.height
  );
  return sprite;
}

// Transform and draw sprite on canvas
function display(sprite) {
  sprite.context.save();
  transform(sprite);
  draw(sprite);
  sprite.context.restore();
  // sprite.context.setTransform(1, 0, 0, 1, 0, 0)
  return sprite;
}

export {
  base,
  load,
  configure,
  setup,
  refresh,
  next,
  previous,
  subsequent,
  range,
  transform,
  display,
  draw,
};

export default configure;
