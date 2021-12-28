<script lang="ts">
  import { viewport } from "~/stores/viewport";

  export let ecsWorld;

  $: if ($viewport) {
    // CSS3D elements go "behind" the WebGL canvas
    ecsWorld.cssPresentation.setViewport($viewport);
    ecsWorld.cssPresentation.renderer.domElement.style.zIndex = "0";

    // WebGL canvas goes "on top" of CSS3D HTML elements
    ecsWorld.presentation.setViewport($viewport);
    ecsWorld.presentation.renderer.domElement.style.zIndex = "1";

    // HTML2D elements go "above" the WebGL canvas
    ecsWorld.htmlPresentation.setViewport($viewport);
    ecsWorld.htmlPresentation.domElement.style.zIndex = "2";
  }
</script>

<!-- svelte-ignore component-name-lowercase -->
<viewport bind:this={$viewport}>
  <!-- The CSS3DRenderer container div goes here -->
  <!-- The WebGLRenderer container canvas goes here -->
  <!-- The Html2D container div hoes here -->
</viewport>

<style>
  viewport {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
