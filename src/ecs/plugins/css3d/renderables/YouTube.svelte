<script lang="ts">
  export let width;
  export let height;
  export let src;
  export let title = "YouTube Video";
</script>

<style>
  iframe {
    pointer-events: auto;
    z-index: 1;
    position: absolute;
  }
</style>

<!-- TODO: get youtube ready status https://stackoverflow.com/a/45477458/159344 -->
<iframe
  {title}
  {width}
  {height}
  src="{src}?enablejsapi=1"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowfullscreen />
