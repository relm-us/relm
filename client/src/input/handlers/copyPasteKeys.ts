import { globalEvents } from "~/events";

export function onKeydown(event) {
  const isTextHighlighted = window.getSelection().type == "Range";

  const key = event.key.toLowerCase();

  if (key === "c" && (event.ctrlKey || event.metaKey)) {
    if (isTextHighlighted) return;
    event.preventDefault();

    // "copy" event includes key repetition events
    globalEvents.emit("copy");
  } else if (key === "v" && (event.ctrlKey || event.metaKey)) {
    if (isTextHighlighted) return;
    event.preventDefault();

    // "paste" event includes key repetition events
    globalEvents.emit("paste");
  }
}

export function onKeyup(event) {}
