<script>
  import { createEventDispatcher } from "svelte";
  import { worldManager as wm } from "~/stores/worldManager";
  import { makeLabel } from "~/prefab";
  import { chatOpen } from "~/stores/chatOpen";

  const dispatch = createEventDispatcher();

  let inputEl;

  chatOpen.subscribe(($chatOpen) => {
    if (!inputEl) return;
    if ($chatOpen) inputEl.focus();
    else inputEl.blur();
  });

  function createLabel(text) {
    const position = $wm.avatar.getByName("WorldTransform").position;
    const label = makeLabel($wm.world, {
      x: position.x,
      z: position.z,
      content: text,
    }).activate();
    $wm.wdoc.syncFrom(label);
  }

  function addMessage(text) {
    if (text.match(/^\s*$/)) {
      dispatch("close");
    } else {
      $wm.chat.addMessage({ u: $wm.wdoc.ydoc.clientID, c: text });
    }
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      dispatch("close");
    } else if (event.key === "Enter" || event.key === "Return") {
      addMessage(event.target.value);
      // createLabel(event.target.value);
      event.target.value = "";
    }
  }

  function onBlur(event) {
    dispatch("close");
  }
</script>

<entry>
  <input
    type="text"
    on:blur={onBlur}
    on:keydown={onKeydown}
    bind:this={inputEl}
  />
</entry>

<style>
  entry {
    display: block;
    overflow: hidden;
  }

  input {
    border: 2px solid cornflowerblue;
    border-radius: 4px;
    width: 300px;
    font-size: 20px;
    line-height: 32px;
  }
  input:focus {
    outline: none;
  }
</style>
