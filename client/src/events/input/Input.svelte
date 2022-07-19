<script lang="ts">
  import { worldUIMode } from "~/stores/worldUIMode";

  import { isInputEvent } from "./isInputEvent";

  import PointerListener from "./PointerListener";
  import WheelListener from "./WheelListener";
  import CopyPasteListener from "./CopyPasteListener";

  export let world;
  export let permits;

  import * as arrowKeys from "./handlers/arrowKeys";
  import * as debugKey from "./handlers/debugKey";
  import * as deleteKey from "./handlers/deleteKey";
  import * as dropKey from "./handlers/dropKey";
  import * as enterKey from "./handlers/enterKey";
  import * as escapeKey from "./handlers/escapeKey";
  import * as numberKeys from "./handlers/numberKeys";
  import * as pauseKey from "./handlers/pauseKey";
  import * as shiftKey from "./handlers/shiftKey";
  import * as spaceKey from "./handlers/spaceKey";
  import * as tabKey from "./handlers/tabKey";
  import * as undoRedoKeys from "./handlers/undoRedoKeys";
  import { getCanonicalAction } from "./comboTable";
  import { get } from "svelte/store";

  arrowKeys.register();
  debugKey.register();
  deleteKey.register();
  dropKey.register();
  enterKey.register();
  escapeKey.register();
  numberKeys.register();
  pauseKey.register();
  spaceKey.register();
  tabKey.register();
  undoRedoKeys.register();

  function getActionFromEvent(event: KeyboardEvent) {
    const mods = [];

    if (event.altKey) mods.push("A");
    if (event.ctrlKey) mods.push("C");
    if (event.metaKey) mods.push("M");
    if (event.shiftKey) mods.push("S");

    let combo = mods.join("-");

    if (combo.length > 0) combo += " ";

    if (event.key === " ") {
      // treat ' ' specially, since we use whitespace to parse key combos
      combo += "space";
    } else {
      combo += event.key.toLowerCase();
    }

    return getCanonicalAction(get(worldUIMode), combo);
  }

  function onKeydown(event: KeyboardEvent) {
    if (isInputEvent(event)) return;

    const action = getActionFromEvent(event);
    if (action) {
      action(true, { permits });
      event.preventDefault();
    }

    shiftKey.onKeydown(event);
  }

  function onKeyup(event) {
    const action = getActionFromEvent(event);
    if (action) action(false, { permits });

    shiftKey.onKeyup(event);
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />

<PointerListener />
<WheelListener {world} />
<CopyPasteListener />
