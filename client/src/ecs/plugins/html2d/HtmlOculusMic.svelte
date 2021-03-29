<script>
  export let muted = false;
</script>

<button class:muted on:click>
  <slot />
</button>

<style>
  button {
    all: unset;

    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translate(-50%);

    width: 24px;
    height: 24px;

    color: #cccccc;
    background-color: #333333;

    overflow: hidden;
    border: 2px solid #cccccc;
    border-radius: 100%;
  }

  button.muted {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
</style>
