<script lang="ts">
  export let title;
</script>

<style>
  pane {
    border: 1px solid black;
    border-radius: 5px;

    margin: 8px 16px;
  }

  lbl {
    background-color: rgba(255, 255, 255, 0.25);
    color: #333;
    display: block;
    padding: 4px 16px;

    font-weight: bold;
  }
</style>

<pane>
  {#if title}
    <lbl>{title}</lbl>
  {/if}
  <slot />
</pane>
