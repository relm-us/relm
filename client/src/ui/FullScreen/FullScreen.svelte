<script>
  import { fade } from "svelte/transition";

</script>

<loading transition:fade>
  <slot />
</loading>

<style>
  loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 3;

    background: rgba(45, 45, 45, 1);
  }

</style>
