// Game loop, update and rendering logic
// Environment: game scene properties object
// Object: computed player properties object
// Subject: rendered player character object

import { range, subsequent, display } from "./sprite.js";
import {
  types,
  colors,
  getTile,
  getCharacter,
  getRectangle,
  drawBackground,
  drawRectangle,
  drawGraphic,
} from "./graphics.js";
import { getBase, getScene, getPlayer } from "./scene.js";

const fps = 60; // 60 = requestAnimationFrame
const keys = {}; // Keyboard keys pressed

// Game loop configuration
const gl = {
  step: 1 / fps,
  ratio: 60 / fps,
  accumulator: 0,
  frames: 0,
  time: 0,
  max: 0.25,
};

// Sprite loop configuration
const sl = {
  step: 1000 / 60,
  accumulator: 0,
  time: 0,
};

// Check if rectangles A and B intersect
function intersect(a, b) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

// Update object position in environment
function translate(environment, object) {
  const data = [...environment.data];
  const ob = object;

  let overlapX = 0;
  let overlapY = 0;
  let deltaX = ob.velocity.x;
  let deltaY = ob.velocity.y;

  const horizontal = getRectangle(ob.x + deltaX, ob.y, ob.width, ob.height);

  const vertical = getRectangle(ob.x, ob.y + deltaY, ob.width, ob.height);

  data.forEach((entry) => {
    const shape = entry.solid ? entry.rectangle : entry;

    if (intersect(shape, horizontal)) {
      if (deltaX < 0) {
        deltaX = shape.x + shape.width - ob.x;
      } else if (deltaX > 0) {
        deltaX = shape.x - ob.x - ob.width;
      }

      overlapX = ob.velocity.x - deltaX;
    }

    if (intersect(shape, vertical)) {
      if (deltaY < 0) {
        deltaY = shape.y + shape.height - ob.y;
      } else if (deltaY > 0) {
        deltaY = shape.y - ob.y - ob.height;
      }
    }

    overlapY = ob.velocity.y - deltaY;
  });

  return { deltaX, deltaY, overlapX, overlapY };
}

// Let player jump
function jump(object, keys, contact) {
  const ob = { ...object };

  ob.jump = false;

  if (keys[ob.up] && !ob.locked && contact > 0) {
    ob.locked = true;
    ob.jump = true;
  }

  if (!keys[ob.up] && ob.locked && contact > 0) {
    ob.locked = false;
  }

  if (ob.jump) {
    ob.velocity.y -= ob.impulse.jump * gl.ratio;
  }

  return ob;
}

// Update character sprite animation based on action
function updateRange(object, subject, deltaX, deltaY) {
  const slackX = 0.05;
  const slackY = 0.1;
  const air = Math.abs(deltaY) > slackY;

  let sub = { ...subject };

  if (air) {
    sub = range(sub, 9);
  } else if (deltaX > slackX && keys[object.right] && !air) {
    sub = range(sub, 25, 32);
  } else if (deltaX < -slackX && keys[object.left] && !air) {
    sub = range(sub, 17, 24);
  } else if (deltaX > slackX) {
    sub = range(sub, 25);
  } else if (deltaX < -slackX) {
    sub = range(sub, 17);
  } else {
    sub = range(sub, 1);
  }

  return sub;
}

// Update character sprite position and appearance
function updateSprite(object, subject, time, deltaX, deltaY) {
  const delta = time - sl.time;

  let sub = { ...subject };

  sl.accumulator += delta;
  sl.time = time;

  sub.x = object.x;
  sub.y = object.y;

  sub = updateRange(object, sub, deltaX, deltaY);

  if (sl.accumulator >= sl.step) {
    sl.accumulator = 0;
    sub = subsequent(sub);
  }

  return sub;
}

// Constrain environment to edges of canvas
function constrain(context, environment) {
  const env = { ...environment };

  if (env.x < 0) {
    env.x = 0;
  }

  if (env.x > env.width - context.canvas.width) {
    env.x = env.width - context.canvas.width;
  }

  if (env.y < 0) {
    env.y = 0;
  }

  if (env.y > env.height - context.canvas.height) {
    env.y = env.height - context.canvas.height;
  }

  return env;
}

// Check if object position exceeds canvas limits
function clipped(context, object) {
  if (object.x > context.canvas.width || object.x + object.width < 0) {
    return true;
  }

  if (object.y > context.canvas.height || object.y + object.height < 0) {
    return true;
  }

  return false;
}

// Shift object position based on environmental orientation
function shift(context, environment, object, x = object.x, y = object.y) {
  return {
    ...object,
    x: x - environment.x,
    y: y - environment.y,
  };
}

