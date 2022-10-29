<script lang="ts">
  export let title = null;
  export let viewBox;
</script>

<svg xmlns="http://www.w3.org/2000/svg" {viewBox} class={$$props.class}>
  {#if title}
    <title>{title}</title>
  {/if}
  <slot />
</svg>

<style>
  svg {
    stroke: currentColor;
    fill: currentColor;
    stroke-width: 0;
    width: 100%;
    height: auto;
    max-height: 100%;
  }
</style>
