<script lang="ts">
  import { isInputEvent } from "./isInputEvent";

  import PointerListener from "./PointerListener";
  import WheelListener from "./WheelListener";
  import CopyPasteListener from "./CopyPasteListener";

  export let world;
  export let permits;

  import * as arrowKeys from "./handlers/arrowKeys";
  import * as debugKey from "./handlers/debugKey";
  import * as deleteKey from "./handlers/deleteKey";
  import * as enterKey from "./handlers/enterKey";
  import * as escapeKey from "./handlers/escapeKey";
  import * as numberKeys from "./handlers/numberKeys";
  import * as pauseKey from "./handlers/pauseKey";
  import * as shiftKey from "./handlers/shiftKey";
  import * as spaceKey from "./handlers/spaceKey";
  import * as tabKey from "./handlers/tabKey";
  import * as undoRedoKeys from "./handlers/undoRedoKeys";

  function onKeydown(event) {
    if (isInputEvent(event)) return;

    arrowKeys.onKeydown(event);
    debugKey.onKeydown(event);
    deleteKey.onKeydown(event);
    enterKey.onKeydown(event);
    escapeKey.onKeydown(event);
    numberKeys.onKeydown(event);
    pauseKey.onKeydown(event);
    shiftKey.onKeydown(event);
    spaceKey.onKeydown(event);
    if (permits.includes("edit")) {
      tabKey.onKeydown(event);
    }
    undoRedoKeys.onKeydown(event);
  }

  function onKeyup(event) {
    arrowKeys.onKeyup(event);
    debugKey.onKeyup(event);
    deleteKey.onKeyup(event);
    enterKey.onKeyup(event);
    escapeKey.onKeyup(event);
    numberKeys.onKeyup(event);
    pauseKey.onKeyup(event);
    shiftKey.onKeyup(event);
    spaceKey.onKeyup(event);
    tabKey.onKeyup(event);
    undoRedoKeys.onKeyup(event);
  }
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />

<PointerListener {world} />
<WheelListener {world} />
<CopyPasteListener />
