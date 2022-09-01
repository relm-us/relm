<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let enabled = false;
  export let labelOn = "On";
  export let labelOff = "Off";
  export let small = false;

  const toggle = () => {
    enabled = !enabled;
    dispatch("change", enabled);
  };
</script>

<container on:mousedown|stopPropagation={toggle} class:enabled>
  <lbl on:mousedown|preventDefault class:small>
    {#if enabled}{labelOn}{:else}{labelOff}{/if}
  </lbl>

  <toggle class:small>
    <knob />
  </toggle>
</container>

<style>
  container {
    display: flex;
    align-items: center;
  }

  toggle {
    position: relative;
    display: block;
    flex-shrink: 0;
    width: 48px;
    height: 24px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 32px;
    background-color: rgba(0, 0, 0, 0.5);
  }

  toggle.small {
    transform: scale(65%);
  }

  .enabled toggle {
    background-color: rgba(200, 200, 200, 0.35);
  }

  knob {
    position: relative;
    display: block;
    width: 18px;
    height: 18px;
    top: 2px;
    left: 2px;
    background-color: rgba(200, 200, 200, 1);
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 100%;
  }

  .enabled knob {
    left: 26px;
    background-color: var(--enabled-green, green);
  }

  lbl {
    margin-right: 12px;
    cursor: default;
  }

  lbl.small {
    margin-right: 0px;
  }
</style>
