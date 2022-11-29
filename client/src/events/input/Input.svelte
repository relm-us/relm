<script lang="ts">
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  import { callEach } from "~/utils/callEach";
  import { worldUIMode } from "~/stores/worldUIMode";

  import { getCanonicalAction } from "./comboTable";
  import { isInputEvent } from "./isInputEvent";

  import PointerListener from "./PointerListener";
  import WheelListener from "./WheelListener";
  import CopyPasteListener from "./CopyPasteListener";

  import * as arrowKeys from "./handlers/arrowKeys";
  import * as buildKey from "./handlers/buildKey";
  import * as debugKey from "./handlers/debugKey";
  import * as deleteKey from "./handlers/deleteKey";
  import * as enterKey from "./handlers/enterKey";
  import * as escapeKey from "./handlers/escapeKey";
  import * as numberKeys from "./handlers/numberKeys";
  import * as pauseKey from "./handlers/pauseKey";
  import * as qeKeys from "./handlers/qeKeys";
  import * as shiftKey from "./handlers/shiftKey";
  import * as spaceKey from "./handlers/spaceKey";
  import * as tabKey from "./handlers/tabKey";
  import * as undoRedoKeys from "./handlers/undoRedoKeys";
  import { pressed } from "./pressed";

  export let world;

  function getActionFromEvent(event: KeyboardEvent) {
    const mods = [];

    if (event.altKey) mods.push("A");
    if (event.ctrlKey) mods.push("C");
    if (event.metaKey) mods.push("M");
    // Note: "Shift" key combinations disabled now, as they interfere with running & shift + click

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
    if (isInputEvent(event)) {
      return;
    }

    if (
      event.repeat ||
      /* workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1594003 */
      pressed.has(event.key.toLowerCase())
    ) {
      return;
    }

    pressed.add(event.key.toLowerCase());

    const action = getActionFromEvent(event);
    if (action) {
      action(true);
      event.preventDefault();
    }
  }

  function onKeyup(event) {
    pressed.delete(event.key.toLowerCase());

    const action = getActionFromEvent(event);
    if (action) action(false);
  }

  onMount(() => {
    const unregisters = [
      arrowKeys.register(),
      buildKey.register(),
      debugKey.register(),
      deleteKey.register(),
      enterKey.register(),
      escapeKey.register(),
      numberKeys.register(),
      pauseKey.register(),
      qeKeys.register(),
      shiftKey.register(),
      spaceKey.register(),
      tabKey.register(),
      undoRedoKeys.register(),
    ];

    return () => callEach(unregisters);
  });
</script>

<svelte:window on:keydown={onKeydown} on:keyup={onKeyup} />

<PointerListener />
<WheelListener {world} />
<CopyPasteListener />
