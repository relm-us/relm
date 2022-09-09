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

  div:hover img {
    filter: brightness(1);
  }
  img {
    filter: brightness(0.85);
  }
  .selected {
    box-shadow: 0px 0px 0px 4px var(--selected-orange);
  }
  .selected:hover {
    box-shadow: 0px 0px 0px 4px var(--selected-orange-hover);
  }
</style>
