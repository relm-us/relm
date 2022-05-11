<script lang="ts">
  // width / height ratio
  export let ratio = 1.0;
</script>

<!-- <r-ratio-container style="padding-bottom: {100.0 / ratio}%;"> -->
<r-square>
  <r-child>
    <slot />
  </r-child>
</r-square>

<style>
  r-square {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-child {
    display: block;
    width: 100vmin;
    height: 100vmin;
    position: relative;
  }
</style>
