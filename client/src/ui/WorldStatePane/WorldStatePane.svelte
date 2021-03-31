<script lang="ts">
  import Pane from "./Pane.svelte";

  import { subrelm } from "~/stores/subrelm";
  import { connection, yConnectStatus } from "~/stores/connection";
  import { viewport, size, scale } from "~/stores/viewport";
  import { world } from "~/stores/world";
  import { worldState } from "~/stores/worldState";
  import {
    loaded,
    maximum,
    entitiesLoaded,
    entitiesMaximum,
    assetsLoaded,
    assetsMaximum,
  } from "~/stores/loading";

  let subtitle;
  let minimized = true;

  const getSubtitle = (status, subrelm) => {
    // prettier-ignore
    switch (status) {
      case 'connected':    return `connected (${subrelm})`
      case 'connecting':   return `connecting...`
      case 'disconnected': return `disconnected`
    }
  };

  $: subtitle = getSubtitle($yConnectStatus, $subrelm);

  let vw;
  $: vw = $size ? `(${$size.width},${$size.height})` : "";
</script>

<div class:connected={$yConnectStatus === "connected"}>
  <Pane title="Status" {subtitle} showMinimize={true} bind:minimized>
    <table>
      <tr><th>world:</th><td>{$worldState}</td></tr>
      <tr><th>loading:</th><td>{$loaded}/{$maximum}</td></tr>
      <tr><th>(assets):</th><td>{$assetsLoaded}/{$assetsMaximum}</td></tr>
      <tr><th>(entities):</th><td>{$entitiesLoaded}/{$entitiesMaximum}</td></tr>
      <tr><th>connection:</th><td>{$connection.state}</td></tr>
      <tr><th>physics:</th><td>{$world !== null}</td></tr>
      <tr><th>viewport:</th><td>{$viewport !== null} {vw})</td></tr>
    </table>
  </Pane>
</div>

<style>
  div {
    min-width: 200px;
    display: flex;
    --pane-width: 180px;
  }
  div.connected {
    --subtitle-color: rgba(0, 210, 24, 1);
  }
  table {
    color: white;
    margin: 8px;
  }
  th {
    text-align: right;
    padding-right: 4px;
  }
</style>
