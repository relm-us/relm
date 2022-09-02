<r-tint on:click>
  <slot />
</r-tint>

<style>
  r-tint {
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 200;

    background: rgba(0, 0, 0, 0.8);
  }
</style>
