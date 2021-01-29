<script lang="ts">
  import { keyUp, keyDown, keyLeft, keyRight, keyQ, keyE } from "../store";
  import { isInputEvent } from "~/input/isInputEvent";

  const KEY_Q = 81;
  const KEY_E = 69;

  const KEY_W = 87;
  const KEY_A = 65;
  const KEY_S = 83;
  const KEY_D = 68;

  function setKeyStore(key, keyCode, value) {
    if (key === "ArrowUp" || keyCode === KEY_W) {
      keyUp.set(value);
    } else if (key === "ArrowDown" || keyCode === KEY_S) {
      keyDown.set(value);
    } else if (key === "ArrowLeft" || keyCode === KEY_A) {
      keyLeft.set(value);
    } else if (key === "ArrowRight" || keyCode === KEY_D) {
      keyRight.set(value);
    } else if (keyCode === KEY_Q) {
      keyQ.set(value);
    } else if (keyCode === KEY_E) {
      keyE.set(value);
    } else {
      return false;
    }
    return true;
  }

  function onKeydown(event) {
    if (isInputEvent(event)) return;
    if (event.repeat) return;
    if (setKeyStore(event.key, event.keyCode, true)) {
      event.preventDefault();
    }
  }

  function onKeyup(event) {
    setKeyStore(event.key, event.keyCode, false);
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />
