<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { Relm } from "~/stores/Relm";
  import { subrelm, entryway } from "~/stores/subrelm";
  import { connection, yConnectStatus } from "~/stores/connection";
  import { viewport, size, scale } from "~/stores/viewport";
  import { world } from "~/stores/world";
  import { worldState } from "~/stores/worldState";
  import { avPermission } from "~/stores/avPermission";
  import { roomConnectState } from "~/av/stores/roomConnectState";
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

  const getSubtitle = (status) => {
    // prettier-ignore
    switch (status) {
      case 'connected':    return `connected`
      case 'connecting':   return `connecting...`
      case 'disconnected': return `disconnected`
    }
  };

  $: subtitle = getSubtitle($yConnectStatus);

  let vw;
  $: vw = $size ? `(${$size.width},${$size.height})` : "";

  let synced = false;
  let idActive = 0;
  let idTotal = 0;

  onMount(() => {
    const interval = setInterval(() => {
      if (!$Relm) return;

      if ($Relm.identities.isSynced !== synced)
        synced = $Relm.identities.isSynced;

      if ($Relm.identities.active !== idActive)
        idActive = $Relm.identities.active;

      if ($Relm.identities.total !== idTotal) idTotal = $Relm.identities.total;
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<container class:connected={$yConnectStatus === "connected"}>
  <Pane title="Status" {subtitle} showMinimize={true} bind:minimized>
    <table>
      <tr><th>subrelm:</th><td>{$subrelm}</td></tr>
      <tr><th>entryway:</th><td>{$entryway}</td></tr>
      <tr><th>world-status:</th><td>{$worldState}</td></tr>
      <tr><th>media-status:</th><td>{$roomConnectState}</td></tr>
      <tr><th>yjs-status:</th><td>{$connection.state}</td></tr>
      {#if $connection.state === "connected"}
        <tr><th>yjs-room:</th><td>{$connection.room}</td></tr>
      {/if}
      <tr>
        <th>audio/video:</th>
        <td>
          A: {$avPermission.audio}, V: {$avPermission.video}, {$avPermission.done
            ? "DONE"
            : "none"}
        </td>
      </tr>
      <tr>
        <th>loading:</th>
        <td>
          {$loaded}/{$maximum}
          (Ent: {$entitiesLoaded}/{$entitiesMaximum}) (Ast: {$assetsLoaded}/{$assetsMaximum})
        </td>
      </tr>
      <tr><th>physics:</th><td>{$world !== null}</td></tr>
      <tr><th>viewport:</th><td>{$viewport !== null} {vw}</td></tr>
      <tr>
        <th>identities:</th>
        <td>{idActive} / {idTotal} ({synced ? "sync" : ""})</td>
      </tr>
    </table>
  </Pane>
</container>

<style>
  container {
    display: flex;
    min-width: 180px;
    --pane-width: 160px;
  }
  container.connected {
    --subtitle-color: rgba(0, 210, 24, 1);
  }
  table {
    color: white;
    margin: 8px;
  }
  th {
    text-align: right;
    padding-right: 4px;
    vertical-align: top;
  }
  td {
    max-width: 240px;
    vertical-align: top;
  }
</style>
