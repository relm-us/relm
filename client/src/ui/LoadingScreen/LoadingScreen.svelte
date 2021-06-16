<script lang="ts">
  import PageOverlay from "~/ui/lib/PageOverlay";
  import { loaded, maximum } from "~/stores/loading";

</script>

<PageOverlay zIndex={3} justify="center">
  <container>
    <img src="/loading.png" alt="Loading" />
    <progress-bar style="--percent:{($loaded / $maximum) * 140}%" />
  </container>
</PageOverlay>

<style>
  container {
    display: block;
    position: relative;
    width: 263px;
    height: 122px;
  }

  img {
    position: absolute;
    left: 0;
    bottom: 0px;
    width: 263px;
    height: 122px;
  }

  progress-bar {
    position: absolute;
    bottom: 2px;
    left: 0;
    width: 100%;
    height: 35px;
    background: rgb(242, 156, 88);
    background: linear-gradient(
      180deg,
      rgba(242, 156, 88, 1) 0%,
      rgba(220, 219, 167, 1) 100%
    );
    clip-path: circle(var(--percent) at left);
    border-radius: 16px;
    z-index: -1;
  }

</style>
