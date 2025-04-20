<script lang="ts">
export let tint = true
export let align
</script>

<r-tint
  on:click
  style="--alignment: {align}; --tint: {tint
    ? 'rgba(0, 0, 0, 0.8)'
    : 'transparent'}"
>
  <slot />
</r-tint>

<style>
  r-tint {
    display: flex;
    justify-content: var(--alignment, center);
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 200;

    background: var(--tint);
  }
</style>
