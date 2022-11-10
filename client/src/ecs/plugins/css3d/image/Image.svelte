<script lang="ts">
  export let src;
  export let fit: "CONTAIN" | "COVER" = "CONTAIN";
  export let alt = "image";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<img
  class:cover={fit === "COVER"}
  class:contain={fit === "CONTAIN"}
  {src}
  {alt}
  on:pointerdown
  on:mousedown|preventDefault
  on:click
/>

<style>
  img {
    width: 100%;
    height: 100%;

    pointer-events: all;

    /* For `alt` text */
    text-align: center;
  }

  /* For `alt` text, when image can't load */
  img::before {
    line-height: 3em;
    background: white;
    color: black;
    font-size: 28px;
  }

  img.cover {
    object-fit: cover;
  }

  img.contain {
    object-fit: contain;
  }
</style>
