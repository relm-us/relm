<script lang="ts">
  import { keyUp, keyDown, keyLeft, keyRight } from "../store";

  function setKeyStore(key, value) {
    switch (key) {
      case "ArrowUp":
        keyUp.set(value);
        return true;
      case "ArrowDown":
        keyDown.set(value);
        return true;
      case "ArrowLeft":
        keyLeft.set(value);
        return true;
      case "ArrowRight":
        keyRight.set(value);
        return true;
    }
    return false;
  }

  function onKeydown(event) {
    if (event.repeat) return;
    if (setKeyStore(event.key, true)) {
      event.preventDefault();
    }
  }

  function onKeyup(event) {
    setKeyStore(event.key, false);
  }

  /*

export let gameLoop;
if (event.key === " ") {
  time += 1000 / 60;
  requestAnimationFrame(() => gameLoop(time));
  return;
}
  */
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />
