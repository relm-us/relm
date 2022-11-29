import { get } from "svelte/store";
import { uploadingDialogOpen } from "~/stores/uploadingDialogOpen";
import { hasPointerInteractAncestor } from "~/utils/hasAncestor";

function showIsInput(msg, target) {
  (window as any).debugTarget = target;
  console.log(`isInputEvent true (${msg})`, target);
}

export function isInputElement(el, debug = false) {
  if (!el || !el.getAttribute) {
    if (debug) console.log("isInputEvent false (event has no target)", el);
    return false;
  } else {
    let value = false;
    // Regular text inputs and textareas should be able to use copy paste, arrow keys
    // (INPUT, TEXTAREA, IFRAME)
    if (el.tagName === "INPUT") {
      if (debug) showIsInput("INPUT", el);
      value = true;
    }
    if (el.tagName === "BUTTON") {
      if (debug) showIsInput("BUTTON", el);
      value = true;
    }
    if (el.tagName === "TEXTAREA") {
      if (debug) showIsInput("TEXTAREA", el);
      value = true;
    }
    if (el.tagName === "IFRAME") {
      if (debug) showIsInput("IFRAME", el);
      value = true;
    }

    // We can make divs editable, and they should be able to copy/paste, etc.
    if (el.getAttribute("contenteditable") == "true") {
      if (debug) showIsInput("ContentEditable", el);
      value = true;
    }

    // We can make divs receive focus, and they, too, should be able to copy/paste etc.
    if (el.getAttribute("tabindex") !== null) {
      if (debug) showIsInput("TabIndex", el);
      value = true;
    }

    if (hasPointerInteractAncestor(el)) {
      if (debug) showIsInput("data-pointer-interact", el);
      value = true;
    }

    return value;
  }
}

export function isInputEvent(event, debug = false) {
  // e.g. Upload dialog needs to be able to accept paste events
  if (get(uploadingDialogOpen)) {
    if (debug) console.log("isInputEvent true (uploading)");
    return true;
  }

  const el = event.target as HTMLElement;

  return isInputElement(el, debug);
}
