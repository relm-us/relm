<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { audioRequested, videoRequested } from "video-mirror";
  import { mediaSetupState } from "~/stores/mediaSetupState";

  import { Relm } from "~/stores/Relm";
  import { subrelm, entryway } from "~/stores/subrelm";
  import {
    connection,
    yConnectState,
    yLoadingState,
  } from "~/stores/connection";
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

  let minimized = true;

  let vw;
  $: vw = $size ? `(${$size.width},${$size.height})` : "";

  let showAbbreviatedRoom = true;
  function toggleRoom() {
    showAbbreviatedRoom = !showAbbreviatedRoom;
  }

  let showAbbreviatedIdentities = true;
  function toggleIdentities() {
    showAbbreviatedIdentities = !showAbbreviatedIdentities;
  }

  let idActive = 0;
  let idTotal = 0;
  let identities = [];

  onMount(() => {
    const interval = setInterval(() => {
      if (!$Relm || minimized) return;

      if ($Relm.identities.active !== idActive)
        idActive = $Relm.identities.active;

      if ($Relm.identities.total !== idTotal) idTotal = $Relm.identities.total;

      identities = [...$Relm.identities.identities.values()];
    }, 1000);
    return () => clearInterval(interval);
  });

</script>

<container class:connected={$yConnectState === "connected"}>
  <Pane
    title="Status"
    subtitle={$yConnectState}
    showMinimize={true}
    bind:minimized
  >
    <table>
      <tr><th>subrelm:</th><td>{$subrelm}</td></tr>
      <tr><th>entryway:</th><td>{$entryway}</td></tr>
      <tr><th>world state:</th><td>{$worldState}</td></tr>
      <tr><th>conference:</th><td>{$roomConnectState}</td></tr>
      <tr><th>yjs:</th><td>{$connection.state}<br />{$yLoadingState}</td></tr>
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

      {#if showAbbreviatedIdentities}
        <tr>
          <th>identities:</th>
          <td>
            <button on:click={toggleIdentities}>
              {idActive} / {idTotal}
            </button>
          </td>
        </tr>
      {:else}
        <tr>
          <th>identities:</th>
          <td />
        </tr>
        {#each identities as identity}
          <tr class="identity-row">
            <th>{identity.get("name")}</th>
            <td>
              {identity.isLocal
                ? "(local)"
                : Math.floor(identity.seenAgo / 1000) + "s"}
              [{identity.get("clientId")}]
              {identity.playerId}
            </td>
          </tr>
        {/each}
      {/if}
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
  .identity-row th,
  .identity-row td {
    font-size: 10px;
  }

</style>