// Update physics and properties of environment, object and subject
function update(context, environment, object, subject, time) {
  const env = { ...environment };
  let ob = { ...object };
  let sub = { ...subject };

  ob.direction.x = !!keys[ob.right] - !!keys[ob.left];
  ob.direction.y = !!keys[ob.down] - !!keys[ob.up];

  const accelerationX = ob.force.x / ob.mass;
  const accelerationY = ob.force.y / ob.mass;

  const inputX = ob.impulse.x * ob.direction.x;
  const inputY = ob.impulse.y * ob.direction.y;

  ob.acceleration.x = (accelerationX + inputX) * gl.step;
  ob.acceleration.y = (accelerationY + inputY + env.gravity) * gl.step;

  ob.velocity.x += ob.acceleration.x * gl.ratio;
  ob.velocity.y += ob.acceleration.y * gl.ratio;

  const { deltaX, deltaY, overlapX, overlapY } = translate(env, ob);

  ob.velocity.x = Math.abs(overlapX) < 1 ? deltaX : 0;
  ob.velocity.y = Math.abs(overlapY) < 1 ? deltaY : 0;

  ob.velocity.x *= env.dissipationX;
  ob.velocity.y *= env.dissipationY;

  if (overlapX !== 0) {
    ob.velocity.y *= env.friction;
  } else if (overlapY !== 0) {
    ob.velocity.x *= env.friction;
  } else {
    ob.velocity.x *= env.resistance;
    ob.velocity.y *= env.resistance;
  }

  ob.x += deltaX;
  ob.y += deltaY;

  env.x = ob.x + ob.width / 2 - canvas.width / 2;
  env.y = ob.y + ob.height / 2 - canvas.height / 2;

  ob = jump(ob, keys, overlapY);

  sub = updateSprite(ob, sub, time, deltaX, deltaY);

  const { x, y } = constrain(context, env);

  env.x = x;
  env.y = y;

  return { environment: env, object: ob, subject: sub };
}

// Render environment and subject
function render(context, environment, object, subject, x, y) {
  // const ob = shift(context, environment, object, x, y);
  const sub = shift(context, environment, subject, x, y);

  drawBackground(context, environment);
  // drawRectangle(context, ob);
  display(sub);

  for (const asset of environment.data) {
    const tile = shift(context, environment, asset);
    if (asset.type === types.rectangle) {
      if (clipped(context, tile)) continue;
      drawRectangle(context, tile);
    } else if (asset.type === types.graphic) {
      const rectangle = shift(context, environment, asset.rectangle);
      if (clipped(context, rectangle)) continue;
      drawGraphic(tile);
    } else {
      const rectangle = shift(context, environment, asset.rectangle);
      if (clipped(context, rectangle)) continue;
      drawRectangle(context, rectangle);
    }
  }

  context.font = "16px sans-serif";
  context.fillStyle = colors.text;
  context.fillText(
    Math.floor(gl.frames) + " fps",
    context.canvas.width - 50,
    20
  );
}

// Interpolate object position
function interpolate(object, alpha) {
  const x = object.previous.x * alpha + object.x * (1 - alpha);
  const y = object.previous.y * alpha + object.y * (1 - alpha);

  object.previous.x = object.x;
  object.previous.y = object.y;

  return { x, y };
}

// Main game loop
function loop(context, environment, object, subject, time) {
  if (fps === 60) {
    requestAnimationFrame((time) =>
      loop(context, environment, object, subject, time)
    );
  } else {
    setTimeout(() => {
      loop(context, environment, object, subject, performance.now());
    }, gl.step * 1000);
  }

  let delta = (time - gl.time) / 1000;
  if (delta > gl.max) delta = gl.max;
  gl.accumulator += delta;
  gl.frames = 1 / delta;
  gl.time = time;

  // Timestepping
  while (gl.accumulator > gl.step) {
    gl.accumulator -= gl.step;
    // Linear integration
    ({ environment, object, subject } = update(
      context,
      environment,
      object,
      subject,
      time
    ));
  }

  // Linear interpolation
  const alpha = gl.accumulator / gl.step;
  const { x, y } = interpolate(object, alpha);

  render(context, environment, object, subject, x, y);
}

// Initialize environment and object
function initialize(environment, object) {
  const env = { ...environment };
  const ob = { ...object };

  ob.mass = ob.width * ob.height * ob.density;

  env.friction = Math.pow(1 - env.friction, gl.ratio);
  env.resistance = Math.pow(1 - env.resistance, gl.ratio);
  env.dissipationX = Math.pow(1 - env.dissipationX, gl.ratio);
  env.dissipationY = Math.pow(1 - env.dissipationY, gl.ratio);

  return { environment: env, object: ob };
}

export {
  keys,
  intersect,
  translate,
  jump,
  updateRange,
  updateSprite,
  update,
  render,
  interpolate,
  loop,
  constrain,
  initialize,
};
