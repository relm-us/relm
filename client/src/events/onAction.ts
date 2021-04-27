import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";

export function onAction() {
  const $Relm = get(Relm);
  // TODO: avatar menu
}
