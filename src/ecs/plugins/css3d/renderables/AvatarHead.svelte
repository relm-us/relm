<script lang="ts">
  export let width: number;
  export let height: number;
</script>

<style>
  div {
    display: flex;
    overflow: hidden;
    /* width: var(--width);
    height: var(--height); */

    border-radius: 100%;
    border: 2px solid #8daeff;
  }
  img {
    object-fit: contain;
  }
</style>

<div style="--width: {width}px; --height: {height}px">
  <img src="/default-profile.jpg" alt="Head" />
</div>
