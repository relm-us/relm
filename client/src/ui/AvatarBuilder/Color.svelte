<script>
export let value = "#000000"
export let selected = false
</script>

<div class:selected on:click>
  <swatch style="--value: {value}" />
</div>

<style>
  div {
    margin-top: 4px;
    border-radius: 4px;
  }
  div.selected {
    box-shadow: 0px 0px 0px 4px var(--selected-orange);
    z-index: 1;
  }
  div.selected:hover {
    box-shadow: 0px 0px 0px 4px var(--selected-orange-hover);
  }
  swatch {
    display: block;
    background-color: var(--value);
    width: 24px;
    height: 24px;
    border: 2px solid black;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
