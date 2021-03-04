import { get } from "svelte/store";
import { Relm } from "~/stores/Relm";
import { selectedEntities } from "~/stores/selection";
import { chatOpen } from '~/stores/chatOpen'
import { mode } from '~/stores/mode'


export function onEscape() {
  const $Relm = get(Relm);
  const selected = get(selectedEntities)
  if (selected.size > 0) {
    $Relm.selection.clear()
  } else if (get(chatOpen)) {
    chatOpen.set(false)
  } else if (get(mode) !== 'play') {
    mode.set('play')
  }
}
