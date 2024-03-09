// Graphics configuration and rendering

import { configure, range, display } from "./sprite.js";

// Graphic types
const types = {
  rectangle: "rectangle",
  graphic: "graphic",
};

// Default colors
const colors = {
  backgroundBottom: "rgba(223, 239, 255, 1)",
  backgroundTop: "rgba(127, 159, 255, 1)",
  background: "rgba(223, 239, 247, 1)",
  content: "rgba(0, 31, 63, 1)",
  player: "rgba(255, 63, 0, 1)",
  text: "rgba(0, 47, 63, 1)",
};

// Get environment sprite
async function getTile() {
  return await configure({
    element: "#canvas",
    source: "./tiles.png",
    x: 0,
    y: 0,
    width: 18,
    height: 18,
    frames: 180,
    rows: 9,
    columns: 20,
    first: 1,
    last: 1,
  });
}

// Get character sprite
async function getCharacter() {
  return await configure({
    element: "#canvas",
    source: "./character.png",
    offset: { x: -4, y: 0 },
    scale: { x: 1, y: 1 },
    x: 64,
    y: 32,
    width: 24,
    height: 32,
    frames: 32,
    rows: 4,
    columns: 8,
    first: 1,
    last: 1,
    run: true,
  });
}

// Get rectangle
function getRectangle(x, y, width, height, color = colors.content) {
  return {
    x,
    y,
    width,
    height,
    color,
    type: types.rectangle,
  };
}

// Get configured graphic object
function getGraphic(sprite, nx, ny, nw, nh, tile, solid = true) {
  const width = sprite.width * sprite.scale.x;
  const height = sprite.height * sprite.scale.y;
  const rectangle = getRectangle(
    width * nx,
    height * ny,
    width * nw,
    height * nh
  );
  return {
    ...range(sprite, tile),
    solid,
    rectangle,
    type: types.graphic,
    data: { nx, ny, nw, nh, tile, width, height },
  };
}

// Calculate sprite frame coordinates
function getCoordinates(graphic, w, h) {
  const { nx, ny, width, height } = graphic.data;
  return {
    x: (nx + w) * width + graphic.x,
    y: (ny + h) * height + graphic.y,
  };
}

// Draw environment background
function drawBackground(context, scene) {
  const { y, height } = scene;
  const gradient = context.createLinearGradient(0, -y, 0, height - y);
  gradient.addColorStop(0, colors.backgroundTop);
  gradient.addColorStop(1, colors.backgroundBottom);
  context.fillStyle = gradient || colors.background;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

// Draw rectangle
function drawRectangle(context, rectangle) {
  context.fillStyle = rectangle.color || colors.contentColor;
  context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
}

// Draw graphic tiles
function drawGraphic(graphic) {
  const { nw, nh, tile } = graphic.data;
  for (let w = 0; w < nw; w++) {
    for (let h = 0; h < nh; h++) {
      display({
        ...range(graphic, tile),
        ...getCoordinates(graphic, w, h),
      });
    }
  }
}

// Get generated graphic with diagonal laid out frames
function getDiagonalSection(sprite, nx, ny, length = 8, tile = 48) {
  return Array(length)
    .fill()
    .map((_, index) => getGraphic(sprite, index + nx, index + ny, 1, 1, tile));
}

// Get generated graphic with horizontal laid out frames
function getHorizontalSection(sprite, nx, ny, length = 4, tiles) {
  const { single, first, middle, last } = tiles || {
    single: 48,
    first: 49,
    middle: 50,
    last: 51,
  };
  if (length < 1) {
    return [];
  }
  if (length === 1) {
    return [getGraphic(sprite, nx, ny, 1, 1, single)];
  }
  if (length === 2) {
    return [
      getGraphic(sprite, nx, ny, 1, 1, first),
      getGraphic(sprite, nx + 1, ny, 1, 1, last),
    ];
  }
  return [
    getGraphic(sprite, nx, ny, 1, 1, first),
    getGraphic(sprite, nx + 1, ny, length - 1, 1, middle),
    getGraphic(sprite, nx + length - 1, ny, 1, 1, last),
  ];
}

// Get generated graphic with vertical laid out frames
function getVerticalSection(sprite, nx, ny, length = 4, tiles) {
  const graphic = { ...sprite, rotation: Math.PI / 2 };
  const { single, first, middle, last } = tiles || {
    single: 48,
    first: 49,
    middle: 50,
    last: 51,
  };
  if (length < 1) {
    return [];
  }
  if (length === 1) {
    return [getGraphic(graphic, nx, ny, 1, 1, single)];
  }
  if (length === 2) {
    return [
      getGraphic(graphic, nx, ny, 1, 1, first),
      getGraphic(graphic, nx, ny + 1, 1, 1, last),
    ];
  }
  return [
    getGraphic(graphic, nx, ny, 1, 1, first),
    getGraphic(graphic, nx, ny + 1, 1, length - 1, middle),
    getGraphic(graphic, nx, ny + length - 1, 1, 1, last),
  ];
}

export {
  types,
  colors,
  getTile,
  getCharacter,
  getRectangle,
  getGraphic,
  drawBackground,
  drawRectangle,
  drawGraphic,
  getDiagonalSection,
  getHorizontalSection,
  getVerticalSection,
};
