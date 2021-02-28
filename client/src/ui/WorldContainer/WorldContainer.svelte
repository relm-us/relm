<script lang="ts">
  import { viewport } from "~/stores/viewport";
</script>

<!-- svelte-ignore component-name-lowercase -->
<viewport bind:this={$viewport}>
  <!-- The CSS3DRenderer container goes here -->
  <!-- The WebGLRenderer canvas goes here -->
  <!-- The Html2D container hoes here -->
</viewport>

<style>
  viewport {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
