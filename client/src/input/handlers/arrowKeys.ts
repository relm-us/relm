import { keyUp, keyDown, keyLeft, keyRight, keyQ, keyE } from "~/stores/keys";

function setKeyStore(key, value) {
  const keyLower = key.toLowerCase();

  if (key == "ArrowUp" || keyLower == "w" || keyLower == "k") {
    keyUp.set(value);
  } else if (key == "ArrowDown" || keyLower == "s" || keyLower == "j") {
    keyDown.set(value);
  } else if (key == "ArrowLeft" || keyLower == "a" || keyLower == "h") {
    keyLeft.set(value);
  } else if (key == "ArrowRight" || keyLower == "d" || keyLower == "l") {
    keyRight.set(value);
  } else if (keyLower == "q") {
    keyQ.set(value);
  } else if (keyLower == "e") {
    keyE.set(value);
  } else {
    return false;
  }
  return true;
}

export function onKeydown(event) {
  if (event.repeat) return;
  if (event.ctrlKey || event.metaKey) return;

  if (setKeyStore(event.key, true)) {
    event.preventDefault();
  }
}

export function onKeyup(event) {
  setKeyStore(event.key, false);
}
