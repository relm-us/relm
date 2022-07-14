import { globalEvents } from "~/events";
import { key1, key2, key3 } from "~/stores/keys";

function setKeyStore(key, value) {
  if (key == "1") {
    key1.set(value);
  } else if (key == "2") {
    key2.set(value);
  } else if (key == "3") {
    key3.set(value);
  } else {
    return false;
  }
  return true;
}

export function onKeydown(event) {
  if (event.repeat) return;
  if (event.ctrlKey || event.metaKey) return;

  if (event.key === "1") {
    globalEvents.emit("advanced-edit");
  }

  if (event.key === "2") {
    globalEvents.emit("sit");
  }

  if (setKeyStore(event.key, true)) {
    event.preventDefault();
  }
}

export function onKeyup(event) {
  setKeyStore(event.key, false);
}
