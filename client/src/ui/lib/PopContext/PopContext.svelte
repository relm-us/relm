<script lang="ts">
import Portal from "~/ui/lib/Portal.svelte"

export let width: number = 120
export let x: number
export let y: number
export let triangleBottom: boolean = true
</script>

<Portal>
  <r-pop-context
    class:triangleBottom
    style="--width: {width}px; --x: {x}px; --y: {y}px;"
  >
    <slot />
  </r-pop-context>
</Portal>

<style>
  /* Taken from: https://sharkcoder.com/visual/shapes */
  r-pop-context {
    display: block;

    position: absolute;
    left: var(--x);
    top: var(--y);
    z-index: 5;

    /* margin-bottom: 100%; */
    transform: translate(-50%, -100%);

    width: var(--width);
    padding: 8px 10px 8px 8px;
    border-radius: 10px;

    color: var(--foreground-white, white);
    background: var(--background-transparent-gray, black);
  }

  r-pop-context.triangleBottom::after {
    content: "";

    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 0;

    border: 13px solid transparent;
    border-top-color: var(--background-transparent-gray, black);
    border-bottom: 0;

    margin-left: -13px;
    margin-bottom: -13px;
  }
</style>
