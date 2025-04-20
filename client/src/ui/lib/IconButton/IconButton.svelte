<script lang="ts">
export let width = 24
export let height = 24
export let padding = 4
</script>

<button
  on:pointerdown|preventDefault
  on:click
  style="width: {width + padding}px; height: {height + padding}px"
>
  <r-icon style="width: {width}px; height: {height}px">
    <slot />
  </r-icon>
</button>

<style>
  button {
    display: flex;

    justify-content: center;
    align-items: center;

    background: none;
    color: inherit;
    border: 0;
    padding: 0;
  }
  button:hover {
    color: var(--color, var(--foreground-white));
    background-color: rgba(255, 255, 255, 0.35);
    border-radius: 5px;
  }
  r-icon {
    display: block;
  }
</style>
