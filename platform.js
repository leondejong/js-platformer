// Formatted by StandardJS

;(async function () {
  const fps = 60 // 60 = requestAnimationFrame
  const keys = {}

  // game loop
  const gl = {
    step: 1 / fps,
    ratio: 60 / fps,
    accumulator: 0,
    frames: 0,
    time: 0,
    max: 0.2
  }

  // sprite loop
  const sl = {
    step: 1000 / 60,
    accumulator: 0,
    time: 0
  }

  const player = getPlayer()
  const tile = await getTile()
  const scene = getScene(tile)
  let character = await getCharacter()

  function isObject (value) {
    return typeof value === 'object'
  }

  function intersect (a, b) {
    return (
      a.position.x < b.position.x + b.dimension.x &&
      b.position.x < a.position.x + a.dimension.x &&
      a.position.y < b.position.y + b.dimension.y &&
      b.position.y < a.position.y + a.dimension.y
    )
  }

  function translate (subject, environment) {
    let overlapX = 0
    let overlapY = 0
    let deltaX = subject.velocity.x
    let deltaY = subject.velocity.y

    const horizontal = getRectangle(
      subject.position.x + deltaX,
      subject.position.y,
      subject.dimension.x,
      subject.dimension.y
    )

    const vertical = getRectangle(
      subject.position.x,
      subject.position.y + deltaY,
      subject.dimension.x,
      subject.dimension.y
    )

    environment.forEach(entry => {
      const object = isObject(entry.rectangle) ? entry.rectangle : entry

      if (intersect(object, horizontal)) {
        if (deltaX < 0) {
          deltaX = object.position.x + object.dimension.x - subject.position.x
        } else if (deltaX > 0) {
          deltaX = object.position.x - subject.position.x - subject.dimension.x
        }

        overlapX = subject.velocity.x - deltaX
      }

      if (intersect(object, vertical)) {
        if (deltaY < 0) {
          deltaY = object.position.y + object.dimension.y - subject.position.y
        } else if (deltaY > 0) {
          deltaY = object.position.y - subject.position.y - subject.dimension.y
        }
      }

      overlapY = subject.velocity.y - deltaY
    })

    return { deltaX, deltaY, overlapX, overlapY }
  }

  function jump (contact) {
    player.jump = false

    if (keys[player.up] && !player.locked && contact > 0) {
      player.locked = true
      player.jump = true
    }

    if (!keys[player.up] && player.locked && contact > 0) {
      player.locked = false
    }

    if (player.jump) {
      player.velocity.y -= player.impulse.jump * gl.ratio
    }
  }

  function updateRange (deltaX, deltaY) {
    const slackX = 0.05
    const slackY = 0.1
    const air = Math.abs(deltaY) > slackY

    if (air) {
      character = range(character, 9)
    } else if (deltaX > slackX && keys[player.right] && !air) {
      character = range(character, 25, 32)
    } else if (deltaX < -slackX && keys[player.left] && !air) {
      character = range(character, 17, 24)
    } else if (deltaX > slackX) {
      character = range(character, 25)
    } else if (deltaX < -slackX) {
      character = range(character, 17)
    } else {
      character = range(character, 1)
    }
  }

  function updateSprite (time, deltaX, deltaY) {
    const delta = time - sl.time
    sl.accumulator += delta
    sl.time = time

    character.position.x = player.position.x
    character.position.y = player.position.y

    updateRange(deltaX, deltaY)

    if (sl.accumulator >= sl.step) {
      sl.accumulator = 0
      character = subsequent(character)
    }
  }

  function update (time) {
    player.direction.x = !!keys[player.right] - !!keys[player.left]
    player.direction.y = !!keys[player.down] - !!keys[player.up]

    const accelerationX = player.force.x / player.mass
    const accelerationY = player.force.y / player.mass

    const inputX = player.impulse.x * player.direction.x
    const inputY = player.impulse.y * player.direction.y

    player.acceleration.x = (accelerationX + inputX) * gl.step
    player.acceleration.y = (accelerationY + inputY + scene.gravity) * gl.step

    player.velocity.x += player.acceleration.x * gl.ratio
    player.velocity.y += player.acceleration.y * gl.ratio

    const { deltaX, deltaY, overlapX, overlapY } = translate(player, scene.data)

    player.velocity.x = Math.abs(overlapX) < 1 ? deltaX : 0
    player.velocity.y = Math.abs(overlapY) < 1 ? deltaY : 0

    player.velocity.x *= player.resistance
    player.velocity.y *= player.resistance

    if (overlapX !== 0) {
      player.velocity.y *= scene.resistance
    } else if (overlapY !== 0) {
      player.velocity.x *= scene.resistance
    } else {
      player.velocity.x *= scene.airResistance
      player.velocity.y *= scene.airResistance
    }

    player.position.x += deltaX
    player.position.y += deltaY

    jump(overlapY)

    updateSprite(time, deltaX, deltaY)
  }

  function render ({ x, y }) {
    character = {
      ...character,
      position: { x, y }
    }

    drawBackground()
    // drawRectangle(player)
    display(character)

    scene.data.forEach(tile => {
      if (tile.type === rectangle) {
        drawRectangle(tile)
      } else if (tile.type === graphic) {
        drawGraphic(tile)
      }
    })

    context.font = '16px sans-serif'
    context.fillStyle = textColor
    context.fillText(Math.floor(gl.frames) + ' fps', scene.width - 90, 50)
  }

  function interpolate (alpha) {
    const x = player.previous.x * alpha + player.position.x * (1 - alpha)
    const y = player.previous.y * alpha + player.position.y * (1 - alpha)

    player.previous.x = player.position.x
    player.previous.y = player.position.y

    return { x, y }
  }

  function loop (time) {
    if (fps === 60) {
      requestAnimationFrame(loop)
    } else {
      setTimeout(() => {
        loop(performance.now())
      }, gl.step * 1000)
    }

    let delta = (time - gl.time) / 1000
    gl.accumulator += delta
    gl.frames = 1 / delta
    gl.time = time

    if (delta > gl.max) delta = gl.max // timestepping
    while (gl.accumulator > gl.step) {
      gl.accumulator -= gl.step
      update(time) // linear integration
    }

    const alpha = gl.accumulator / gl.step // linear interpolation
    render(interpolate(alpha))
  }

  function initialize () {
    player.mass = player.dimension.x * player.dimension.y * player.density

    player.friction = Math.pow(1 - player.friction, gl.ratio)
    scene.friction = Math.pow(1 - scene.friction, gl.ratio)

    player.resistance = Math.pow(1 - player.resistance, gl.ratio)
    scene.resistance = scene.friction * player.friction

    scene.airResistance = Math.pow(1 - scene.airResistance, gl.ratio)
  }

  function main () {
    initialize()

    document.onkeydown = function (e) {
      keys[e.which] = true
    }

    document.onkeyup = function (e) {
      keys[e.which] = false
    }

    window.onload = () => requestAnimationFrame(loop)
  }

  main()
})()
