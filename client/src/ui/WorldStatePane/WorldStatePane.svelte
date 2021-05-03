<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { audioRequested, videoRequested } from "video-mirror";
  import { mediaSetupState } from "~/stores/mediaSetupState";

  import { Relm } from "~/stores/Relm";
  import { subrelm, entryway } from "~/stores/subrelm";
  import { connection, yConnectStatus } from "~/stores/connection";
  import { viewport, size, scale } from "~/stores/viewport";
  import { world } from "~/stores/world";
  import { worldState } from "~/stores/worldState";
  import { roomConnectState } from "~/av/stores/roomConnectState";
  import {
    loadingState,
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

  let showAbbreviatedRoom = true;
  function toggleRoom() {
    showAbbreviatedRoom = !showAbbreviatedRoom;
  }

  let idActive = 0;
  let idTotal = 0;

  onMount(() => {
    const interval = setInterval(() => {
      if (!$Relm) return;

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
      <tr><th>world state:</th><td>{$worldState}</td></tr>
      <tr><th>conference state:</th><td>{$roomConnectState}</td></tr>
      <tr><th>yjs state:</th><td>{$connection.state}</td></tr>
      {#if $connection.state === "connected"}
        <tr>
          <th>yjs room:</th>
          <td>
            {#if showAbbreviatedRoom}
              <button on:click={toggleRoom}>
                {$connection.room.split("-")[0]}...
              </button>
            {:else}
              {$connection.room}
            {/if}
          </td>
        </tr>
      {/if}
      <tr>
        <th>media setup</th>
        <td> {$mediaSetupState} </td>
      </tr>
      <tr>
        <th>audio</th>
        <td> {$audioRequested} </td>
      </tr>
      <tr>
        <th>video</th>
        <td> {$videoRequested} </td>
      </tr>
      <tr>
        <th>loading:</th>
        <td>
          {$loadingState}
          {$loaded}/{$maximum}
          <div>(Ent: {$entitiesLoaded}/{$entitiesMaximum})</div>
          <div>(Ast: {$assetsLoaded}/{$assetsMaximum})</div>
        </td>
      </tr>
      <tr><th>physics:</th><td>{$world !== null}</td></tr>
      <tr><th>viewport:</th><td>{$viewport !== null} {vw}</td></tr>
      <tr>
        <th>identities:</th>
        <td>{idActive} / {idTotal}</td>
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
    width: 240px;
  }
  th {
    text-align: right;
    padding-right: 4px;
    vertical-align: top;
    width: 50%;
  }
  td {
    vertical-align: middle;
    width: 50%;
    font-family: monospace;
    color: gold;
    padding-top: 1px;
  }
</style>
