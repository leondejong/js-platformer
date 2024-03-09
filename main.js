import { keys, initialize, loop } from "./logic.js";
import { getTile, getCharacter } from "./graphics.js";
import { getBase, getScene, getPlayer } from "./scene.js";

async function setup(base = false) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  const subject = await getCharacter(); // Player sprite
  let object = getPlayer(); // Player properties

  let environment;

  if (base) {
    environment = getBase(); // Environment base
  } else {
    const tile = await getTile(); // Environment sprite
    environment = getScene(tile); // Environment configuration
  }

  return { context, environment, object, subject };
}

function main({ context, environment, object, subject }) {
  ({ environment, object } = initialize(environment, object));

  document.onkeydown = function (e) {
    keys[e.which] = true;
  };

  document.onkeyup = function (e) {
    keys[e.which] = false;
  };

  window.onload = () =>
    requestAnimationFrame(
      loop.bind(loop, context, environment, object, subject)
    );
}

main(await setup());
