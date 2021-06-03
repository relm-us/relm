<script>
  export let value = "black";
  export let border = "white";

</script>

<div style="--value: {value}; --border: {border}" />

<style>
  div {
    width: 16px;
    height: 16px;
    background-color: var(--value);
    border-color: var(--border);
    border-width: 2px;
    border-radius: 4px;
    transform: translateX(-50%);
    margin-top: 4px;
  }

</style>
