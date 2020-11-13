<style>
  panel {
    position: fixed;
    z-index: 2;

    display: flex;
    flex-direction: column;

    width: 300px;
    height: 100%;
    left: 0;
    top: 0;

    background-color: rgba(0, 0, 0, 0.85);
    color: #ddd;

    overflow-y: auto;
  }
</style>

<panel>
  <slot />
</panel>
