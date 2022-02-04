import { get } from "svelte/store";
import { forceIsInputMode } from "~/stores/forceIsInputMode";

export function isInputEvent(event) {
  // e.g. Upload dialog needs to be able to accept paste events
  if (get(forceIsInputMode)) return true;

  if (!event.target || !event.target.getAttribute) return false;
  else
    return (
      // Regular text inputs and textareas should be able to use copy paste, arrow keys
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA" ||
      event.target.tagName === "IFRAME" ||
      // We can make divs editable, and they should be able to copy/paste, etc.
      event.target.getAttribute("contenteditable") !== null ||
      // We can make divs receive focus, and they, too, should be able to copy/paste etc.
      event.target.getAttribute("tabindex") !== null
    );
}
