<script>
  import { createEventDispatcher } from "svelte";
  import { Relm } from "~/stores/Relm";
  import { chatOpen } from "~/stores/chatOpen";
  import { makeLabel } from "~/prefab";
  import { playerId } from "~/identity/playerId";

  const dispatch = createEventDispatcher();

  let inputEl;

  chatOpen.subscribe(($chatOpen) => {
    if (!inputEl) return;
    if ($chatOpen) inputEl.focus();
    else inputEl.blur();
  });

  function createLabel(text) {
    const position = $Relm.avatar.getByName("WorldTransform").position;
    const label = makeLabel($Relm.world, {
      x: position.x,
      z: position.z,
      content: text,
    }).activate();
    $Relm.wdoc.syncFrom(label);
  }

  function addMessage(text) {
    if (text.match(/^\s*$/)) {
      dispatch("close");
    } else {
      $Relm.chat.addMessage({ u: playerId, c: text });
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
