<script lang="ts">
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import { worldState } from "~/stores/worldState";
  import { worldManager as wm } from "~/stores/worldManager";

  let loading, low, high;
  $: if ($wm) {
    loading = $wm.loading.state;
    low = $wm.loading.assetsLoaded;
    high = $wm.loading.assetsMax;
  } else {
    low = writable(0);
    high = writable(1);
  }

  let m = 0,
    n = 1;
  $: m = $low || 0;
  $: n = $high || 1;
</script>

{#if $loading !== "done"}
  <loading transition:fade>
    <container>
      <img src="/loading.png" alt="Loading" />
      <progress-bar style="--percent:{(m / n) * 140}%" />
    </container>
  </loading>
{/if}

<style>
  loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 2;

    font-size: 4vw;
    color: black;
    background-color: rgba(45, 45, 45, 1);
  }

  container {
    display: block;
    position: relative;
  }

  img {
    width: 263px;
    height: 122px;
  }

  progress-bar {
    position: absolute;
    bottom: 10px;
    left: 0;
    width: 100%;
    height: 35px;
    background-color: rgba(241, 157, 90, 1);
    clip-path: circle(var(--percent) at left);
    border-radius: 16px;
    z-index: -1;
  }
</style>
