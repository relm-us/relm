<script>
  export let cursor = "default";
</script>

<style>
  value {
    min-width: 24px;
    margin: 4px 8px 4px 0px;
    padding: 2px 10px 2px 10px;

    border-radius: 4px;

    font-size: 12px;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;

    cursor: var(--cursor);
  }
</style>

<value on:mousedown style={`cursor: ${cursor}`}>
  <slot />
</value>
