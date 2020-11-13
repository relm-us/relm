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
    display: block;
    padding: 4px 16px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    font-weight: bold;
    color: #eb4;
    letter-spacing: 0.5px;
  }
</style>

<pane>
  {#if title}
    <lbl>{title}</lbl>
  {/if}
  <slot />
</pane>
