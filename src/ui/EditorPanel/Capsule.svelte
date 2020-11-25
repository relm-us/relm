<script lang="ts">
  export let label: string;
  export let value: any;
  export let editing: boolean;
  export let cursor = "default";

  let inputElement;

  $: if (inputElement && editing) {
    inputElement.focus();
    inputElement.select();
  }
</script>

<style>
  capsule {
    margin: 4px 8px 4px 0px;
    display: flex;
    font-size: 12px;
  }
  lbl {
    padding: 2px 6px 2px 8px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    text-align: right;
    background-color: rgba(255, 255, 255, 0.45);
    color: black;
    font-weight: bold;
  }
  value {
    min-width: 30px;
    padding: 2px 8px 2px 4px;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;

    cursor: var(--cursor);
  }
  value.tag {
    min-width: 48px;
    margin: 4px 8px 4px 0px;
    padding: 2px 8px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  input {
    background-color: rgba(0, 0, 0, 0);
    color: white;
    width: 60px;
    border: 0;
  }
</style>

<capsule>
  {#if label}
    <lbl>{label}</lbl>
  {/if}
  <value class:tag={!label} on:mousedown style={`cursor: ${cursor}`}>
    {#if editing}
      <input bind:this={inputElement} {value} type="number" on:change on:blur />
    {:else}{value}{/if}
  </value>
</capsule>
