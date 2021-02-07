<script lang="ts">
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import { worldState } from "~/stores/worldState";
  import { worldManager as wm } from "~/stores/worldManager";

  let loading, low, high;
  $: if ($wm) {
    loading = $wm.loading.state;
    low = $wm.loading.loaded;
    high = $wm.loading.max;
  } else {
    low = writable(0);
    high = writable(1);
  }

  let m = 0,
    n = 1;
  $: m = $low || 0;
  $: n = $high || 1;
</script>

{#if $worldState === "loading"}
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
    background: rgba(45, 45, 45, 1);
  }

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
