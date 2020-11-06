<script lang="ts">
  import { playerForces } from "./playerForces";

  export let gameLoop;

  let time = 0;

  const playerForceMagnitude = 25;
  function onKeydown(event) {
    if (event.key === " ") {
      time += 1000 / 60;
      requestAnimationFrame(() => gameLoop(time));
      return;
    }
    if (event.repeat) return;
    let handled = false;
    switch (event.key) {
      case "ArrowUp":
        playerForces.up.set(0, 0, -playerForceMagnitude);
        handled = true;
        break;
      case "ArrowDown":
        playerForces.down.set(0, 0, playerForceMagnitude);
        handled = true;
        break;
      case "ArrowLeft":
        playerForces.left.set(-playerForceMagnitude, 0, 0);
        handled = true;
        break;
      case "ArrowRight":
        playerForces.right.set(playerForceMagnitude, 0, 0);
        handled = true;
        break;
    }
    if (handled) event.preventDefault();
  }

  function onKeyup(event) {
    switch (event.key) {
      case "ArrowUp":
        playerForces.up.z = 0;
        break;
      case "ArrowDown":
        playerForces.down.z = 0;
        break;
      case "ArrowLeft":
        playerForces.left.x = 0;
        break;
      case "ArrowRight":
        playerForces.right.x = 0;
        break;
    }
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />
