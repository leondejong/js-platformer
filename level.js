const sand = { single: 123, first: 142, middle: 143, last: 144 }

function getTree (x, y, sprite) {
  return [
    getGraphic(x + 2, y + 5, 1, 1, sprite, 138, false),
    getGraphic(x + 2, y + 4, 1, 1, sprite, 137, false),
    getGraphic(x + 2, y + 3, 1, 1, sprite, 139, false),
    getGraphic(x + 2, y + 2, 1, 1, sprite, 98, false),
    getGraphic(x + 1, y + 4, 1, 1, sprite, 100, false),
    getGraphic(x + 0, y + 4, 1, 1, sprite, 99, false),
    getGraphic(x + 3, y + 3, 1, 1, sprite, 140, false),
    getGraphic(x + 3, y + 3, 1, 1, sprite, 140, false),
    getGraphic(x + 1, y + 2, 1, 1, sprite, 58, false),
    getGraphic(x + 3, y + 2, 1, 1, sprite, 60, false),
    getGraphic(x + 2, y + 1, 1, 1, sprite, 39, false),
    getGraphic(x + 1, y + 1, 1, 1, sprite, 38, false),
    getGraphic(x + 3, y + 1, 1, 1, sprite, 40, false),
    getGraphic(x + 2, y + 0, 1, 1, sprite, 19, false),
    getGraphic(x + 1, y + 0, 1, 1, sprite, 18, false),
    getGraphic(x + 3, y + 0, 1, 1, sprite, 20, false)
  ]
}

function getLevel (sprite) {
  return [
    // bounds
    getRectangle(0, -36, width, 36),
    getRectangle(width, 0, 36, height),
    getRectangle(0, height, width, 36),
    getRectangle(-36, 0, 36, height),
    // floor
    getGraphic(0, 39, 56, 1, sprite, 3),
    // walls
    getGraphic(0, 31, 15, 1, sprite, 48),
    getGraphic(23, 31, 5, 1, sprite, 48),
    getGraphic(8, 23, 27, 1, sprite, 48),
    getGraphic(0, 15, 27, 1, sprite, 48),
    getGraphic(8, 7, 27, 1, sprite, 48),
    getGraphic(35, 7, 1, 17, sprite, 48),
    // plants
    getGraphic(9, 38, 1, 1, sprite, 129, false),
    getGraphic(24, 38, 1, 1, sprite, 125, false),
    getGraphic(26, 38, 1, 1, sprite, 126, false),
    getGraphic(44, 38, 1, 1, sprite, 128, false),
    getGraphic(46, 38, 1, 1, sprite, 127, false),
    // tree
    ...getTree(5, 33, sprite),
    // sand
    ...getHorizontalSection(6, 39, sprite, 5, sand),
    ...getHorizontalSection(23, 39, sprite, 5, sand),
    ...getHorizontalSection(43, 39, sprite, 5, sand),
    // platforms left
    ...getHorizontalSection(17, 35, sprite),
    ...getHorizontalSection(2, 27, sprite),
    ...getHorizontalSection(29, 19, sprite),
    ...getHorizontalSection(2, 11, sprite),
    // platforms right
    ...getHorizontalSection(48, 35, sprite),
    ...getHorizontalSection(40, 31, sprite),
    ...getHorizontalSection(48, 27, sprite),
    ...getHorizontalSection(40, 23, sprite),
    ...getHorizontalSection(48, 19, sprite),
    ...getHorizontalSection(40, 15, sprite),
    ...getHorizontalSection(48, 11, sprite),
    ...getHorizontalSection(40, 7, sprite),
    // stairs
    ...getDiagonalSection(28, 31, sprite)
  ]
}
