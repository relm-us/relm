<script>
  export let enabled = true;

  export let tip = "";
  export let active = false;
  export let bg = null;
  export let color = null;

  export let top = false;
  export let right = false;
  export let bottom = false;
  export let left = false;

  let style = `background-color: ${
    bg || "var(--background-transparent-gray)"
  }; color: ${color || "var(--foreground-white)"}`;
</script>

<div class="tooltip-wrapper">
  <span class="tooltip-slot">
    <slot />
  </span>
  {#if enabled}
    <div
      class="tooltip"
      class:active
      class:left
      class:right
      class:bottom
      class:top
    >
      {#if tip}
        <div class="default-tip" {style}>{tip}</div>
      {:else}
        <slot name="custom-tip" />
      {/if}
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }
  .tooltip {
    position: absolute;
    font-family: inherit;
    display: inline-block;
    white-space: nowrap;
    color: inherit;
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;
    z-index: 3;
  }

  .default-tip {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 6px;
    color: inherit;
  }

  .tooltip.top {
    left: 50%;
    top: 0;
    transform: translate(-50%, -100%);
    margin-top: -4px;
  }

  .tooltip.bottom {
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 100%);
    /* margin-bottom: -8px; */
  }

  .tooltip.left {
    left: 0;
    transform: translateX(-100%);
    margin-left: -8px;
  }

  .tooltip.right {
    right: 0;
    transform: translateX(100%);
    margin-right: -8px;
  }
  .tooltip.bottom.right {
    right: 0;
    bottom: 0;
    transform: translateY(100%);
  }
  .tooltip.bottom.left {
    left: 100%;
    bottom: 0;
    transform: translate(-100%, 100%);
  }

  .tooltip.active {
    opacity: 1;
    visibility: initial;
  }

  .tooltip-slot:hover + .tooltip {
    opacity: 1;
    visibility: initial;
  }
</style>
