<script lang="ts">
  export let name;
  export let highlighted = false;
</script>

<div class:highlighted on:click>{name}</div>

<style>
  div {
    background-color: var(--unselected-gray);
    line-height: 26px;
    font-size: 16px;
    width: 100%;
    text-align: center;
    margin-top: 4px;

    cursor: pointer;
  }
  div.highlighted {
    background-color: var(--selected-red);
  }
</style>
