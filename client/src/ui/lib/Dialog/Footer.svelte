<script lang="ts">
  let height;
</script>

<r-spacer style="--height: {height}px" />

<r-footer bind:clientHeight={height}>
  <slot />
</r-footer>

<style>
  r-spacer {
    display: block;
    height: var(--height);
  }

  r-footer {
    display: flex;
    justify-content: flex-end;

    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;

    background: #272727;
    color: var(--selected-orange);

    font-size: 10px;
  }
</style>
