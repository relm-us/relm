import { get } from "svelte/store";
import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";

function showIsInput(msg, target) {
  (window as any).debugTarget = target;
  console.log(`isInputEvent true (${msg})`, target);
}

export function isInputEvent(event, debug = false) {
  // e.g. Upload dialog needs to be able to accept paste events
  if (get(uploadingDialogOpen)) {
    if (debug) console.log("isInputEvent true (uploading)");
    return true;
  }

  if (!event.target || !event.target.getAttribute) {
    if (debug)
      console.log("isInputEvent false (event has no target)", event.target);
    return false;
  } else {
    let value = false;
    // Regular text inputs and textareas should be able to use copy paste, arrow keys
    // (INPUT, TEXTAREA, IFRAME)
    if (event.target.tagName === "INPUT") {
      if (debug) showIsInput("INPUT", event.target);
      value = true;
    }
    if (event.target.tagName === "TEXTAREA") {
      if (debug) showIsInput("TEXTAREA", event.target);
      value = true;
    }
    if (event.target.tagName === "IFRAME") {
      if (debug) showIsInput("IFRAME", event.target);
      value = true;
    }

    // We can make divs editable, and they should be able to copy/paste, etc.
    if (event.target.getAttribute("contenteditable") == "true") {
      if (debug) showIsInput("ContentEditable", event.target);
      value = true;
    }

    // We can make divs receive focus, and they, too, should be able to copy/paste etc.
    if (event.target.getAttribute("tabindex") !== null) {
      if (debug) showIsInput("TabIndex", event.target);
      value = true;
    }

    if (debug && !value) console.log("isInputEvent false");

    return value;
  }
}
