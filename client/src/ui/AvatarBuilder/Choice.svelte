<script>
  export let src;
  export let selected = false;

</script>

<div class:selected on:click>
  <img {src} width="24" height="24" alt="choice" />
</div>

<style>
  div {
    width: 24px;
    height: 24px;
    border: 2px solid black;
    border-radius: 100%;
  }
  .selected {
    box-shadow: 0px 0px 0px 4px var(--selected-red)
  }

</style>
