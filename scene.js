import {
  types,
  colors,
  getRectangle,
  getGraphic,
  getDiagonalSection,
  getHorizontalSection,
} from "./graphics.js";

const sand = { single: 123, first: 142, middle: 143, last: 144 };

// Get environment with basic rectangles
function getBasic(width, height, unit = 64) {
  return [
    // bounds
    getRectangle(-unit, -unit, width + unit * 2, unit),
    getRectangle(width, -unit, unit, height + unit * 2),
    getRectangle(-unit, height, width + unit * 2, unit),
    getRectangle(-unit, -unit, unit, height + unit * 2),
    // borders
    getRectangle(0, 0, 768, 16),
    getRectangle(0, 560, 768, 16),
    getRectangle(0, 0, 16, 576),
    getRectangle(752, 0, 16, 576),
    // floors
    getRectangle(336, 144, 16, 288),
    getRectangle(352, 144, 336, 16),
    getRectangle(418, 236, 336, 16),
    getRectangle(352, 326, 336, 16),
    getRectangle(464, 416, 112, 16),
    getRectangle(640, 416, 112, 16),
    getRectangle(576, 486, 64, 16),
    // platforms
    getRectangle(80, 486, 64, 16),
    getRectangle(208, 416, 64, 16),
    getRectangle(80, 348, 64, 16),
    getRectangle(208, 280, 64, 16),
    getRectangle(80, 212, 64, 16),
    getRectangle(208, 144, 64, 16),
    // stairs
    getRectangle(448, 432, 16, 16),
    getRectangle(432, 448, 16, 16),
    getRectangle(416, 464, 16, 16),
    getRectangle(400, 480, 16, 16),
    getRectangle(384, 496, 16, 16),
    getRectangle(368, 512, 16, 16),
    getRectangle(352, 528, 16, 16),
    getRectangle(336, 544, 16, 16),
    // walls
    getRectangle(420, 80, 16, 64),
    getRectangle(588, 80, 16, 64),
    getRectangle(504, 16, 16, 64),
  ];
}

// Generate tree composition
function getTree(sprite, x, y) {
  return [
    getGraphic(sprite, x + 2, y + 5, 1, 1, 138, false),
    getGraphic(sprite, x + 2, y + 4, 1, 1, 137, false),
    getGraphic(sprite, x + 2, y + 3, 1, 1, 139, false),
    getGraphic(sprite, x + 2, y + 2, 1, 1, 98, false),
    getGraphic(sprite, x + 1, y + 4, 1, 1, 100, false),
    getGraphic(sprite, x + 0, y + 4, 1, 1, 99, false),
    getGraphic(sprite, x + 3, y + 3, 1, 1, 140, false),
    getGraphic(sprite, x + 3, y + 3, 1, 1, 140, false),
    getGraphic(sprite, x + 1, y + 2, 1, 1, 58, false),
    getGraphic(sprite, x + 3, y + 2, 1, 1, 60, false),
    getGraphic(sprite, x + 2, y + 1, 1, 1, 39, false),
    getGraphic(sprite, x + 1, y + 1, 1, 1, 38, false),
    getGraphic(sprite, x + 3, y + 1, 1, 1, 40, false),
    getGraphic(sprite, x + 2, y + 0, 1, 1, 19, false),
    getGraphic(sprite, x + 1, y + 0, 1, 1, 18, false),
    getGraphic(sprite, x + 3, y + 0, 1, 1, 20, false),
  ];
}

// Generate environment
function getLevel(sprite, width, height, unit = 64) {
  return [
    // bounds
    getRectangle(-unit, -unit, width + unit * 2, unit),
    getRectangle(width, -unit, unit, height + unit * 2),
    getRectangle(-unit, height, width + unit * 2, unit),
    getRectangle(-unit, -unit, unit, height + unit * 2),
    // floor
    getGraphic(sprite, 0, 39, 56, 1, 3),
    // walls
    getGraphic(sprite, 0, 31, 15, 1, 48),
    getGraphic(sprite, 23, 31, 5, 1, 48),
    getGraphic(sprite, 8, 23, 27, 1, 48),
    getGraphic(sprite, 0, 15, 27, 1, 48),
    getGraphic(sprite, 8, 7, 27, 1, 48),
    getGraphic(sprite, 35, 7, 1, 17, 48),
    // plants
    getGraphic(sprite, 9, 38, 1, 1, 129, false),
    getGraphic(sprite, 24, 38, 1, 1, 125, false),
    getGraphic(sprite, 26, 38, 1, 1, 126, false),
    getGraphic(sprite, 44, 38, 1, 1, 128, false),
    getGraphic(sprite, 46, 38, 1, 1, 127, false),
    // tree
    ...getTree(sprite, 5, 33),
    // sand
    ...getHorizontalSection(sprite, 6, 39, 5, sand),
    ...getHorizontalSection(sprite, 23, 39, 5, sand),
    ...getHorizontalSection(sprite, 43, 39, 5, sand),
    // platforms left
    ...getHorizontalSection(sprite, 17, 35),
    ...getHorizontalSection(sprite, 2, 27),
    ...getHorizontalSection(sprite, 29, 19),
    ...getHorizontalSection(sprite, 2, 11),
    // platforms right
    ...getHorizontalSection(sprite, 48, 35),
    ...getHorizontalSection(sprite, 40, 31),
    ...getHorizontalSection(sprite, 48, 27),
    ...getHorizontalSection(sprite, 40, 23),
    ...getHorizontalSection(sprite, 48, 19),
    ...getHorizontalSection(sprite, 40, 15),
    ...getHorizontalSection(sprite, 48, 11),
    ...getHorizontalSection(sprite, 40, 7),
    // stairs
    ...getDiagonalSection(sprite, 28, 31),
  ];
}

// Get basic environment configuration
function getBase() {
  const width = 768;
  const height = 576;
  return {
    x: 0,
    y: 0,
    width,
    height,
    gravity: 40,
    friction: 0,
    resistance: 0.05,
    dissipationX: 0.075,
    dissipationY: 0,
    data: getBasic(width, height),
  };
}

// Get graphical environment configuration
function getScene(sprite) {
  const width = 1008;
  const height = 720;
  return {
    x: 0,
    y: 0,
    width,
    height,
    gravity: 40,
    friction: 0,
    resistance: 0.05,
    dissipationX: 0.075,
    dissipationY: 0,
    data: getLevel(sprite, width, height),
  };
}

// Get player configuration object
function getPlayer() {
  return {
    up: 69, // e
    left: 83, // s
    down: 68, // d
    right: 70, // f
    x: 64,
    y: 32,
    width: 16,
    height: 32,
    density: 0.25,
    mass: 64,
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    previous: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    impulse: { x: 32, y: 0, jump: 15 },
    type: types.rectangle,
    color: colors.player,
  };
}

export { getBase, getScene, getPlayer };
export default getScene;
