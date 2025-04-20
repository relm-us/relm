import { get } from "svelte/store"
import { firstFocusElement } from "~/stores/firstFocusElement"
import { registerAction } from "../comboTable"
import { isInputElement } from "../isInputEvent"

export function register(): Function {
  return registerAction(["play", "build"], ["tab"], (pressed, options) => {
    if (pressed && !isInputElement(document.activeElement, true)) {
      get(firstFocusElement)?.focus()
    }
  })
}
