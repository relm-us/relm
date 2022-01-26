<script lang="ts">
  import { Dispatch } from "~/main/ProgramTypes";

  import PageOverlay from "~/ui/lib/PageOverlay";

  export let dispatch: Dispatch;
  export let assetsCount;
  export let assetsMax;
  export let entitiesCount;
  export let entitiesMax;

  let progress;
  $: progress = (entitiesCount / entitiesMax + assetsCount / assetsMax) / 2;

  let showCounts = false;

  let clickCount = 0;
  function click() {
    ++clickCount;

    if (clickCount == 1) {
      showCounts = true;
    } else if (clickCount == 5) {
      // Force entry; useful for debugging & getting relms with stale stats to load
      dispatch({ id: "recomputeWorldDocStats" });
      dispatch({ id: "loaded" });
      dispatch({ id: "assumeOriginAsEntryway" });
    }
  }
</script>

<PageOverlay zIndex={3} justify="center">
  <container on:click={click}>
    <img src="/loading.png" alt="Loading" />
    <progress-bar style="--percent:{progress * 140}%" />
  </container>
  {#if showCounts}
    <r-stats>
      <r-stat>{entitiesCount} / {entitiesMax}</r-stat>
      <r-stat>{assetsCount} / {assetsMax}</r-stat>
    </r-stats>
  {/if}
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

  r-stats {
    display: flex;
    width: 263px;
    justify-content: space-between;
    margin-top: 6px;
  }
  r-stat {
    color: #bbb;
    font-size: 9px;
  }
</style>
